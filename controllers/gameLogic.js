// controllers/gameLogic.js - Lógica Central del Juego Math Ninja

/**
 * GAMELOGIC - Controla el flujo del juego, sincronización y estados
 * 
 * Funcionalidades principales:
 * - Gestionar sesiones de juego
 * - Sincronizar preguntas entre jugadores
 * - Procesar respuestas en tiempo real
 * - Calcular puntuaciones y rankings
 * - Controlar el flujo de rondas
 */

import QuestionBank from './questionBank.js';

class GameLogic {
    constructor() {
        // Almacén de sesiones de juego activas { roomCode: gameSession }
        this.gameSessions = new Map();
        
        // Configuración de timing del juego
        this.timingConfig = {
            questionDisplayTime: 30000,     // 30 segundos por pregunta
            resultDisplayTime: 5000,       // 5 segundos para mostrar resultados
            gameStartDelay: 3000,          // 3 segundos antes de empezar
            betweenQuestionsDelay: 2000    // 2 segundos entre preguntas
        };
        
        // Instancia del banco de preguntas
        this.questionBank = new QuestionBank();
        
        console.log('⚡ [GameLogic] Sistema de lógica de juego inicializado');
    }

    /**
     * Inicializar nueva sesión de juego
     * @param {string} roomCode - Código de la sala
     * @param {Array} players - Lista de jugadores
     * @param {Object} gameSettings - Configuración del juego
     * @returns {Object} Datos de la sesión creada
     */
    initializeGame(roomCode, players, gameSettings = {}) {
        // Crear sesión de juego
        const gameSession = {
            roomCode: roomCode,
            players: [...players], // Copia de los jugadores
            settings: {
                totalQuestions: gameSettings.totalQuestions || 10,
                questionTime: gameSettings.questionTime || 30,
                difficultyLevel: gameSettings.difficultyLevel || 'medium',
                categories: gameSettings.categories || ['arithmetic', 'logic', 'geometry']
            },
            
            // Estado del juego
            status: 'starting',        // 'starting', 'playing', 'waiting_answers', 'showing_results', 'finished'
            currentQuestionIndex: 0,
            currentQuestion: null,
            questions: [],             // Array de preguntas para la sesión
            
            // Respuestas de la ronda actual
            currentRoundAnswers: new Map(), // { playerId: answerData }
            allAnswersReceived: false,
            
            // Resultados y puntuaciones
            playerScores: new Map(),   // { playerId: totalScore }
            roundResults: [],          // Histórico de resultados por ronda
            
            // Timers
            questionTimer: null,
            resultTimer: null,
            
            // Timestamps
            gameStartedAt: null,
            questionStartedAt: null,
            
            // Estadísticas de la sesión
            gameStats: {
                totalQuestionsAnswered: 0,
                averageResponseTime: 0,
                fastestResponse: null,
                slowestResponse: null
            }
        };
        
        // Inicializar puntuaciones de jugadores
        players.forEach(player => {
            gameSession.playerScores.set(player.id, 0);
        });
        
        // Generar preguntas para la sesión
        gameSession.questions = this.generateQuestionSet(gameSession.settings);
        
        // Guardar sesión
        this.gameSessions.set(roomCode, gameSession);
        
        console.log(`🎮 [GameLogic] Juego inicializado para sala ${roomCode} con ${players.length} jugadores`);
        
        return gameSession;
    }

    /**
     * Establecer pregunta actual
     * @param {string} roomCode - Código de la sala
     * @param {Object} question - Datos de la pregunta
     * @returns {boolean} true si se estableció correctamente
     */
    setCurrentQuestion(roomCode, question) {
        const session = this.getGameSession(roomCode);
        
        if (!session) {
            throw new Error(`Sesión de juego no encontrada para sala ${roomCode}`);
        }
        
        session.currentQuestion = question;
        session.questionStartedAt = new Date();
        session.status = 'playing';
        session.currentRoundAnswers.clear();
        session.allAnswersReceived = false;
        
        console.log(`❓ [GameLogic] Pregunta establecida para sala ${roomCode}: ${question.question}`);
        
        return true;
    }

