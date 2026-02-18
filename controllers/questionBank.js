// controllers/questionBank.js - Banco de Preguntas Math Ninja

/**
 * QUESTIONBANK - Gestiona el banco de preguntas matemáticas
 * 
 * Funcionalidades principales:
 * - Generar preguntas dinámicas por categoría y dificultad
 * - Almacenar preguntas predefinidas
 * - Selección aleatoria y balanceada
 * - Validación de respuestas
 */

class QuestionBank {
    constructor() {
        // Preguntas predefinidas organizadas por categoría y dificultad
        this.predefinedQuestions = {
            arithmetic: {
                easy: [
                    {
                        question: "¿Cuánto es 15 + 23?",
                        options: ["38", "37", "39", "36"],
                        correctAnswer: "38",
                        explanation: "15 + 23 = 38. Suma básica de dos números de dos dígitos.",
                        category: "arithmetic",
                        difficulty: "easy",
                        type: "multiple_choice"
                    },
                    {
                        question: "¿Cuánto es 8 × 7?",
                        options: ["54", "56", "58", "52"],
                        correctAnswer: "56",
                        explanation: "8 × 7 = 56. Multiplicación de la tabla del 8.",
                        category: "arithmetic",
                        difficulty: "easy",
                        type: "multiple_choice"
                    },
                    {
                        question: "¿Cuánto es 100 - 37?",
                        options: ["63", "62", "64", "61"],
                        correctAnswer: "63",
                        explanation: "100 - 37 = 63. Resta con llevada.",
                        category: "arithmetic",
                        difficulty: "easy",
                        type: "multiple_choice"
                    }
                ],
                medium: [
                    {
                        question: "¿Cuánto es 156 + 289?",
                        options: ["445", "435", "455", "425"],
                        correctAnswer: "445",
                        explanation: "156 + 289 = 445. Suma de números de tres dígitos con llevada.",
                        category: "arithmetic",
                        difficulty: "medium",
                        type: "multiple_choice"
                    },
                    {
                        question: "¿Cuánto es 24 × 15?",
                        options: ["360", "350", "370", "340"],
                        correctAnswer: "360",
                        explanation: "24 × 15 = 360. Se puede calcular como 24 × 10 + 24 × 5 = 240 + 120 = 360.",
                        category: "arithmetic",
                        difficulty: "medium",
                        type: "multiple_choice"
                    },
                    {
                        question: "¿Cuánto es 432 ÷ 18?",
                        options: ["24", "22", "26", "20"],
                        correctAnswer: "24",
                        explanation: "432 ÷ 18 = 24. División exacta.",
                        category: "arithmetic",
                        difficulty: "medium",
                        type: "multiple_choice"
                    }
                ],
                hard: [
                    {
                        question: "¿Cuánto es 1,247 + 3,856 - 2,199?",
                        options: ["2,904", "2,894", "2,914", "2,884"],
                        correctAnswer: "2,904",
                        explanation: "1,247 + 3,856 = 5,103; luego 5,103 - 2,199 = 2,904.",
                        category: "arithmetic",
                        difficulty: "hard",
                        type: "multiple_choice"
                    },
                    {
                        question: "¿Cuánto es 127 × 63?",
                        options: ["8,001", "7,991", "8,011", "7,981"],
                        correctAnswer: "8,001",
                        explanation: "127 × 63 = 8,001. Multiplicación de números de tres dígitos.",
                        category: "arithmetic",
                        difficulty: "hard",
                        type: "multiple_choice"
                    }
                ]
            },
            logic: {
                easy: [
                    {
                        question: "En una secuencia: 2, 4, 6, 8, ¿cuál sigue?",
                        options: ["10", "12", "9", "11"],
                        correctAnswer: "10",
                        explanation: "Es una secuencia de números pares: +2 cada vez.",
                        category: "logic",
                        difficulty: "easy",
                        type: "multiple_choice"
                    },
                    {
                        question: "Si Ana tiene 5 caramelos más que Luis, y Luis tiene 8, ¿cuántos tiene Ana?",
                        options: ["13", "12", "14", "11"],
                        correctAnswer: "13",
                        explanation: "Ana = Luis + 5 = 8 + 5 = 13 caramelos.",
                        category: "logic",
                        difficulty: "easy",
                        type: "multiple_choice"
                    }
                ],
                medium: [
                    {
                        question: "En una secuencia: 3, 6, 12, 24, ¿cuál sigue?",
                        options: ["48", "36", "42", "50"],
                        correctAnswer: "48",
                        explanation: "Cada número se multiplica por 2: 3×2=6, 6×2=12, 12×2=24, 24×2=48.",
                        category: "logic",
                        difficulty: "medium",
                        type: "multiple_choice"
                    },
                    {
                        question: "Si x + 5 = 12, ¿cuánto vale x?",
                        options: ["7", "6", "8", "5"],
                        correctAnswer: "7",
                        explanation: "x + 5 = 12, entonces x = 12 - 5 = 7.",
                        category: "logic",
                        difficulty: "medium",
                        type: "multiple_choice"
                    }
                ],
                hard: [
                    {
                        question: "En una secuencia: 1, 1, 2, 3, 5, 8, ¿cuáles son los siguientes dos números?",
                        options: ["13, 21", "11, 19", "12, 20", "10, 18"],
                        correctAnswer: "13, 21",
                        explanation: "Secuencia de Fibonacci: cada número es la suma de los dos anteriores. 5+8=13, 8+13=21.",
                        category: "logic",
                        difficulty: "hard",
                        type: "multiple_choice"
                    }
                ]
            },
            geometry: {
                easy: [
                    {
                        question: "¿Cuántos lados tiene un triángulo?",
                        options: ["3", "4", "5", "6"],
                        correctAnswer: "3",
                        explanation: "Un triángulo, por definición, tiene exactamente 3 lados.",
                        category: "geometry",
                        difficulty: "easy",
                        type: "multiple_choice"
                    },
                    {
                        question: "¿Cuál es el perímetro de un cuadrado de lado 5 cm?",
                        options: ["20 cm", "15 cm", "25 cm", "10 cm"],
                        correctAnswer: "20 cm",
                        explanation: "Perímetro = 4 × lado = 4 × 5 = 20 cm.",
                        category: "geometry",
                        difficulty: "easy",
                        type: "multiple_choice"
                    }
                ],
                medium: [
                    {
                        question: "¿Cuál es el área de un rectángulo de 8 cm × 5 cm?",
                        options: ["40 cm²", "35 cm²", "45 cm²", "30 cm²"],
                        correctAnswer: "40 cm²",
                        explanation: "Área = largo × ancho = 8 × 5 = 40 cm².",
                        category: "geometry",
                        difficulty: "medium",
                        type: "multiple_choice"
                    },
                    {
                        question: "¿Cuánto mide la hipotenusa de un triángulo rectángulo con catetos de 3 y 4?",
                        options: ["5", "6", "7", "4"],
                        correctAnswer: "5",
                        explanation: "Por el teorema de Pitágoras: √(3² + 4²) = √(9 + 16) = √25 = 5.",
                        category: "geometry",
                        difficulty: "medium",
                        type: "multiple_choice"
                    }
                ],
                hard: [
                    {
                        question: "¿Cuál es el área de un círculo con radio 6 cm? (π ≈ 3.14)",
                        options: ["113.04 cm²", "108.24 cm²", "118.44 cm²", "103.84 cm²"],
                        correctAnswer: "113.04 cm²",
                        explanation: "Área = π × r² = 3.14 × 6² = 3.14 × 36 = 113.04 cm².",
                        category: "geometry",
                        difficulty: "hard",
                        type: "multiple_choice"
                    }
                ]
            }
        };
        
        // Plantillas para generar preguntas dinámicas
        this.questionTemplates = {
            arithmetic: {
                addition: {
                    easy: () => this.generateAddition(1, 50),
                    medium: () => this.generateAddition(50, 500),
                    hard: () => this.generateAddition(500, 5000)
                },
                subtraction: {
                    easy: () => this.generateSubtraction(1, 50),
                    medium: () => this.generateSubtraction(50, 500),
                    hard: () => this.generateSubtraction(500, 5000)
                },
                multiplication: {
                    easy: () => this.generateMultiplication(1, 12),
                    medium: () => this.generateMultiplication(10, 25),
                    hard: () => this.generateMultiplication(25, 100)
                },
                division: {
                    easy: () => this.generateDivision(1, 100),
                    medium: () => this.generateDivision(100, 1000),
                    hard: () => this.generateDivision(1000, 10000)
                }
            }
        };
        
        console.log('📚 [QuestionBank] Banco de preguntas inicializado');
        console.log(`   - Preguntas predefinidas: ${this.getTotalPredefinedQuestions()}`);
    }

