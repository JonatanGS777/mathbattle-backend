// controllers/roomManager.js - Gestor de Salas del Juego Math Ninja

/**
 * ROOMMANAGER - Gestiona la creación, configuración y eliminación de salas de juego
 * 
 * Funcionalidades principales:
 * - Crear salas con códigos únicos
 * - Gestionar jugadores en cada sala
 * - Configurar parámetros del juego
 * - Limpiar salas inactivas
 */

class RoomManager {
    constructor() {
        // Almacén de salas activas { roomCode: roomData }
        this.rooms = new Map();
        
        // Configuración por defecto de las salas
        this.defaultSettings = {
            maxPlayers: 30,
            questionTime: 30, // segundos por pregunta
            totalQuestions: 10,
            difficultyLevel: 'medium',
            categories: ['arithmetic', 'logic', 'geometry']
        };
        
        // Iniciar limpieza automática de salas inactivas cada 30 minutos
        this.startCleanupInterval();
    }

    /**
     * Generar código único para la sala (6 caracteres alfanuméricos)
     * @returns {string} Código único de sala
     */
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        
        do {
            code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (this.rooms.has(code)); // Asegurar que el código sea único
        
        return code;
    }

    /**
     * Crear nueva sala de juego
     * @param {string} hostId - ID del socket del host
     * @param {Object} customSettings - Configuración personalizada (opcional)
     * @returns {Object} Datos de la sala creada
     */
    createRoom(hostId, customSettings = {}) {
        const roomCode = this.generateRoomCode();
        const settings = { ...this.defaultSettings, ...customSettings };
        
        const roomData = {
            code: roomCode,
            hostId: hostId,
            players: [], // Array de objetos jugador
            settings: settings,
            status: 'waiting', // 'waiting', 'playing', 'finished'
            maxPlayers: settings.maxPlayers,
            createdAt: new Date(),
            lastActivity: new Date(),
            gameState: {
                currentQuestion: null,
                questionNumber: 0,
                answers: {}, // { playerId: answerData }
                scores: {} // { playerId: score }
            }
        };
        
        this.rooms.set(roomCode, roomData);
        
        console.log(`🏠 [RoomManager] Sala creada: ${roomCode} (Host: ${hostId})`);
        
        return roomData;
    }

    /**
     * Obtener datos de una sala
     * @param {string} roomCode - Código de la sala
     * @returns {Object|null} Datos de la sala o null si no existe
     */
    getRoom(roomCode) {
        const room = this.rooms.get(roomCode);
        if (room) {
            // Actualizar última actividad
            room.lastActivity = new Date();
        }
        return room || null;
    }

    /**
     * Añadir jugador a una sala
     * @param {string} roomCode - Código de la sala
     * @param {Object} player - Datos del jugador
     * @returns {boolean} true si se añadió correctamente
     */
    addPlayerToRoom(roomCode, player) {
        const room = this.getRoom(roomCode);
        
        if (!room) {
            throw new Error(`Sala ${roomCode} no encontrada`);
        }
        
        if (room.players.length >= room.maxPlayers) {
            throw new Error(`Sala ${roomCode} está llena (${room.maxPlayers} jugadores máximo)`);
        }
        
        // Verificar que el jugador no esté ya en la sala
        if (room.players.find(p => p.id === player.id)) {
            throw new Error(`El jugador ya está en la sala ${roomCode}`);
        }
        
        // Añadir jugador
        room.players.push(player);
        room.lastActivity = new Date();
        
        // Inicializar puntuación del jugador
        room.gameState.scores[player.id] = 0;
        
        console.log(`👤 [RoomManager] Jugador ${player.name} añadido a sala ${roomCode} (${room.players.length}/${room.maxPlayers})`);
        
        return true;
    }

    /**
     * Remover jugador de una sala
     * @param {string} roomCode - Código de la sala
     * @param {string} playerId - ID del jugador
     * @returns {boolean} true si se removió correctamente
     */
    removePlayerFromRoom(roomCode, playerId) {
        const room = this.getRoom(roomCode);
        
        if (!room) {
            return false;
        }
        
        const playerIndex = room.players.findIndex(p => p.id === playerId);
        
        if (playerIndex === -1) {
            return false;
        }
        
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        
        // Limpiar datos del juego para este jugador
        delete room.gameState.scores[playerId];
        delete room.gameState.answers[playerId];
        
        room.lastActivity = new Date();
        
        console.log(`👋 [RoomManager] Jugador ${player.name} removido de sala ${roomCode} (${room.players.length}/${room.maxPlayers})`);
        
        return true;
    }

    /**
     * Encontrar la sala en la que está un jugador
     * @param {string} playerId - ID del jugador
     * @returns {Object|null} Sala donde está el jugador o null
     */
    findRoomByPlayerId(playerId) {
        for (const [roomCode, room] of this.rooms.entries()) {
            if (room.players.find(p => p.id === playerId)) {
                return room;
            }
        }
        return null;
    }