    /**
     * Procesar respuesta de un jugador
     * @param {string} roomCode - Código de la sala
     * @param {string} playerId - ID del jugador
     * @param {string|number} answer - Respuesta del jugador
     * @param {number} timeRemaining - Tiempo restante (segundos)
     * @returns {Object} Resultado del procesamiento
     */
    processAnswer(roomCode, playerId, answer, timeRemaining) {
        const session = this.getGameSession(roomCode);
        
        if (!session) {
            throw new Error(`Sesión de juego no encontrada para sala ${roomCode}`);
        }
        
        if (session.status !== 'playing') {
            throw new Error('El juego no está en estado de recibir respuestas');
        }
        
        if (session.currentRoundAnswers.has(playerId)) {
            throw new Error('El jugador ya respondió esta pregunta');
        }
        
        const currentQuestion = session.currentQuestion;
        if (!currentQuestion) {
            throw new Error('No hay pregunta activa');
        }
        
        // Calcular tiempo de respuesta
        const responseTime = this.calculateResponseTime(session.questionStartedAt);
        
        // Verificar si la respuesta es correcta
        const isCorrect = this.checkAnswer(currentQuestion, answer);
        
        // Calcular puntos obtenidos
        const points = isCorrect ? this.calculateQuestionPoints(
            timeRemaining,
            session.settings.questionTime,
            responseTime,
            currentQuestion.difficulty
        ) : 0;
        
        // Registrar respuesta
        const answerData = {
            playerId: playerId,
            answer: answer,
            isCorrect: isCorrect,
            responseTime: responseTime,
            timeRemaining: timeRemaining,
            pointsEarned: points,
            timestamp: new Date()
        };
        
        session.currentRoundAnswers.set(playerId, answerData);
        
        // Actualizar puntuación del jugador
        const currentScore = session.playerScores.get(playerId) || 0;
        session.playerScores.set(playerId, currentScore + points);
        
        // Actualizar estadísticas de la sesión
        this.updateGameStats(session, answerData);
        
        console.log(`📝 [GameLogic] Respuesta procesada - Jugador: ${playerId}, Correcta: ${isCorrect}, Puntos: ${points}`);
        
        // Verificar si todos los jugadores han respondido
        session.allAnswersReceived = session.currentRoundAnswers.size >= session.players.length;
        
        return {
            isCorrect: isCorrect,
            pointsEarned: points,
            responseTime: responseTime,
            allAnswersReceived: session.allAnswersReceived
        };
    }

    /**
     * Verificar si todos los jugadores han respondido
     * @param {string} roomCode - Código de la sala
     * @returns {boolean} true si todos respondieron
     */
    allPlayersAnswered(roomCode) {
        const session = this.getGameSession(roomCode);
        return session ? session.allAnswersReceived : false;
    }