    /**
     * Obtener pregunta aleatoria
     * @param {string} category - Categoría ('arithmetic', 'logic', 'geometry')
     * @param {string} difficulty - Dificultad ('easy', 'medium', 'hard')
     * @returns {Object} Pregunta seleccionada
     */
    getRandomQuestion(category = null, difficulty = null) {
        // Si no se especifica categoría, elegir aleatoriamente
        if (!category) {
            const categories = Object.keys(this.predefinedQuestions);
            category = categories[Math.floor(Math.random() * categories.length)];
        }
        
        // Si no se especifica dificultad, elegir aleatoriamente
        if (!difficulty) {
            const difficulties = Object.keys(this.predefinedQuestions[category] || {});
            if (difficulties.length === 0) {
                throw new Error(`Categoría ${category} no encontrada`);
            }
            difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        }
        
        // 70% probabilidad de usar pregunta predefinida, 30% generar dinámicamente
        const usePredefined = Math.random() < 0.7;
        
        if (usePredefined && this.predefinedQuestions[category]?.[difficulty]?.length > 0) {
            return this.getPredefinedQuestion(category, difficulty);
        } else {
            return this.generateDynamicQuestion(category, difficulty);
        }
    }

    /**
     * Obtener conjunto de preguntas para una sesión
     * @param {number} count - Número de preguntas
     * @param {string} difficulty - Dificultad base
     * @param {Array} categories - Categorías a incluir
     * @returns {Array} Array de preguntas
     */
    getQuestionSet(count, difficulty = 'medium', categories = ['arithmetic', 'logic', 'geometry']) {
        const questions = [];
        const usedQuestions = new Set(); // Para evitar duplicados
        
        // Distribución de dificultades (basada en dificultad principal)
        const difficultyDistribution = this.getDifficultyDistribution(difficulty);
        
        for (let i = 0; i < count; i++) {
            const category = categories[i % categories.length];
            const questionDifficulty = this.selectDifficultyFromDistribution(difficultyDistribution);
            
            let attempts = 0;
            let question = null;
            
            // Intentar obtener pregunta única (máximo 10 intentos)
            while (attempts < 10) {
                question = this.getRandomQuestion(category, questionDifficulty);
                const questionKey = `${question.question}-${question.correctAnswer}`;
                
                if (!usedQuestions.has(questionKey)) {
                    usedQuestions.add(questionKey);
                    break;
                }
                attempts++;
            }
            
            if (question) {
                // Añadir metadatos adicionales
                question.id = `q_${i + 1}`;
                question.timeLimit = 30; // segundos
                questions.push(question);
            }
        }
        
        console.log(`📋 [QuestionBank] Conjunto de ${questions.length} preguntas generado`);
        
        return questions;
    }

