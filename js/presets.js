/**
 * presets.js - Banco de referências nutricionais com suporte a execução local (file://) e web (http/https)
 */

/**
 * ==========================================================================
 * CONFIGURAÇÃO GERAL DO APLICATIVO (HINGURLAB)
 * ==========================================================================
 */
window.APP_CONFIG = {
    /**
     * ATIVAR_DADOS:
     * - true  -> Exibe todas as opções de alimentos de referência (Aba de Alimentos, Teste Rápido, Duelo).
     * - false -> Remove COMPLETAMENTE todos os alimentos de referência do site inteiro,
     *            transformando o HingurLab em uma calculadora 100% pura e focada.
     */
    ATIVAR_DADOS: true,

    /**
     * GIST_FOOD_DATABASE_URL (opcional):
     * - Cole aqui a URL 'raw' ou o link do seu GitHub Gist para carregar
     *   os alimentos da nuvem em tempo real para todos os usuários sem precisar de deploy.
     */
    GIST_FOOD_DATABASE_URL: ''
};

const DEFAULT_CATEGORIES = {
    PROTEIN_POWDERS: 'Suplementos Proteicos',
    MEATS: 'Carnes, Aves & Ovos',
    DAIRY: 'Laticínios & Iogurtes',
    SNACKS: 'Barrinhas & Snacks',
    PLANT_BASED: 'Fontes Vegetais & Grãos',
    COMMON_TRAPS: 'Pegadinhas ("Falsos Saudáveis")'
};