    /**
     * Obtener resultados de la ronda actual
     * @param {string} roomCode - Código de la sala
     * @returns {Object} Resultados de la ronda
     */
    getRoundResults(roomCode) {
        const session = this.getGameSession(roomCode);
        
        if (!session) {
            throw new Error(`Sesión de juego no encontrada para sala ${roomCode}`);
        }
        
        const currentQuestion = session.currentQuestion;
        const answers = Array.from(session.currentRoundAnswers.values());
        
        // Estadísticas de la ronda
        const correctAnswers = answers.filter(a => a.isCorrect).length;
        const averageResponseTime = answers.reduce((sum, a) => sum + a.responseTime, 0) / answers.length;
        const fastestResponse = Math.min(...answers.map(a => a.responseTime));
        
        // Ranking de jugadores para esta ronda
        const roundRanking = answers
            .sort((a, b) => {
                if (b.isCorrect !== a.isCorrect) return b.isCorrect - a.isCorrect;
                if (b.pointsEarned !== a.pointsEarned) return b.pointsEarned - a.pointsEarned;
                return a.responseTime - b.responseTime;
            })
            .map((answer, index) => ({
                rank: index + 1,
                playerId: answer.playerId,
                isCorrect: answer.isCorrect,
                pointsEarned: answer.pointsEarned,
                responseTime: answer.responseTime,
                currentTotalScore: session.playerScores.get(answer.playerId)
            }));
        
        const roundResult = {
            questionNumber: session.currentQuestionIndex + 1,
            question: currentQuestion,
            correctAnswer: currentQuestion.correctAnswer,
            explanation: currentQuestion.explanation,
            
            // Estadísticas de la ronda
            stats: {
                totalPlayers: session.players.length,
                playersAnswered: answers.length,
                correctAnswers: correctAnswers,
                accuracy: Math.round((correctAnswers / answers.length) * 100),
                averageResponseTime: Math.round(averageResponseTime),
                fastestResponse: fastestResponse
            },
            
            // Rankings
            roundRanking: roundRanking,
            overallRanking: this.getOverallRanking(session)
        };
        
        // Guardar resultado en el histórico
        session.roundResults.push(roundResult);
        session.status = 'showing_results';
        
        console.log(`📊 [GameLogic] Resultados de ronda calculados para sala ${roomCode}`);
        
        return roundResult;
    }

    /**
     * Obtener siguiente pregunta o finalizar juego
     * @param {string} roomCode - Código de la sala
     * @returns {Object|null} Siguiente pregunta o null si terminó
     */
    getNextQuestion(roomCode) {
        const session = this.getGameSession(roomCode);
        
        if (!session) {
            return null;
        }
        
        session.currentQuestionIndex++;
        
        // Verificar si quedan preguntas
        if (session.currentQuestionIndex >= session.questions.length) {
            session.status = 'finished';
            return null;
        }
        
        const nextQuestion = session.questions[session.currentQuestionIndex];
        this.setCurrentQuestion(roomCode, nextQuestion);
        
        return {
            question: nextQuestion,
            questionNumber: session.currentQuestionIndex + 1
        };
    }

    /**
     * Obtener resultados finales del juego
     * @param {string} roomCode - Código de la sala
     * @returns {Object} Resultados finales
     */
    getFinalResults(roomCode) {
        const session = this.getGameSession(roomCode);
        
        if (!session) {
            throw new Error(`Sesión de juego no encontrada para sala ${roomCode}`);
        }
        
        session.status = 'finished';
        
        const finalRanking = this.getOverallRanking(session);
        const gameStats = this.calculateFinalStats(session);
        
        const finalResults = {
            gameId: roomCode,
            totalQuestions: session.questions.length,
            totalPlayers: session.players.length,
            
            // Ranking final
            finalRanking: finalRanking,
            
            // Ganador
            winner: finalRanking[0] || null,
            
            // Estadísticas del juego
            gameStats: gameStats,
            
            // Duración del juego
            gameDuration: this.calculateGameDuration(session),
            
            // Histórico de rondas
            roundHistory: session.roundResults
        };
        
        console.log(`🏆 [GameLogic] Resultados finales calculados para sala ${roomCode}`);
        
        return finalResults;
    }

    /**
     * Obtener sesión de juego
     * @param {string} roomCode - Código de la sala
     * @returns {Object|null} Sesión de juego o null
     */
    getGameSession(roomCode) {
        return this.gameSessions.get(roomCode) || null;
    }

    /**
     * Cerrar sesión de juego
     * @param {string} roomCode - Código de la sala
     * @returns {boolean} true si se cerró correctamente
     */
    closeGameSession(roomCode) {
        const session = this.gameSessions.get(roomCode);
        
        if (!session) {
            return false;
        }
        
        // Limpiar timers activos
        if (session.questionTimer) {
            clearTimeout(session.questionTimer);
        }
        if (session.resultTimer) {
            clearTimeout(session.resultTimer);
        }
        
        this.gameSessions.delete(roomCode);
        
        console.log(`🚪 [GameLogic] Sesión de juego cerrada para sala ${roomCode}`);
        
        return true;
    }