    /**
     * Validar respuesta
     * @param {Object} question - Datos de la pregunta
     * @param {string|number} answer - Respuesta del usuario
     * @returns {boolean} true si es correcta
     */
    validateAnswer(question, answer) {
        const normalizeAnswer = (ans) => {
            if (typeof ans === 'number') return ans.toString();
            return String(ans).toLowerCase().trim();
        };
        
        return normalizeAnswer(answer) === normalizeAnswer(question.correctAnswer);
    }

    // ==========================================
    // MÉTODOS PARA OBTENER PREGUNTAS PREDEFINIDAS
    // ==========================================

    /**
     * Obtener pregunta predefinida
     * @private
     */
    getPredefinedQuestion(category, difficulty) {
        const questions = this.predefinedQuestions[category]?.[difficulty];
        
        if (!questions || questions.length === 0) {
            throw new Error(`No hay preguntas predefinidas para ${category}/${difficulty}`);
        }
        
        const randomIndex = Math.floor(Math.random() * questions.length);
        return { ...questions[randomIndex] }; // Clonar para evitar mutaciones
    }

    // ==========================================
    // MÉTODOS PARA GENERAR PREGUNTAS DINÁMICAS
    // ==========================================

    /**
     * Generar pregunta dinámica
     * @private
     */
    generateDynamicQuestion(category, difficulty) {
        switch (category) {
            case 'arithmetic':
                return this.generateArithmeticQuestion(difficulty);
            case 'logic':
                return this.generateLogicQuestion(difficulty);
            case 'geometry':
                return this.generateGeometryQuestion(difficulty);
            default:
                throw new Error(`Categoría ${category} no soportada para generación dinámica`);
        }
    }

