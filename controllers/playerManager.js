// controllers/playerManager.js - Gestor de Jugadores del Juego Math Battle

/**
 * PLAYERMANAGER - Gestiona la creación, puntuación y estado de los jugadores
 * 
 * Funcionalidades principales:
 * - Crear y validar jugadores
 * - Gestionar puntuaciones y estadísticas
 * - Asignar roles (host/jugador)
 * - Histórico de rendimiento
 */

class PlayerManager {
    constructor() {
        // Almacén de jugadores activos { playerId: playerData }
        this.players = new Map();
        
        // Configuración de puntuación
        this.scoringConfig = {
            correctAnswer: 100,        // Puntos base por respuesta correcta
            timeBonus: 50,            // Puntos extra por rapidez (máximo)
            streakMultiplier: 1.5,    // Multiplicador por racha de respuestas correctas
            wrongAnswer: 0            // Penalización por respuesta incorrecta
        };
        
        // Avatares predeterminados para jugadores
        this.defaultAvatars = [
            '🧮', '📊', '📈', '🔢', '🎯', '🏆', '⭐', '🎓',
            '🚀', '💡', '🎪', '🎭', '🎨', '🎵', '🎸', '🏅'
        ];
    }

    /**
     * Crear nuevo jugador
     * @param {string} socketId - ID del socket del jugador
     * @param {string} playerName - Nombre del jugador
     * @param {boolean} isHost - Si el jugador es el host de la sala
     * @returns {Object} Datos del jugador creado
     */
    createPlayer(socketId, playerName, isHost = false) {
        // Validar nombre del jugador
        if (!this.isValidPlayerName(playerName)) {
            throw new Error('Nombre de jugador inválido. Debe tener entre 2 y 20 caracteres.');
        }
        
        // Verificar que el socketId no esté ya en uso
        if (this.players.has(socketId)) {
            throw new Error('Ya existe un jugador con este ID de conexión');
        }
        
        const playerData = {
            id: socketId,
            name: playerName.trim(),
            isHost: isHost,
            avatar: this.getRandomAvatar(),
            
            // Datos del juego actual
            score: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            streak: 0,                    // Racha actual de respuestas correctas
            bestStreak: 0,               // Mejor racha en la sesión
            averageResponseTime: 0,       // Tiempo promedio de respuesta (ms)
            
            // Estado del jugador
            isConnected: true,
            isReady: false,
            currentRoom: null,
            
            // Timestamps
            joinedAt: new Date(),
            lastActivity: new Date(),
            
            // Estadísticas detalladas
            gameStats: {
                totalQuestions: 0,
                correctByCategory: {
                    arithmetic: 0,
                    logic: 0,
                    geometry: 0
                },
                responseTimes: [],           // Array de tiempos de respuesta
                difficultyPerformance: {     // Rendimiento por dificultad
                    easy: { correct: 0, total: 0 },
                    medium: { correct: 0, total: 0 },
                    hard: { correct: 0, total: 0 }
                }
            }
        };
        
        this.players.set(socketId, playerData);
        
        console.log(`👤 [PlayerManager] Jugador creado: ${playerName} (${socketId}) ${isHost ? '[HOST]' : ''}`);
        
        return playerData;
    }

