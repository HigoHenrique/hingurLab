/**
 * presets.js - Banco de referências nutricionais com suporte a execução local (file://),
 * consumo resiliente de GitHub Gist / Nuvem com cache local (Stale-While-Revalidate) e fallback modular.
 */

const GIST_CACHE_STORAGE_KEY = 'hingurlab_cloud_presets_cache_v2';
const GIST_URL_STORAGE_KEY = 'hingurlab_custom_gist_url';

/**
 * Obtém a URL do Gist configurada a partir de múltiplas origens:
 * 1. Query param da URL: ?gist=...
 * 2. LocalStorage: hingurlab_custom_gist_url
 * 3. window.ENV / window.__ENV__ (injetado pelo deploy ou env.js)
 */
function getResolvedGistUrl() {
    if (typeof window === 'undefined') return '';
    
    // 1. Query Param (?gist=ID_OU_URL)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryGist = urlParams.get('gist');
        if (queryGist && queryGist.trim()) {
            return queryGist.trim();
        }
    } catch (e) {}

    // 2. LocalStorage
    try {
        const savedGist = localStorage.getItem(GIST_URL_STORAGE_KEY);
        if (savedGist && savedGist.trim()) {
            return savedGist.trim();
        }
    } catch (e) {}

    // 3. Environment Variables
    const envGist = window.ENV?.GIST_FOOD_DATABASE_URL || window.__ENV__?.GIST_FOOD_DATABASE_URL;
    if (envGist && typeof envGist === 'string' && envGist.trim()) {
        return envGist.trim();
    }

    return '';
}

/**
 * ==========================================================================
 * CONFIGURAÇÃO GERAL DO APLICATIVO (HINGURLAB)
 * ==========================================================================
 */
