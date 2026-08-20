/**
 * presets.js - Banco de dados de referências de supermercado e alimentos comuns
 */

export const PRESET_CATEGORIES = {
    PROTEIN_POWDERS: 'Suplementos Proteicos',
    DAIRY: 'Laticínios & Iogurtes',
    MEATS: 'Carnes, Aves & Ovos',
    SNACKS: 'Barrinhas & Snacks',
    PLANT_BASED: 'Fontes Vegetais & Grãos',
    COMMON_TRAPS: 'Pegadinhas ("Falsos Saudáveis")'
};

export const FOOD_PRESETS = [
    // Suplementos
    {
        id: 'whey-concentrado',
        name: 'Whey Protein 80% Concentrado',
        category: PRESET_CATEGORIES.PROTEIN_POWDERS,
        portion: 30,
        calories: 120,
        protein: 24,
        carbs: 2.5,
        fat: 1.5,
        totalWeight: 900,
        price: 99.90,
        notes: 'Padrão-ouro em custo-benefício e concentração proteica.'
    },
    {
        id: 'whey-isolado',
        name: 'Whey Protein Isolado (90%)',
        category: PRESET_CATEGORIES.PROTEIN_POWDERS,
        portion: 30,
        calories: 110,
        protein: 27,
        carbs: 0.5,
        fat: 0.2,
        totalWeight: 900,
        price: 159.90,
        notes: 'Praticamente zero carboidrato e gordura.'
    },

    // Carnes e Ovos
    {
        id: 'peito-frango-grelhado',
        name: 'Peito de Frango Grelhado',
        category: PRESET_CATEGORIES.MEATS,
        portion: 100,
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        totalWeight: 1000,
        price: 22.90,
        notes: 'A proteína sólida mais limpa e econômica do mercado.'
    },
    {
        id: 'patinho-moido',
        name: 'Carne Bovina (Patinho Moído)',
        category: PRESET_CATEGORIES.MEATS,
        portion: 100,
        calories: 185,
        protein: 29,
        carbs: 0,
        fat: 7.0,
        totalWeight: 1000,
        price: 39.90,
        notes: 'Corte magro bovino com alta densidade de ferro e proteína.'
    },
    {
        id: 'ovo-inteiro',
        name: 'Ovo de Galinha Inteiro (2 un)',
        category: PRESET_CATEGORIES.MEATS,
        portion: 100,
        calories: 143,
        protein: 13,
        carbs: 1.0,
        fat: 9.5,
        totalWeight: 600, // Caixa 12 ovos ~600g
        price: 13.50,
        notes: 'Excelente biodisponibilidade, porém vem com a gordura natural da gema.'
    },
    {
        id: 'clara-de-ovo',
        name: 'Clara de Ovo Pasteurizada',
        category: PRESET_CATEGORIES.MEATS,
        portion: 100,
        calories: 52,
        protein: 11,
        carbs: 0.7,
        fat: 0.2,
        totalWeight: 1000,
        price: 18.00,
        notes: 'Quase 90% das calorias são proteína pura.'
    },
    {
        id: 'atum-solido-agua',
        name: 'Atum Sólido em Água',
        category: PRESET_CATEGORIES.MEATS,
        portion: 60,
        calories: 65,
        protein: 14,
        carbs: 0,
        fat: 0.8,
        totalWeight: 170,
        price: 9.90,
        notes: 'Prático e muito magro quando conservado em água.'
    },

    // Laticínios
    {
        id: 'iogurte-yopro-15g',
        name: 'Iogurte Líquido Hiperproteico (15g Prot)',
        category: PRESET_CATEGORIES.DAIRY,
        portion: 250,
        calories: 135,
        protein: 15,
        carbs: 15,
        fat: 1.0,
        totalWeight: 250,
        price: 7.99,
        notes: 'Ótima conveniência para consumo rápido na rua.'
    },
    {
        id: 'queijo-cottage',
        name: 'Queijo Cottage',
        category: PRESET_CATEGORIES.DAIRY,
        portion: 50,
        calories: 50,
        protein: 6.5,
        carbs: 1.5,
        fat: 1.8,
        totalWeight: 400,
        price: 16.50,
        notes: 'Excelente queijo magro rico em caseína lenta absorção.'
    },
    {
        id: 'iogurte-natural-desnatado',
        name: 'Iogurte Natural Desnatado',
        category: PRESET_CATEGORIES.DAIRY,
        portion: 170,
        calories: 72,
        protein: 6.8,
        carbs: 9.5,
        fat: 0.5,
        totalWeight: 170,
        price: 3.80,
        notes: 'Base neutra saudável, moderada em proteínas.'
    },

    // Snacks e Barrinhas
    {
        id: 'barra-proteica-boa',
        name: 'Barra de Proteína Genuína (20g Prot)',
        category: PRESET_CATEGORIES.SNACKS,
        portion: 60,
        calories: 210,
        protein: 20,
        carbs: 16,
        fat: 7.5,
        totalWeight: 60,
        price: 13.90,
        notes: 'Boa proporção para um lanche doce prático com 20g de proteína.'
    },
    {
        id: 'tofu-firme',
        name: 'Tofu Firme',
        category: PRESET_CATEGORIES.PLANT_BASED,
        portion: 100,
        calories: 85,
        protein: 9.5,
        carbs: 2.0,
        fat: 4.5,
        totalWeight: 500,
        price: 14.00,
        notes: 'Excelente opção vegetal completa em aminoácidos essenciais.'
    },

    // Pegadinhas do Mercado ("Falsos Saudáveis")
    {
        id: 'barra-cereal-comum',
        name: 'Barra de Cereal Comum ("Com Proteína")',
        category: PRESET_CATEGORIES.COMMON_TRAPS,
        portion: 25,
        calories: 105,
        protein: 2.2,
        carbs: 17,
        fat: 3.2,
        totalWeight: 25,
        price: 3.20,
        notes: 'Pegadinha! Apenas ~8% das calorias vêm de proteína; o restante é açúcar e gordura.'
    },
    {
        id: 'pasta-amendoim',
        name: 'Pasta de Amendoim Integral',
        category: PRESET_CATEGORIES.COMMON_TRAPS,
        portion: 30,
        calories: 180,
        protein: 8.0,
        carbs: 6.0,
        fat: 14.0,
        totalWeight: 500,
        price: 18.90,
        notes: 'Excelente alimento calórico e fonte de gorduras boas, mas NÃO é fonte primária de proteína (% prot = 17%).'
    },
    {
        id: 'biscoito-fit-proteico',
        name: 'Biscoito Recheado "Fit/Proteico"',
        category: PRESET_CATEGORIES.COMMON_TRAPS,
        portion: 40,
        calories: 195,
        protein: 4.5,
        carbs: 24,
        fat: 9.0,
        totalWeight: 80,
        price: 8.50,
        notes: 'Cuidado! A alegação na frente da embalagem esconde alta quantidade de gorduras e açúcares.'
    }
];