    /**
     * Actualizar estado de la sala
     * @param {string} roomCode - Código de la sala
     * @param {string} newStatus - Nuevo estado ('waiting', 'playing', 'finished')
     * @returns {boolean} true si se actualizó correctamente
     */
    updateRoomStatus(roomCode, newStatus) {
        const room = this.getRoom(roomCode);
        
        if (!room) {
            return false;
        }
        
        const oldStatus = room.status;
        room.status = newStatus;
        room.lastActivity = new Date();
        
        console.log(`🔄 [RoomManager] Estado de sala ${roomCode} cambiado: ${oldStatus} → ${newStatus}`);
        
        return true;
    }

    /**
     * Actualizar configuración de la sala (solo antes de iniciar el juego)
     * @param {string} roomCode - Código de la sala
     * @param {Object} newSettings - Nueva configuración
     * @returns {boolean} true si se actualizó correctamente
     */
    updateRoomSettings(roomCode, newSettings) {
        const room = this.getRoom(roomCode);
        
        if (!room) {
            return false;
        }
        
        if (room.status !== 'waiting') {
            throw new Error('No se puede cambiar la configuración durante el juego');
        }
        
        room.settings = { ...room.settings, ...newSettings };
        room.lastActivity = new Date();
        
        console.log(`⚙️ [RoomManager] Configuración de sala ${roomCode} actualizada:`, newSettings);
        
        return true;
    }

    /**
     * Cerrar una sala específica
     * @param {string} roomCode - Código de la sala
     * @returns {boolean} true si se cerró correctamente
     */
    closeRoom(roomCode) {
        const room = this.rooms.get(roomCode);
        
        if (!room) {
            return false;
        }
        
        this.rooms.delete(roomCode);
        
        console.log(`🚪 [RoomManager] Sala ${roomCode} cerrada (${room.players.length} jugadores)`);
        
        return true;
    }

    /**
     * Obtener todas las salas activas
     * @returns {Array} Array de datos de salas activas
     */
    getActiveRooms() {
        return Array.from(this.rooms.values());
    }

    /**
     * Obtener estadísticas del gestor de salas
     * @returns {Object} Estadísticas generales
     */
    getStats() {
        const rooms = this.getActiveRooms();
        const totalPlayers = rooms.reduce((sum, room) => sum + room.players.length, 0);
        
        const statusCounts = {
            waiting: 0,
            playing: 0,
            finished: 0
        };
        
        rooms.forEach(room => {
            statusCounts[room.status] = (statusCounts[room.status] || 0) + 1;
        });
        
        return {
            totalRooms: rooms.length,
            totalPlayers: totalPlayers,
            averagePlayersPerRoom: rooms.length > 0 ? Math.round(totalPlayers / rooms.length * 100) / 100 : 0,
            roomsByStatus: statusCounts,
            lastCleanup: this.lastCleanup || null
        };
    }

    /**
     * Limpiar salas inactivas (más de 2 horas sin actividad)
     * @returns {number} Número de salas eliminadas
     */
    cleanupInactiveRooms() {
        const now = new Date();
        const maxInactiveTime = 2 * 60 * 60 * 1000; // 2 horas en millisegundos
        let cleanedCount = 0;
        
        for (const [roomCode, room] of this.rooms.entries()) {
            const inactiveTime = now - room.lastActivity;
            
            if (inactiveTime > maxInactiveTime) {
                this.rooms.delete(roomCode);
                cleanedCount++;
                console.log(`🧹 [RoomManager] Sala inactiva ${roomCode} eliminada (inactiva ${Math.round(inactiveTime / 60000)} minutos)`);
            }
        }
        
        this.lastCleanup = now;
        
        if (cleanedCount > 0) {
            console.log(`🧹 [RoomManager] Limpieza completada: ${cleanedCount} salas eliminadas`);
        }
        
        return cleanedCount;
    }

    /**
     * Iniciar intervalo de limpieza automática
     * @private
     */
    startCleanupInterval() {
        // Limpiar cada 30 minutos
        setInterval(() => {
            this.cleanupInactiveRooms();
        }, 30 * 60 * 1000);
        
        console.log('🧹 [RoomManager] Intervalo de limpieza automática iniciado (cada 30 minutos)');
    }

    /**
     * Validar código de sala
     * @param {string} roomCode - Código a validar
     * @returns {boolean} true si el código es válido
     */
    isValidRoomCode(roomCode) {
        return typeof roomCode === 'string' && 
               roomCode.length === 6 && 
               /^[A-Z0-9]{6}$/.test(roomCode);
    }

    /**
     * Obtener información pública de una sala (sin datos sensibles)
     * @param {string} roomCode - Código de la sala
     * @returns {Object|null} Información pública de la sala
     */
    getRoomPublicInfo(roomCode) {
        const room = this.getRoom(roomCode);
        
        if (!room) {
            return null;
        }
        
        return {
            code: room.code,
            playersCount: room.players.length,
            maxPlayers: room.maxPlayers,
            status: room.status,
            settings: {
                totalQuestions: room.settings.totalQuestions,
                questionTime: room.settings.questionTime,
                difficultyLevel: room.settings.difficultyLevel
            }
        };
    }
}

export default RoomManager;