    /**
     * Obtener datos de un jugador
     * @param {string} playerId - ID del jugador (socketId)
     * @returns {Object|null} Datos del jugador o null si no existe
     */
    getPlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            // Actualizar última actividad
            player.lastActivity = new Date();
        }
        return player || null;
    }

    /**
     * Actualizar puntuación de un jugador
     * @param {string} playerId - ID del jugador
     * @param {number} points - Puntos a añadir
     * @param {boolean} isCorrect - Si la respuesta fue correcta
     * @param {number} responseTime - Tiempo de respuesta en ms
     * @param {string} category - Categoría de la pregunta
     * @param {string} difficulty - Dificultad de la pregunta
     * @returns {Object} Resultado de la actualización
     */
    updatePlayerScore(playerId, points, isCorrect = true, responseTime = 0, category = '', difficulty = 'medium') {
        const player = this.getPlayer(playerId);
        
        if (!player) {
            throw new Error(`Jugador ${playerId} no encontrado`);
        }
        
        const oldScore = player.score;
        player.score += points;
        player.gameStats.totalQuestions++;
        
        // Actualizar estadísticas según el resultado
        if (isCorrect) {
            player.correctAnswers++;
            player.streak++;
            player.bestStreak = Math.max(player.bestStreak, player.streak);
            
            // Actualizar por categoría
            if (category && player.gameStats.correctByCategory[category] !== undefined) {
                player.gameStats.correctByCategory[category]++;
            }
        } else {
            player.wrongAnswers++;
            player.streak = 0; // Romper racha
        }
        
        // Actualizar rendimiento por dificultad
        if (player.gameStats.difficultyPerformance[difficulty]) {
            player.gameStats.difficultyPerformance[difficulty].total++;
            if (isCorrect) {
                player.gameStats.difficultyPerformance[difficulty].correct++;
            }
        }
        
        // Actualizar tiempo de respuesta
        if (responseTime > 0) {
            player.gameStats.responseTimes.push(responseTime);
            player.averageResponseTime = this.calculateAverageResponseTime(player.gameStats.responseTimes);
        }
        
        player.lastActivity = new Date();
        
        const result = {
            playerId: playerId,
            playerName: player.name,
            pointsAdded: points,
            oldScore: oldScore,
            newScore: player.score,
            isCorrect: isCorrect,
            currentStreak: player.streak,
            bestStreak: player.bestStreak,
            totalQuestions: player.gameStats.totalQuestions
        };
        
        console.log(`📊 [PlayerManager] Puntuación actualizada - ${player.name}: ${oldScore} → ${player.score} (+${points})`);
        
        return result;
    }

    /**
     * Calcular puntos por respuesta correcta con bonificaciones
     * @param {number} timeRemaining - Tiempo restante cuando respondió (segundos)
     * @param {number} maxTime - Tiempo máximo para la pregunta (segundos)
     * @param {number} streak - Racha actual del jugador
     * @param {string} difficulty - Dificultad de la pregunta
     * @returns {number} Puntos calculados
     */
    calculatePoints(timeRemaining, maxTime, streak, difficulty = 'medium') {
        let points = this.scoringConfig.correctAnswer;
        
        // Multiplicador por dificultad
        const difficultyMultipliers = {
            easy: 0.8,
            medium: 1.0,
            hard: 1.3
        };
        
        points *= (difficultyMultipliers[difficulty] || 1.0);
        
        // Bonus por velocidad (0-50 puntos extra)
        if (timeRemaining > 0 && maxTime > 0) {
            const speedRatio = timeRemaining / maxTime;
            const timeBonus = Math.round(this.scoringConfig.timeBonus * speedRatio);
            points += timeBonus;
        }
        
        // Multiplicador por racha
        if (streak >= 3) {
            const streakBonus = Math.min(streak / 10, 0.5); // Máximo 50% extra
            points = Math.round(points * (1 + streakBonus));
        }
        
        return Math.round(points);
    }

    /**
     * Establecer jugador como host
     * @param {string} playerId - ID del jugador
     * @returns {boolean} true si se estableció correctamente
     */
    setAsHost(playerId) {
        const player = this.getPlayer(playerId);
        
        if (!player) {
            return false;
        }
        
        player.isHost = true;
        player.lastActivity = new Date();
        
        console.log(`👑 [PlayerManager] ${player.name} establecido como host`);
        
        return true;
    }

    /**
     * Remover jugador del sistema
     * @param {string} playerId - ID del jugador
     * @returns {Object|null} Datos del jugador removido
     */
    removePlayer(playerId) {
        const player = this.players.get(playerId);
        
        if (!player) {
            return null;
        }
        
        this.players.delete(playerId);
        
        console.log(`👋 [PlayerManager] Jugador removido: ${player.name} (${playerId})`);
        
        return player;
    }

    /**
     * Obtener ranking de jugadores por puntuación
     * @param {Array} playerIds - Array de IDs de jugadores a rankear
     * @returns {Array} Array de jugadores ordenados por puntuación
     */
    getPlayerRanking(playerIds) {
        const players = playerIds
            .map(id => this.getPlayer(id))
            .filter(player => player !== null)
            .sort((a, b) => {
                // Primero por puntuación (descendente)
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                // En caso de empate, por menor tiempo promedio de respuesta
                return a.averageResponseTime - b.averageResponseTime;
            });
        
        // Añadir posición en el ranking
        return players.map((player, index) => ({
            ...player,
            rank: index + 1,
            accuracy: this.calculateAccuracy(player),
            performance: this.calculatePerformance(player)
        }));
    }

    /**
     * Obtener total de jugadores activos
     * @returns {number} Número total de jugadores
     */
    getTotalPlayers() {
        return this.players.size;
    }

    /**
     * Obtener estadísticas generales de jugadores
     * @returns {Object} Estadísticas generales
     */
    getGeneralStats() {
        const players = Array.from(this.players.values());
        
        if (players.length === 0) {
            return {
                totalPlayers: 0,
                averageScore: 0,
                totalQuestionsAnswered: 0,
                overallAccuracy: 0
            };
        }
        
        const totalScore = players.reduce((sum, p) => sum + p.score, 0);
        const totalQuestions = players.reduce((sum, p) => sum + p.gameStats.totalQuestions, 0);
        const totalCorrect = players.reduce((sum, p) => sum + p.correctAnswers, 0);
        
        return {
            totalPlayers: players.length,
            averageScore: Math.round(totalScore / players.length),
            totalQuestionsAnswered: totalQuestions,
            overallAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
            playersWithPerfectScore: players.filter(p => p.wrongAnswers === 0 && p.gameStats.totalQuestions > 0).length
        };
    }

    /**
     * Resetear estadísticas de un jugador para nuevo juego
     * @param {string} playerId - ID del jugador
     * @returns {boolean} true si se reseteó correctamente
     */
    resetPlayerGameStats(playerId) {
        const player = this.getPlayer(playerId);
        
        if (!player) {
            return false;
        }
        
        // Mantener datos del jugador pero resetear estadísticas del juego
        player.score = 0;
        player.correctAnswers = 0;
        player.wrongAnswers = 0;
        player.streak = 0;
        player.averageResponseTime = 0;
        player.isReady = false;
        
        // Resetear estadísticas detalladas
        player.gameStats.totalQuestions = 0;
        player.gameStats.correctByCategory = {
            arithmetic: 0,
            logic: 0,
            geometry: 0
        };
        player.gameStats.responseTimes = [];
        player.gameStats.difficultyPerformance = {
            easy: { correct: 0, total: 0 },
            medium: { correct: 0, total: 0 },
            hard: { correct: 0, total: 0 }
        };
        
        player.lastActivity = new Date();
        
        console.log(`🔄 [PlayerManager] Estadísticas de ${player.name} reseteadas para nuevo juego`);
        
        return true;
    }

    // ==========================================
    // MÉTODOS AUXILIARES PRIVADOS
    // ==========================================

    /**
     * Validar nombre de jugador
     * @private
     * @param {string} name - Nombre a validar
     * @returns {boolean} true si es válido
     */
    isValidPlayerName(name) {
        return typeof name === 'string' && 
               name.trim().length >= 2 && 
               name.trim().length <= 20 &&
               /^[a-zA-Z0-9\s\-_]+$/.test(name.trim());
    }

    /**
     * Obtener avatar aleatorio
     * @private
     * @returns {string} Emoji de avatar
     */
    getRandomAvatar() {
        return this.defaultAvatars[Math.floor(Math.random() * this.defaultAvatars.length)];
    }

    /**
     * Calcular tiempo promedio de respuesta
     * @private
     * @param {Array} responseTimes - Array de tiempos de respuesta
     * @returns {number} Tiempo promedio en ms
     */
    calculateAverageResponseTime(responseTimes) {
        if (responseTimes.length === 0) return 0;
        
        const sum = responseTimes.reduce((total, time) => total + time, 0);
        return Math.round(sum / responseTimes.length);
    }

    /**
     * Calcular precisión del jugador
     * @private
     * @param {Object} player - Datos del jugador
     * @returns {number} Precisión en porcentaje (0-100)
     */
    calculateAccuracy(player) {
        const totalAnswers = player.correctAnswers + player.wrongAnswers;
        if (totalAnswers === 0) return 0;
        
        return Math.round((player.correctAnswers / totalAnswers) * 100);
    }

    /**
     * Calcular rendimiento general del jugador
     * @private
     * @param {Object} player - Datos del jugador
     * @returns {string} Nivel de rendimiento
     */
    calculatePerformance(player) {
        const accuracy = this.calculateAccuracy(player);
        const avgTime = player.averageResponseTime;
        
        if (accuracy >= 90 && avgTime <= 5000) return 'Excelente';
        if (accuracy >= 75 && avgTime <= 10000) return 'Muy Bueno';
        if (accuracy >= 60 && avgTime <= 15000) return 'Bueno';
        if (accuracy >= 40) return 'Regular';
        return 'Necesita Práctica';
    }
}

export default PlayerManager;