const DEFAULT_PRESETS = [
    // Suplementos Proteicos
    {
        id: 'whey-concentrado',
        name: 'Whey Protein 80% Concentrado',
        category: 'Suplementos Proteicos',
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
        category: 'Suplementos Proteicos',
        portion: 30,
        calories: 110,
        protein: 27,
        carbs: 0.5,
        fat: 0.2,
        totalWeight: 900,
        price: 159.90,
        notes: 'Praticamente zero carboidrato e gordura.'
    },

    // Carnes, Aves & Ovos
    {
        id: 'peito-frango-grelhado',
        name: 'Peito de Frango Grelhado',
        category: 'Carnes, Aves & Ovos',
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
        category: 'Carnes, Aves & Ovos',
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
        category: 'Carnes, Aves & Ovos',
        portion: 100,
        calories: 143,
        protein: 13,
        carbs: 1.0,
        fat: 9.5,
        totalWeight: 600,
        price: 13.50,
        notes: 'Excelente biodisponibilidade, porém vem com a gordura natural da gema.'
    },
    {
        id: 'clara-de-ovo',
        name: 'Clara de Ovo Pasteurizada',
        category: 'Carnes, Aves & Ovos',
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
        category: 'Carnes, Aves & Ovos',
        portion: 60,
        calories: 65,
        protein: 14,
        carbs: 0,
        fat: 0.8,
        totalWeight: 170,
        price: 9.90,
        notes: 'Prático e muito magro quando conservado em água.'
    },

    // Laticínios & Iogurtes
    {
        id: 'iogurte-yopro-15g',
        name: 'Iogurte Líquido Hiperproteico (15g Prot)',
        category: 'Laticínios & Iogurtes',
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
        category: 'Laticínios & Iogurtes',
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
        category: 'Laticínios & Iogurtes',
        portion: 170,
        calories: 72,
        protein: 6.8,
        carbs: 9.5,
        fat: 0.5,
        totalWeight: 170,
        price: 3.80,
        notes: 'Base neutra saudável, moderada em proteínas.'
    },

    // Barrinhas & Snacks
    {
        id: 'barra-proteica-boa',
        name: 'Barra de Proteína Genuína (20g Prot)',
        category: 'Barrinhas & Snacks',
        portion: 60,
        calories: 210,
        protein: 20,
        carbs: 16,
        fat: 7.5,
        totalWeight: 60,
        price: 13.90,
        notes: 'Boa proporção para um lanche doce prático com 20g de proteína.'
    },

    // Fontes Vegetais & Grãos
    {
        id: 'tofu-firme',
        name: 'Tofu Firme',
        category: 'Fontes Vegetais & Grãos',
        portion: 100,
        calories: 85,
        protein: 9.5,
        carbs: 2.0,
        fat: 4.5,
        totalWeight: 500,
        price: 14.00,
        notes: 'Excelente opção vegetal completa em aminoácidos essenciais.'
    },

    // Pegadinhas ("Falsos Saudáveis")
    {
        id: 'barra-cereal-comum',
        name: 'Barra de Cereal Comum ("Com Proteína")',
        category: 'Pegadinhas ("Falsos Saudáveis")',
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
        category: 'Pegadinhas ("Falsos Saudáveis")',
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
        category: 'Pegadinhas ("Falsos Saudáveis")',
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

let PRESET_CATEGORIES = { ...DEFAULT_CATEGORIES };
let FOOD_PRESETS = [...DEFAULT_PRESETS];

/**
 * Carrega dinamicamente as categorias e os arquivos JSON de cada categoria quando sob HTTP/HTTPS.
 * Em file:// usa os dados embutidos instantaneamente com zero erros de CORS.
 */
async function loadPresets() {
    // 1. Se estiver configurado um Gist público na nuvem, busca direto da nuvem
    if (window.APP_CONFIG && window.APP_CONFIG.GIST_FOOD_DATABASE_URL) {
        try {
            let gistUrl = window.APP_CONFIG.GIST_FOOD_DATABASE_URL.trim();
            if (gistUrl) {
                // Adiciona timestamp para ignorar cache do CDN
                const separator = gistUrl.includes('?') ? '&' : '?';
                const finalUrl = `${gistUrl}${separator}_t=${Date.now()}`;

                const res = await fetch(finalUrl);
                if (res.ok) {
                    const cloudData = await res.json();
                    let cloudPresets = [];
                    let cloudCategories = { ...DEFAULT_CATEGORIES };

                    if (Array.isArray(cloudData)) {
                        cloudPresets = cloudData;
                    } else if (cloudData.presets && Array.isArray(cloudData.presets)) {
                        cloudPresets = cloudData.presets;
                        if (cloudData.categories) {
                            cloudCategories = { ...cloudCategories, ...cloudData.categories };
                        }
                    }

                    if (cloudPresets.length > 0) {
                        FOOD_PRESETS = cloudPresets;
                        PRESET_CATEGORIES = cloudCategories;
                        window.FOOD_PRESETS = FOOD_PRESETS;
                        window.PRESET_CATEGORIES = PRESET_CATEGORIES;
                        return { categories: PRESET_CATEGORIES, presets: FOOD_PRESETS };
                    }
                }
            }
        } catch (gistErr) {
            console.warn('[HingurLab] Falha ao carregar Gist, usando presets locais como fallback:', gistErr);
        }
    }

    // 2. Se estiver em file:// retorna presets padrão locais instantâneos
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        return {
            categories: PRESET_CATEGORIES,
            presets: FOOD_PRESETS
        };
    }

    // 3. Fallback: Carrega dos arquivos JSON locais em data/
    try {
        const categoriesRes = await fetch('./data/categories.json');
        if (!categoriesRes.ok) return { categories: PRESET_CATEGORIES, presets: FOOD_PRESETS };
        const categoriesData = await categoriesRes.json();

        const newCategories = {};
        const allPresets = [];

        await Promise.all(
            categoriesData.map(async (cat) => {
                newCategories[cat.id] = cat.name;
                try {
                    const presetRes = await fetch(`./data/presets/${cat.file}`);
                    if (presetRes.ok) {
                        const items = await presetRes.json();
                        items.forEach(item => {
                            if (!item.category) item.category = cat.name;
                            allPresets.push(item);
                        });
                    }
                } catch (err) {
                    // Fallback silencioso
                }
            })
        );

        if (allPresets.length > 0) {
            FOOD_PRESETS = allPresets;
            PRESET_CATEGORIES = newCategories;
            window.FOOD_PRESETS = FOOD_PRESETS;
            window.PRESET_CATEGORIES = PRESET_CATEGORIES;
        }

        return {
            categories: PRESET_CATEGORIES,
            presets: FOOD_PRESETS
        };
    } catch (e) {
        return {
            categories: PRESET_CATEGORIES,
            presets: FOOD_PRESETS
        };
    }
}

// Exportações Globais
window.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
window.DEFAULT_PRESETS = DEFAULT_PRESETS;
window.PRESET_CATEGORIES = PRESET_CATEGORIES;
window.FOOD_PRESETS = FOOD_PRESETS;
window.loadPresets = loadPresets;
window.NutriPresets = { PRESET_CATEGORIES, FOOD_PRESETS, loadPresets };
