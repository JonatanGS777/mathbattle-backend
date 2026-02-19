// server.js - Servidor Principal del Juego Math Battle
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar módulos del juego
import RoomManager from './controllers/roomManager.js';
import PlayerManager from './controllers/playerManager.js';
import GameLogic from './controllers/gameLogic.js';
import QuestionBank from './controllers/questionBank.js';

// Configuración ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Inicializar Express y Socket.io
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Configurar middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Inicializar gestores del juego
const roomManager = new RoomManager();
const playerManager = new PlayerManager();
const gameLogic = new GameLogic();
const questionBank = new QuestionBank();

// Configuración del puerto
const PORT = process.env.PORT || 3001;

/**
 * MANEJO DE CONEXIONES SOCKET.IO
 */
io.on('connection', (socket) => {
    console.log(`🔌 Usuario conectado: ${socket.id}`);

    // ==========================================
    // EVENTOS DE GESTIÓN DE SALAS
    // ==========================================
    
    /**
     * Crear una nueva sala de juego
     */
    socket.on('create-room', (playerData) => {
        try {
            const { playerName, gameSettings } = playerData;
            
            // Crear sala y añadir jugador como host
            const room = roomManager.createRoom(socket.id, gameSettings);
            const player = playerManager.createPlayer(socket.id, playerName, true);
            
            // Unir jugador a la sala
            socket.join(room.code);
            roomManager.addPlayerToRoom(room.code, player);
            
            // Notificar éxito al creador
            socket.emit('room-created', {
                roomCode: room.code,
                player: player,
                room: room
            });
            
            console.log(`🏠 Sala creada: ${room.code} por ${playerName}`);
            
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    /**
     * Unirse a una sala existente
     */
    socket.on('join-room', (playerData) => {
        try {
            const { playerName, roomCode } = playerData;
            
            // Verificar que la sala existe
            const room = roomManager.getRoom(roomCode);
            if (!room) {
                throw new Error('Sala no encontrada');
            }
            
            // Verificar capacidad de la sala
            if (room.players.length >= room.maxPlayers) {
                throw new Error('Sala llena');
            }
            
            // Crear jugador y añadirlo a la sala
            const player = playerManager.createPlayer(socket.id, playerName, false);
            socket.join(roomCode);
            roomManager.addPlayerToRoom(roomCode, player);
            
            // Notificar al jugador que se unió
            socket.emit('room-joined', {
                roomCode: roomCode,
                player: player,
                room: room
            });
            
            // Notificar a todos los jugadores en la sala
            io.to(roomCode).emit('player-joined', {
                player: player,
                totalPlayers: room.players.length
            });
            
            console.log(`👤 ${playerName} se unió a la sala ${roomCode}`);
            
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    // ==========================================
    // EVENTOS DE LÓGICA DEL JUEGO
    // ==========================================
    
    /**
     * Iniciar juego (solo el host puede hacerlo)
     */
    socket.on('start-game', (data) => {
        try {
            const { roomCode } = data;
            const room = roomManager.getRoom(roomCode);
            
            if (!room) {
                throw new Error('Sala no encontrada');
            }
            
            // Verificar que el usuario es el host
            const player = playerManager.getPlayer(socket.id);
            if (!player || !player.isHost) {
                throw new Error('Solo el host puede iniciar el juego');
            }
            
            // Verificar mínimo de jugadores
            if (room.players.length < 2) {
                throw new Error('Se necesitan al menos 2 jugadores para iniciar');
            }
            
            // Inicializar lógica del juego
            gameLogic.initializeGame(roomCode, room.players);
            
            // Obtener primera pregunta
            const firstQuestion = questionBank.getRandomQuestion();
            gameLogic.setCurrentQuestion(roomCode, firstQuestion);
            
            // Notificar inicio del juego a todos los jugadores
            io.to(roomCode).emit('game-started', {
                message: 'El juego está comenzando...',
                totalQuestions: room.settings.totalQuestions
            });
            
            // Enviar primera pregunta después de 3 segundos
            setTimeout(() => {
                io.to(roomCode).emit('new-question', {
                    question: firstQuestion,
                    questionNumber: 1,
                    timeLimit: room.settings.questionTime
                });
            }, 3000);
            
            console.log(`🎮 Juego iniciado en sala ${roomCode}`);
            
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    /**
     * Responder pregunta
     */
    socket.on('submit-answer', (answerData) => {
        try {
            const { roomCode, answer, timeRemaining } = answerData;
            const player = playerManager.getPlayer(socket.id);
            
            if (!player) {
                throw new Error('Jugador no encontrado');
            }
            
            // Procesar respuesta
            const result = gameLogic.processAnswer(roomCode, player.id, answer, timeRemaining);
            
            // Actualizar puntuación del jugador
            playerManager.updatePlayerScore(player.id, result.pointsEarned);
            
            // Notificar al jugador sobre su respuesta
            socket.emit('answer-result', {
                correct: result.isCorrect,
                pointsEarned: result.pointsEarned,
                totalScore: playerManager.getPlayer(player.id).score
            });
            
            // Verificar si todos han respondido
            if (gameLogic.allPlayersAnswered(roomCode)) {
                // Enviar resultados de la ronda
                const roundResults = gameLogic.getRoundResults(roomCode);
                io.to(roomCode).emit('round-results', roundResults);
                
                // Continuar con siguiente pregunta o finalizar juego
                setTimeout(() => {
                    const nextQuestion = gameLogic.getNextQuestion(roomCode);
                    
                    if (nextQuestion) {
                        io.to(roomCode).emit('new-question', {
                            question: nextQuestion.question,
                            questionNumber: nextQuestion.questionNumber,
                            timeLimit: roomManager.getRoom(roomCode).settings.questionTime
                        });
                    } else {
                        // Juego terminado
                        const finalResults = gameLogic.getFinalResults(roomCode);
                        io.to(roomCode).emit('game-finished', finalResults);
                    }
                }, 5000);
            }
            
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    // ==========================================
    // EVENTOS DE DESCONEXIÓN
    // ==========================================
    
    /**
     * Manejo de desconexión de jugadores
     */
    socket.on('disconnect', () => {
        console.log(`🔌 Usuario desconectado: ${socket.id}`);
        
        try {
            const player = playerManager.getPlayer(socket.id);
            if (player) {
                // Encontrar la sala del jugador
                const room = roomManager.findRoomByPlayerId(socket.id);
                
                if (room) {
                    // Remover jugador de la sala
                    roomManager.removePlayerFromRoom(room.code, socket.id);
                    
                    // Notificar a otros jugadores
                    io.to(room.code).emit('player-disconnected', {
                        playerName: player.name,
                        totalPlayers: room.players.length
                    });
                    
                    // Si era el host, transferir a otro jugador o cerrar sala
                    if (player.isHost) {
                        if (room.players.length > 0) {
                            // Transferir host al primer jugador disponible
                            const newHost = room.players[0];
                            playerManager.setAsHost(newHost.id);
                            
                            io.to(room.code).emit('host-changed', {
                                newHost: newHost.name
                            });
                        } else {
                            // Cerrar sala si no quedan jugadores
                            roomManager.closeRoom(room.code);
                        }
                    }
                }
                
                // Remover jugador del manager
                playerManager.removePlayer(socket.id);
            }
        } catch (error) {
            console.error('Error en desconexión:', error);
        }
    });

    // ==========================================
    // EVENTOS DE INFORMACIÓN
    // ==========================================
    
    /**
     * Obtener lista de jugadores en sala
     */
    socket.on('get-players', (roomCode) => {
        try {
            const room = roomManager.getRoom(roomCode);
            if (room) {
                socket.emit('players-list', {
                    players: room.players,
                    totalPlayers: room.players.length
                });
            }
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    /**
     * Obtener estadísticas de la sala
     */
    socket.on('get-room-stats', (roomCode) => {
        try {
            const room = roomManager.getRoom(roomCode);
            if (room) {
                socket.emit('room-stats', {
                    playersCount: room.players.length,
                    maxPlayers: room.maxPlayers,
                    gameStatus: room.status,
                    settings: room.settings
                });
            }
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });
});

// ==========================================
// RUTAS API REST (OPCIONALES)
// ==========================================

/**
 * Ruta de salud del servidor
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        activeRooms: roomManager.getActiveRooms().length,
        totalPlayers: playerManager.getTotalPlayers()
    });
});

/**
 * Obtener estadísticas del servidor
 */
app.get('/api/stats', (req, res) => {
    res.json({
        activeRooms: roomManager.getActiveRooms().length,
        totalPlayers: playerManager.getTotalPlayers(),
        uptime: process.uptime()
    });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

server.listen(PORT, () => {
    console.log(`
🚀 Servidor Math Battle iniciado
📍 Puerto: ${PORT}
🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
⚡ Socket.io configurado
📊 Módulos cargados: RoomManager, PlayerManager, GameLogic, QuestionBank
    `);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Promesa rechazada:', error);
});

export default app;