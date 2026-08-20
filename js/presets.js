/**
 * presets.js - Gerenciador dinâmico de referências nutricionais a partir de arquivos JSON
 */

// Fallback inicial para garantir funcionamento mesmo em ambientes restritos (ex: file://)
export const DEFAULT_CATEGORIES = {
    PROTEIN_POWDERS: 'Suplementos Proteicos',
    MEATS: 'Carnes, Aves & Ovos',
    DAIRY: 'Laticínios & Iogurtes',
    SNACKS: 'Barrinhas & Snacks',
    PLANT_BASED: 'Fontes Vegetais & Grãos',
    COMMON_TRAPS: 'Pegadinhas ("Falsos Saudáveis")'
};

export const DEFAULT_PRESETS = [
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
    }
];

export let PRESET_CATEGORIES = { ...DEFAULT_CATEGORIES };
export let FOOD_PRESETS = [...DEFAULT_PRESETS];

/**
 * Carrega dinamicamente as categorias e os arquivos JSON de cada categoria
 * Permite que novos alimentos ou categorias sejam adicionados apenas criando/editando arquivos JSON na pasta data/
 */
export async function loadPresets() {
    try {
        const categoriesRes = await fetch('./data/categories.json');
        if (!categoriesRes.ok) throw new Error('Não foi possível carregar data/categories.json');
        const categoriesData = await categoriesRes.json();

        const newCategories = {};
        const allPresets = [];

        // Carrega cada arquivo JSON correspondente à categoria
        await Promise.all(
            categoriesData.map(async (cat) => {
                newCategories[cat.id] = cat.name;
                try {
                    const presetRes = await fetch(`./data/presets/${cat.file}`);
                    if (presetRes.ok) {
                        const items = await presetRes.json();
                        // Garante que cada item tenha a categoria correta associada
                        items.forEach(item => {
                            if (!item.category) item.category = cat.name;
                            allPresets.push(item);
                        });
                    }
                } catch (err) {
                    console.warn(`Aviso ao carregar ./data/presets/${cat.file}:`, err);
                }
            })
        );

        if (allPresets.length > 0) {
            FOOD_PRESETS = allPresets;
            PRESET_CATEGORIES = newCategories;
        }

        return {
            categories: PRESET_CATEGORIES,
            presets: FOOD_PRESETS
        };
    } catch (e) {
        console.warn('Usando presets padrão locais (fallback):', e);
        return {
            categories: PRESET_CATEGORIES,
            presets: FOOD_PRESETS
        };
    }
}