window.APP_CONFIG = {
    ATIVAR_DADOS: (() => {
        if (typeof window === 'undefined') return true;
        const val = window.ENV?.ATIVAR_DADOS ?? window.__ENV__?.ATIVAR_DADOS;
        if (val === undefined || val === null || val === '') return true;
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') {
            const lower = val.trim().toLowerCase();
            return lower === 'true' || lower === '1' || lower === 'sim';
        }
        return Boolean(val);
    })(),

    GIST_FOOD_DATABASE_URL: getResolvedGistUrl()
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
    {
        id: 'creatina-pura',
        name: 'Creatina Monohidratada 100% Pura',
        category: 'Suplementos Proteicos',
        portion: 5,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        totalWeight: 300,
        price: 79.90,
        notes: 'Aminoácido ergogênico de alta performance (não pontua proteína direta).'
    },
    {
        id: 'albumina-pura',
        name: 'Albumina Pura (Clara Desidratada)',
        category: 'Suplementos Proteicos',
        portion: 30,
        calories: 115,
        protein: 24,
        carbs: 1.0,
        fat: 0,
        totalWeight: 500,
        price: 49.90,
        notes: 'Excelente fonte proteica de baixo custo e absorção gradual.'
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
        id: 'tilapia-grelhada',
        name: 'Filé de Tilápia Grelhado',
        category: 'Carnes, Aves & Ovos',
        portion: 100,
        calories: 128,
        protein: 26,
        carbs: 0,
        fat: 2.7,
        totalWeight: 800,
        price: 34.90,
        notes: 'Peixe branco magro de altíssima eficiência proteica.'
    },
    {
        id: 'ovos-inteiros',
        name: 'Ovos de Galinha Inteiros (2 Unidades)',
        category: 'Carnes, Aves & Ovos',
        portion: 100,
        calories: 143,
        protein: 13,
        carbs: 0.7,
        fat: 9.5,
        totalWeight: 600,
        price: 13.90,
        notes: 'Alta biodisponibilidade proteica com gorduras saudáveis e colina.'
    },
    {
        id: 'claras-pasteurizadas',
        name: 'Clara de Ovo Pasteurizada',
        category: 'Carnes, Aves & Ovos',
        portion: 100,
        calories: 52,
        protein: 11,
        carbs: 0.7,
        fat: 0.2,
        totalWeight: 1000,
        price: 18.90,
        notes: '100% proteína pura livre de gorduras.'
    },

    // Laticínios & Iogurtes
    {
        id: 'yopro-15g',
        name: 'Bebida Láctea Tipo YoPRO (15g)',
        category: 'Laticínios & Iogurtes',
        portion: 250,
        calories: 140,
        protein: 15,
        carbs: 15,
        fat: 1.8,
        totalWeight: 250,
        price: 7.99,
        notes: 'Opção proteica pronta e prática para lanches rápidos.'
    },
    {
        id: 'yopro-25g',
        name: 'Bebida Láctea Tipo YoPRO (25g)',
        category: 'Laticínios & Iogurtes',
        portion: 250,
        calories: 160,
        protein: 25,
        carbs: 11,
        fat: 1.5,
        totalWeight: 250,
        price: 9.99,
        notes: 'Excelente concentração proteica em dose de conveniência.'
    },
    {
        id: 'queijo-cottage',
        name: 'Queijo Cottage Tradicional',
        category: 'Laticínios & Iogurtes',
        portion: 100,
        calories: 98,
        protein: 12.5,
        carbs: 3.4,
        fat: 4.3,
        totalWeight: 400,
        price: 16.90,
        notes: 'Queijo magro rico em caseína de lenta digestão.'
    },
    {
        id: 'queijo-minas-frescal-light',
        name: 'Queijo Minas Frescal Light',
        category: 'Laticínios & Iogurtes',
        portion: 100,
        calories: 160,
        protein: 18,
        carbs: 2.0,
        fat: 8.5,
        totalWeight: 500,
        price: 24.90,
        notes: 'Opção saborosa com teor de gordura reduzido.'
    },
    {
        id: 'leite-desnatado',
        name: 'Leite Desnatado (1 Litro)',
        category: 'Laticínios & Iogurtes',
        portion: 200,
        calories: 70,
        protein: 6.5,
        carbs: 10,
        fat: 0.2,
        totalWeight: 1000,
        price: 4.89,
        notes: 'Excelente relação de custo por grama de proteína diária.'
    },

    // Barrinhas & Snacks
    {
        id: 'barra-nutry-protein',
        name: 'Barra Proteica Comercial (15g Prot)',
        category: 'Barrinhas & Snacks',
        portion: 45,
        calories: 160,
        protein: 15,
        carbs: 14,
        fat: 5.0,
        totalWeight: 45,
        price: 6.50,
        notes: 'Boa opção intermediária de conveniência na rua.'
    },
    {
        id: 'barra-dark-bar',
        name: 'Barra Hiperproteica (30g Prot)',
        category: 'Barrinhas & Snacks',
        portion: 90,
        calories: 340,
        protein: 30,
        carbs: 33,
        fat: 9.8,
        totalWeight: 90,
        price: 13.90,
        notes: 'Substituto de refeição substancial para dias corridos.'
    },
    {
        id: 'chips-proteico',
        name: 'Snack Salgado de Soja / Proteico',
        category: 'Barrinhas & Snacks',
        portion: 30,
        calories: 120,
        protein: 10,
        carbs: 12,
        fat: 3.5,
        totalWeight: 30,
        price: 8.50,
        notes: 'Substituto crocante proteico para salgadinhos tradicionais.'
    },

    // Fontes Vegetais & Grãos
    {
        id: 'tofu-firme',
        name: 'Tofu Firme Natural',
        category: 'Fontes Vegetais & Grãos',
        portion: 100,
        calories: 76,
        protein: 8.1,
        carbs: 1.9,
        fat: 4.8,
        totalWeight: 500,
        price: 14.50,
        notes: 'Excelente base proteica vegetal pura e versátil.'
    },
    {
        id: 'proteina-soja-texturizada',
        name: 'Proteína Texturizada de Soja (PTS)',
        category: 'Fontes Vegetais & Grãos',
        portion: 50,
        calories: 145,
        protein: 25,
        carbs: 10,
        fat: 0.5,
        totalWeight: 400,
        price: 7.90,
        notes: 'Campeã absoluta de economia e densidade proteica vegetal.'
    },
    {
        id: 'feijao-carioca-cozido',
        name: 'Feijão Carioca Cozido',
        category: 'Fontes Vegetais & Grãos',
        portion: 100,
        calories: 76,
        protein: 4.8,
        carbs: 13.6,
        fat: 0.5,
        totalWeight: 1000,
        price: 7.50,
        notes: 'Base da alimentação com carboidratos complexos e fibras.'
    },
    {
        id: 'lentilha-cozida',
        name: 'Lentilha Cozida',
        category: 'Fontes Vegetais & Grãos',
        portion: 100,
        calories: 116,
        protein: 9.0,
        carbs: 20.0,
        fat: 0.4,
        totalWeight: 500,
        price: 8.90,
        notes: 'Leguminosa rica em ferro, fibras e proteína.'
    },

    // Pegadinhas ("Falsos Saudáveis")
    {
        id: 'barrinha-cereal-doce',
        name: 'Barra de Cereal Tradicional (Fit)',
        category: 'Pegadinhas ("Falsos Saudáveis")',
        portion: 25,
        calories: 95,
        protein: 1.0,
        carbs: 19,
        fat: 1.8,
        totalWeight: 75,
        price: 3.50,
        notes: '⚠️ PEGADINHA: Apenas 4% das calorias vêm de proteína. Quase puro açúcar.'
    },
    {
        id: 'pasta-amendoim-tradicional',
        name: 'Pasta de Amendoim Tradicional',
        category: 'Pegadinhas ("Falsos Saudáveis")',
        portion: 30,
        calories: 180,
        protein: 7.0,
        carbs: 6.0,
        fat: 15.0,
        totalWeight: 500,
        price: 19.90,
        notes: '⚠️ ALERTA: Excelente fonte de gordura, mas 75% das calorias vêm de lipídios.'
    },
    {
        id: 'bebida-lactea-tradicional',
        name: 'Bebida Láctea Achocolatada Comum',
        category: 'Pegadinhas ("Falsos Saudáveis")',
        portion: 200,
        calories: 180,
        protein: 4.0,
        carbs: 32,
        fat: 4.0,
        totalWeight: 200,
        price: 3.50,
        notes: '⚠️ PEGADINHA: Rico em açúcar adicionado e baixa densidade proteica.'
    }
];

