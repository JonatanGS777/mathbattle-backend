# MathBattle

Juego multijugador educativo de matemáticas en tiempo real, estilo Kahoot. Los jugadores compiten respondiendo preguntas de matemáticas contra el reloj, acumulando puntos por rapidez y precisión.

## Características

- Salas multijugador (hasta 30 jugadores simultáneos)
- Preguntas de aritmética, geometría, lógica y orden de operaciones (PEMDAS)
- Sistema de vidas (3 vidas por jugador — pierde una al fallar)
- Puntuación basada en rapidez y acierto
- Scoreboard en tiempo real durante la partida
- Ranking final con podio
- Dificultad configurable: fácil, medio, difícil

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Servidor | Node.js + Express |
| Tiempo real | Socket.IO |
| Frontend | HTML + CSS + JavaScript vanilla |
| Variables de entorno | dotenv |

## Requisitos

- Node.js >= 16
- npm >= 8

## Instalación

```bash
git clone https://github.com/JonatanGS777/mathbattle-backend.git
cd mathbattle-backend
npm install
```

Copia el archivo de entorno:

```bash
cp .env .env.local
```

## Configuración (`.env`)

```env
PORT=3002
FRONTEND_URL=http://localhost:8765
NODE_ENV=development
```

## Uso

```bash
# Producción
npm start

# Desarrollo (con recarga automática)
npm run dev
```

El servidor queda corriendo en `http://localhost:3002`.

## Estructura del proyecto

```
MathBattle/
├── server.js                  # Servidor principal, eventos Socket.IO
├── controllers/
│   ├── roomManager.js         # Gestión de salas
│   ├── playerManager.js       # Gestión de jugadores y stats de sesión
│   ├── gameLogic.js           # Lógica del juego (rondas, puntuación)
│   └── questionBank.js        # Banco de preguntas con generación dinámica
├── package.json
└── .env                       # Variables de entorno (no se sube al repo)
```

## Flujo del juego

```
Host crea sala → Jugadores se unen con código → Host inicia
→ Pregunta (timer) → Todos responden → Resultados de ronda
→ Siguiente pregunta → ... → Ranking final
```

## Eventos Socket.IO

### Cliente → Servidor

| Evento | Datos | Descripción |
|--------|-------|-------------|
| `create-room` | `{ playerName, gameSettings }` | Crea una sala nueva |
| `join-room` | `{ playerName, roomCode }` | Unirse a sala existente |
| `start-game` | `{ roomCode }` | Host inicia la partida |
| `submit-answer` | `{ roomCode, answer, timeRemaining }` | Jugador envía respuesta |

### Servidor → Cliente

| Evento | Descripción |
|--------|-------------|
| `room-created` | Sala creada exitosamente |
| `room-joined` | Unido a sala |
| `player-joined` | Otro jugador entró a la sala |
| `game-started` | Juego iniciado (totalQuestions) |
| `new-question` | Nueva pregunta con opciones y timeLimit |
| `answer-result` | Resultado individual (correct, pointsEarned, totalScore) |
| `round-results` | Resultados de ronda (ranking, correctAnswer, stats) |
| `game-finished` | Ranking final, ganador y estadísticas globales |

## Autor

Prof. Yonatan Guerrero Soriano