    /**
     * Generar pregunta aritmética
     * @private
     */
    generateArithmeticQuestion(difficulty) {
        const operations = ['addition', 'subtraction', 'multiplication', 'division', 'exponent', 'squareroot', 'orderofoperations'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        switch (operation) {
            case 'addition':
                return this.generateAddition(difficulty);
            case 'subtraction':
                return this.generateSubtraction(difficulty);
            case 'multiplication':
                return this.generateMultiplication(difficulty);
            case 'division':
                return this.generateDivision(difficulty);
            case 'exponent':
                return this.generateExponent(difficulty);
            case 'squareroot':
                return this.generateSquareRoot(difficulty);
            case 'orderofoperations':
                return this.generateOrderOfOperations(difficulty);
        }
    }

    /**
     * Generar suma
     * @private
     */
    generateAddition(difficulty) {
        const ranges = {
            easy: { min: 1, max: 50 },
            medium: { min: 50, max: 500 },
            hard: { min: 500, max: 2000 }
        };
        
        const range = ranges[difficulty];
        const a = this.randomInt(range.min, range.max);
        const b = this.randomInt(range.min, range.max);
        const answer = a + b;
        
        const wrongAnswers = this.generateWrongAnswers(answer, 3);
        const options = this.shuffleArray([answer.toString(), ...wrongAnswers]);
        
        return {
            question: `¿Cuánto es ${a} + ${b}?`,
            options: options,
            correctAnswer: answer.toString(),
            explanation: `${a} + ${b} = ${answer}`,
            category: 'arithmetic',
            difficulty: difficulty,
            type: 'multiple_choice'
        };
    }

    /**
     * Generar resta
     * @private
     */
    generateSubtraction(difficulty) {
        const ranges = {
            easy: { min: 1, max: 50 },
            medium: { min: 50, max: 500 },
            hard: { min: 500, max: 2000 }
        };
        
        const range = ranges[difficulty];
        let a = this.randomInt(range.min, range.max);
        let b = this.randomInt(range.min, Math.min(a, range.max));
        
        // Asegurar que a >= b para evitar negativos
        if (b > a) [a, b] = [b, a];
        
        const answer = a - b;
        const wrongAnswers = this.generateWrongAnswers(answer, 3);
        const options = this.shuffleArray([answer.toString(), ...wrongAnswers]);
        
        return {
            question: `¿Cuánto es ${a} - ${b}?`,
            options: options,
            correctAnswer: answer.toString(),
            explanation: `${a} - ${b} = ${answer}`,
            category: 'arithmetic',
            difficulty: difficulty,
            type: 'multiple_choice'
        };
    }

    /**
     * Generar multiplicación
     * @private
     */
    generateMultiplication(difficulty) {
        const ranges = {
            easy: { min: 1, max: 12 },
            medium: { min: 10, max: 25 },
            hard: { min: 25, max: 50 }
        };
        
        const range = ranges[difficulty];
        const a = this.randomInt(range.min, range.max);
        const b = this.randomInt(range.min, range.max);
        const answer = a * b;
        
        const wrongAnswers = this.generateWrongAnswers(answer, 3);
        const options = this.shuffleArray([answer.toString(), ...wrongAnswers]);
        
        return {
            question: `¿Cuánto es ${a} × ${b}?`,
            options: options,
            correctAnswer: answer.toString(),
            explanation: `${a} × ${b} = ${answer}`,
            category: 'arithmetic',
            difficulty: difficulty,
            type: 'multiple_choice'
        };
    }

    /**
     * Generar división
     * @private
     */
    generateDivision(difficulty) {
        const ranges = {
            easy: { min: 2, max: 12 },
            medium: { min: 10, max: 25 },
            hard: { min: 25, max: 50 }
        };
        
        const range = ranges[difficulty];
        const divisor = this.randomInt(range.min, range.max);
        const quotient = this.randomInt(range.min, range.max);
        const dividend = divisor * quotient;
        
        const wrongAnswers = this.generateWrongAnswers(quotient, 3);
        const options = this.shuffleArray([quotient.toString(), ...wrongAnswers]);
        
        return {
            question: `¿Cuánto es ${dividend} ÷ ${divisor}?`,
            options: options,
            correctAnswer: quotient.toString(),
            explanation: `${dividend} ÷ ${divisor} = ${quotient}`,
            category: 'arithmetic',
            difficulty: difficulty,
            type: 'multiple_choice'
        };
    }

    /**
     * Generar exponente
     * @private
     */
    generateExponent(difficulty) {
        const configs = {
            easy:   { bases: [2,3,4,5], exps: [2,3] },
            medium: { bases: [2,3,4,5,6,7,8], exps: [2,3] },
            hard:   { bases: [2,3,4,5,6,7,8,9,10], exps: [2,3,4] }
        };
        const cfg = configs[difficulty] || configs.medium;
        const base = cfg.bases[Math.floor(Math.random() * cfg.bases.length)];
        const exp  = cfg.exps[Math.floor(Math.random() * cfg.exps.length)];
        const answer = Math.pow(base, exp);

        const wrongAnswers = this.generateWrongAnswers(answer, 3);
        const options = this.shuffleArray([answer.toString(), ...wrongAnswers]);

        return {
            question: `¿Cuánto es ${base}^${exp}?`,
            options: options,
            correctAnswer: answer.toString(),
            explanation: `${base}^${exp} = ${answer}`,
            category: 'arithmetic',
            difficulty: difficulty,
            type: 'multiple_choice'
        };
    }

    /**
     * Generar raíz cuadrada
     * @private
     */
    generateSquareRoot(difficulty) {
        const pools = {
            easy:   [1,4,9,16,25,36,49,64,81,100],
            medium: [100,121,144,169,196,225,256,289,324,400],
            hard:   [400,441,484,529,576,625,676,729,784,900]
        };
        const pool = pools[difficulty] || pools.easy;
        const radicand = pool[Math.floor(Math.random() * pool.length)];
        const answer = Math.round(Math.sqrt(radicand));

        const wrongAnswers = this.generateWrongAnswers(answer, 3);
        const options = this.shuffleArray([answer.toString(), ...wrongAnswers]);

        return {
            question: `¿Cuánto es √${radicand}?`,
            options: options,
            correctAnswer: answer.toString(),
            explanation: `√${radicand} = ${answer}`,
            category: 'arithmetic',
            difficulty: difficulty,
            type: 'multiple_choice'
        };
    }

    /**
     * Generar orden de operaciones (PEMDAS)
     * @private
     */
    generateOrderOfOperations(difficulty) {
        const configs = {
            easy:   { types: ['add_mul', 'mul_add', 'paren_add_mul'], max: 8 },
            medium: { types: ['add_mul', 'mul_add', 'paren_add_mul', 'paren_sub_mul', 'paren_mul_add'], max: 12 },
            hard:   { types: ['add_mul', 'mul_add', 'paren_add_mul', 'paren_sub_mul', 'three_terms', 'paren_mul_add'], max: 15 }
        };
        const cfg = configs[difficulty] || configs.medium;
        const type = cfg.types[Math.floor(Math.random() * cfg.types.length)];
        const hi = cfg.max;
        const r = (a, b) => this.randomInt(a, b);

        let expr, correct, w1, w2, w3;

        if (type === 'add_mul') {
            const a=r(1,hi), b=r(2,hi), c=r(2,hi);
            expr=`${a} + ${b} × ${c}`;  correct=a+b*c;
            w1=(a+b)*c; w2=a*b+c; w3=a+b+c;
        } else if (type === 'mul_add') {
            const a=r(2,hi), b=r(2,hi), c=r(1,hi);
            expr=`${a} × ${b} + ${c}`;  correct=a*b+c;
            w1=a*(b+c); w2=a+b+c; w3=a*b-c;
        } else if (type === 'paren_add_mul') {
            const a=r(1,hi), b=r(1,hi), c=r(2,hi);
            expr=`(${a} + ${b}) × ${c}`;  correct=(a+b)*c;
            w1=a+b*c; w2=a*c+b; w3=(a+b)+c;
        } else if (type === 'paren_sub_mul') {
            const b=r(1,hi-1), a=r(b+1,hi), c=r(2,hi);
            expr=`(${a} - ${b}) × ${c}`;  correct=(a-b)*c;
            w1=a-b*c; w2=a*c-b; w3=(a+b)*c;
        } else if (type === 'paren_mul_add') {
            const a=r(2,hi), b=r(2,hi), c=r(1,hi);
            expr=`${a} × (${b} + ${c})`;  correct=a*(b+c);
            w1=a*b+c; w2=a*b*c; w3=(a+b)*c;
        } else { // three_terms
            const a=r(2,hi), b=r(2,hi), c=r(2,hi), d=r(2,hi);
            expr=`${a} + ${b} - ${c} × ${d}`;  correct=a+b-c*d;
            w1=(a+b-c)*d; w2=a+b-c+d; w3=a*b-c*d;
        }

        const used = new Set([correct]);
        const wrongs = [w1, w2, w3]
            .filter(w => !used.has(w) && w >= 0 && used.add(w))
            .map(w => w.toString());

        let fill = 1;
        while (wrongs.length < 3) {
            const cand = correct + fill;
            if (!used.has(cand)) { wrongs.push(cand.toString()); used.add(cand); }
            fill = fill > 0 ? -fill : -fill + 1;
        }

        const options = this.shuffleArray([correct.toString(), ...wrongs.slice(0, 3)]);

        return {
            question: `¿Cuánto es: ${expr}?`,
            options,
            correctAnswer: correct.toString(),
            explanation: `PEMDAS: ${expr} = ${correct}`,
            category: 'arithmetic',
            difficulty,
            type: 'multiple_choice'
        };
    }

    /**
     * Generar pregunta de lógica
     * @private
     */
    generateLogicQuestion(difficulty) {
        // Por simplicidad, retornar una pregunta predefinida aleatoria
        return this.getPredefinedQuestion('logic', difficulty);
    }

    /**
     * Generar pregunta de geometría
     * @private
     */
    generateGeometryQuestion(difficulty) {
        // Por simplicidad, retornar una pregunta predefinida aleatoria
        return this.getPredefinedQuestion('geometry', difficulty);
    }

    // ==========================================
    // MÉTODOS AUXILIARES
    // ==========================================

    /**
     * Generar número entero aleatorio
     * @private
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Generar respuestas incorrectas
     * @private
     */
    generateWrongAnswers(correct, count) {
        const wrongAnswers = [];
        const used = new Set([correct]);
        
        while (wrongAnswers.length < count) {
            // Generar respuesta cercana pero incorrecta
            const offset = this.randomInt(-Math.max(1, Math.floor(correct * 0.3)), Math.max(1, Math.floor(correct * 0.3)));
            const wrong = Math.max(0, correct + offset);
            
            if (!used.has(wrong)) {
                wrongAnswers.push(wrong.toString());
                used.add(wrong);
            }
        }
        
        return wrongAnswers;
    }

    /**
     * Mezclar array
     * @private
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Obtener distribución de dificultades
     * @private
     */
    getDifficultyDistribution(baseDifficulty) {
        const distributions = {
            easy: { easy: 0.7, medium: 0.3, hard: 0.0 },
            medium: { easy: 0.2, medium: 0.6, hard: 0.2 },
            hard: { easy: 0.1, medium: 0.3, hard: 0.6 }
        };
        
        return distributions[baseDifficulty] || distributions.medium;
    }

    /**
     * Seleccionar dificultad basada en distribución
     * @private
     */
    selectDifficultyFromDistribution(distribution) {
        const rand = Math.random();
        let cumulative = 0;
        
        for (const [difficulty, probability] of Object.entries(distribution)) {
            cumulative += probability;
            if (rand <= cumulative) {
                return difficulty;
            }
        }
        
        return 'medium'; // Fallback
    }

    /**
     * Obtener total de preguntas predefinidas
     * @private
     */
    getTotalPredefinedQuestions() {
        let total = 0;
        for (const category of Object.values(this.predefinedQuestions)) {
            for (const difficulty of Object.values(category)) {
                total += difficulty.length;
            }
        }
        return total;
    }
}

export default QuestionBank;