let PRESET_CATEGORIES = { ...DEFAULT_CATEGORIES };
let FOOD_PRESETS = [...DEFAULT_PRESETS];

// Tenta restaurar do cache imediatamente na inicialização
try {
    const cachedData = localStorage.getItem(GIST_CACHE_STORAGE_KEY);
    if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed && Array.isArray(parsed.presets) && parsed.presets.length > 0) {
            FOOD_PRESETS = parsed.presets;
            if (parsed.categories && typeof parsed.categories === 'object') {
                PRESET_CATEGORIES = { ...DEFAULT_CATEGORIES, ...parsed.categories };
            }
            console.log(`[HingurLab] ⚡ ${FOOD_PRESETS.length} presets carregados instantaneamente do cache local!`);
        }
    }
} catch (cacheErr) {
    console.warn('[HingurLab] Não foi possível ler o cache local inicial:', cacheErr);
}

/**
 * Função utilitária para extrair e normalizar itens de dados obtidos de um JSON/Gist
 */
function normalizePresetsPayload(data) {
    let presets = [];
    let categories = {};

    if (!data) return { presets, categories };

    if (Array.isArray(data)) {
        presets = data;
    } else if (data.presets && Array.isArray(data.presets)) {
        presets = data.presets;
        if (data.categories && typeof data.categories === 'object') {
            categories = data.categories;
        }
    }

    return { presets, categories };
}

/**
 * Carrega dinamicamente os alimentos da nuvem (Gist/URL) ou dos arquivos locais em data/.
 * Implementa Stale-While-Revalidate com cache no LocalStorage para garantir 100% de disponibilidade.
 */