    // ==========================================
    // MÉTODOS AUXILIARES PRIVADOS
    // ==========================================

    /**
     * Generar conjunto de preguntas para la sesión
     * @private
     */
    generateQuestionSet(settings) {
        return this.questionBank.getQuestionSet(
            settings.totalQuestions,
            settings.difficultyLevel,
            settings.categories
        );
    }

    /**
     * Verificar si una respuesta es correcta
     * @private
     */
    checkAnswer(question, answer) {
        // Normalizar respuestas para comparación
        const normalizeAnswer = (ans) => {
            if (typeof ans === 'number') return ans;
            if (typeof ans === 'string') {
                return ans.toLowerCase().trim();
            }
            return String(ans).toLowerCase().trim();
        };
        
        const userAnswer = normalizeAnswer(answer);
        const correctAnswer = normalizeAnswer(question.correctAnswer);
        
        return userAnswer === correctAnswer;
    }

    /**
     * Calcular puntos obtenidos por pregunta
     * @private
     */
    calculateQuestionPoints(timeRemaining, maxTime, responseTime, difficulty) {
        const basePoints = 100;
        
        // Multiplicador por dificultad
        const difficultyMultipliers = {
            easy: 0.8,
            medium: 1.0,
            hard: 1.3
        };
        
        let points = basePoints * (difficultyMultipliers[difficulty] || 1.0);
        
        // Bonus por velocidad (máximo 50% extra)
        const speedRatio = timeRemaining / maxTime;
        const speedBonus = Math.round(points * 0.5 * speedRatio);
        points += speedBonus;
        
        return Math.round(points);
    }

    /**
     * Calcular tiempo de respuesta
     * @private
     */
    calculateResponseTime(questionStartTime) {
        return new Date() - questionStartTime;
    }

    /**
     * Obtener ranking general actual
     * @private
     */
    getOverallRanking(session) {
        return Array.from(session.playerScores.entries())
            .map(([playerId, score]) => {
                const player = session.players.find(p => p.id === playerId);
                return {
                    playerId: playerId,
                    playerName: player ? player.name : 'Desconocido',
                    totalScore: score
                };
            })
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((player, index) => ({
                ...player,
                rank: index + 1
            }));
    }

    /**
     * Actualizar estadísticas de la sesión
     * @private
     */
    updateGameStats(session, answerData) {
        session.gameStats.totalQuestionsAnswered++;
        
        if (!session.gameStats.fastestResponse || answerData.responseTime < session.gameStats.fastestResponse) {
            session.gameStats.fastestResponse = answerData.responseTime;
        }
        
        if (!session.gameStats.slowestResponse || answerData.responseTime > session.gameStats.slowestResponse) {
            session.gameStats.slowestResponse = answerData.responseTime;
        }
    }

    /**
     * Calcular estadísticas finales
     * @private
     */
    calculateFinalStats(session) {
        const allAnswers = session.roundResults.flatMap(round => 
            round.roundRanking.map(rank => ({
                isCorrect: rank.isCorrect,
                responseTime: rank.responseTime
            }))
        );
        
        const correctAnswers = allAnswers.filter(a => a.isCorrect).length;
        const avgResponseTime = allAnswers.reduce((sum, a) => sum + a.responseTime, 0) / allAnswers.length;
        
        return {
            totalAnswers: allAnswers.length,
            correctAnswers: correctAnswers,
            overallAccuracy: Math.round((correctAnswers / allAnswers.length) * 100),
            averageResponseTime: Math.round(avgResponseTime),
            fastestResponse: session.gameStats.fastestResponse,
            slowestResponse: session.gameStats.slowestResponse
        };
    }

    /**
     * Calcular duración del juego
     * @private
     */
    calculateGameDuration(session) {
        if (!session.gameStartedAt) return 0;
        return Math.round((new Date() - session.gameStartedAt) / 1000); // en segundos
    }
}

export default GameLogic;