async function loadPresets() {
    const gistUrlInput = getResolvedGistUrl();

    // 1. Se houver configuração de Gist / Nuvem
    if (gistUrlInput) {
        try {
            const rawInput = gistUrlInput.trim();
            let cloudPresets = [];
            let cloudCategories = { ...DEFAULT_CATEGORIES };

            // Extrai o hash ID do Gist se for um link de Gist
            const idMatch = rawInput.match(/([a-f0-9]{20,40})/i);
            const gistId = idMatch ? idMatch[1] : null;

            // Estratégia A: Se o input for uma URL direta completa (ex: URL raw do GitHub ou JSON público)
            if (rawInput.startsWith('http://') || rawInput.startsWith('https://')) {
                try {
                    const directRes = await fetch(rawInput, { cache: 'no-cache' });
                    if (directRes.ok) {
                        const directJson = await directRes.json();
                        const { presets, categories } = normalizePresetsPayload(directJson);
                        if (presets.length > 0) {
                            cloudPresets = presets;
                            cloudCategories = { ...cloudCategories, ...categories };
                        }
                    }
                } catch (directErr) {
                    console.warn('[HingurLab] Tentativa de URL direta falhou, prosseguindo com estratégias Gist:', directErr);
                }
            }

            // Estratégia B: Se identificou um Gist ID, tenta primeiro via GitHub Raw Gist (sem limite de 60 req/h)
            if (cloudPresets.length === 0 && gistId) {
                const rawGistEndpoints = [
                    `https://gist.githubusercontent.com/raw/${gistId}`,
                    `https://gist.githubusercontent.com/raw/${gistId}/dados-alimentos.json`,
                    `https://gist.githubusercontent.com/raw/${gistId}/alimentos.json`,
                    `https://gist.githubusercontent.com/raw/${gistId}/data.json`
                ];

                for (const rawUrl of rawGistEndpoints) {
                    try {
                        const rawRes = await fetch(`${rawUrl}?_t=${Date.now()}`);
                        if (rawRes.ok) {
                            const rawData = await rawRes.json();
                            const { presets, categories } = normalizePresetsPayload(rawData);
                            if (presets.length > 0) {
                                cloudPresets = presets;
                                cloudCategories = { ...cloudCategories, ...categories };
                                break;
                            }
                        }
                    } catch (e) {
                        // Tenta próximo endpoint
                    }
                }
            }

            // Estratégia C: Tenta via GitHub Gist API oficial
            if (cloudPresets.length === 0 && gistId) {
                try {
                    const apiRes = await fetch(`https://api.github.com/gists/${gistId}?_t=${Date.now()}`);
                    if (apiRes.ok) {
                        const gistData = await apiRes.json();
                        if (gistData && gistData.files) {
                            Object.values(gistData.files).forEach(fileObj => {
                                if (fileObj && fileObj.content) {
                                    try {
                                        const parsed = JSON.parse(fileObj.content);
                                        const { presets, categories } = normalizePresetsPayload(parsed);
                                        if (presets.length > 0) {
                                            cloudPresets = cloudPresets.concat(presets);
                                            cloudCategories = { ...cloudCategories, ...categories };
                                        }
                                    } catch (parseErr) {
                                        console.warn('[HingurLab] Erro ao decodificar arquivo do Gist:', fileObj.filename, parseErr);
                                    }
                                }
                            });
                        }
                    }
                } catch (apiErr) {
                    console.warn('[HingurLab] API oficial do Gist indisponível ou limitada:', apiErr);
                }
            }

            // Se obteve com sucesso os dados da nuvem
            if (cloudPresets.length > 0) {
                // Indexa dinamicamente novas categorias
                cloudPresets.forEach(item => {
                    if (item.category && !Object.values(cloudCategories).includes(item.category)) {
                        const catKey = item.category.toUpperCase().replace(/[^A-Z0-9]/g, '_');
                        cloudCategories[catKey] = item.category;
                    }
                });

                FOOD_PRESETS = cloudPresets;
                PRESET_CATEGORIES = cloudCategories;
                window.FOOD_PRESETS = FOOD_PRESETS;
                window.PRESET_CATEGORIES = PRESET_CATEGORIES;

                // Salva no LocalStorage com timestamp para uso offline e persistência
                try {
                    localStorage.setItem(GIST_CACHE_STORAGE_KEY, JSON.stringify({
                        timestamp: Date.now(),
                        presets: cloudPresets,
                        categories: cloudCategories
                    }));
                } catch (saveErr) {}

                console.log(`[HingurLab] 🌐 ${cloudPresets.length} alimentos atualizados da nuvem (Gist)!`);
                return { categories: PRESET_CATEGORIES, presets: FOOD_PRESETS };
            }
        } catch (gistErr) {
            console.warn('[HingurLab] Erro ao carregar nuvem, usando cache ou presets locais:', gistErr);
        }
    }

    // 2. Se já possuímos presets do cache local, utiliza-os
    if (FOOD_PRESETS && FOOD_PRESETS.length > 0 && FOOD_PRESETS !== DEFAULT_PRESETS) {
        window.FOOD_PRESETS = FOOD_PRESETS;
        window.PRESET_CATEGORIES = PRESET_CATEGORIES;
        return { categories: PRESET_CATEGORIES, presets: FOOD_PRESETS };
    }

    // 3. Se estiver em file:// retorna presets padrão
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        window.FOOD_PRESETS = FOOD_PRESETS;
        window.PRESET_CATEGORIES = PRESET_CATEGORIES;
        return { categories: PRESET_CATEGORIES, presets: FOOD_PRESETS };
    }

    // 4. Fallback: Carrega dos arquivos JSON locais em data/
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
                } catch (err) {}
            })
        );

        if (allPresets.length > 0) {
            FOOD_PRESETS = allPresets;
            PRESET_CATEGORIES = newCategories;
            window.FOOD_PRESETS = FOOD_PRESETS;
            window.PRESET_CATEGORIES = PRESET_CATEGORIES;
        }

        return { categories: PRESET_CATEGORIES, presets: FOOD_PRESETS };
    } catch (e) {
        return { categories: PRESET_CATEGORIES, presets: FOOD_PRESETS };
    }
}

// Exportações Globais
window.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
window.DEFAULT_PRESETS = DEFAULT_PRESETS;
window.PRESET_CATEGORIES = PRESET_CATEGORIES;
window.FOOD_PRESETS = FOOD_PRESETS;
window.loadPresets = loadPresets;
window.getResolvedGistUrl = getResolvedGistUrl;
window.NutriPresets = { PRESET_CATEGORIES, FOOD_PRESETS, loadPresets, getResolvedGistUrl };
