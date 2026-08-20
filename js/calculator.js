/**
 * calculator.js - Motor de cálculo nutricional e de custo-benefício
 */

const NUTRI_TIERS = {
    ELITE: {
        id: 'elite',
        name: 'Nível Elite',
        icon: '🏆',
        color: '#10b981', // Emerald neon
        bg: 'rgba(16, 185, 129, 0.15)',
        border: 'rgba(16, 185, 129, 0.4)',
        minPercentage: 50,
        minGramsPer100Kcal: 12.5,
        badgeText: 'Altíssima Eficiência',
        description: 'Excelente para bater a meta de proteínas sem estourar as calorias. Produto padrão-ouro!',
        examples: 'Exemplos: Whey Protein, Peito de Frango, Tilápia, Claras de Ovo.'
    },
    EXCELLENT: {
        id: 'excellent',
        name: 'Excelente Fonte',
        icon: '🥇',
        color: '#06b6d4', // Cyan
        bg: 'rgba(6, 182, 212, 0.15)',
        border: 'rgba(6, 182, 212, 0.4)',
        minPercentage: 35,
        minGramsPer100Kcal: 8.75,
        badgeText: 'Alta Densidade Proteica',
        description: 'Ótima opção proteica! Vale muito a pena incluir com frequência na dieta.',
        examples: 'Exemplos: Iogurtes tipo YoPRO/PRO, Queijo Cottage, Atum, Patinho Moído.'
    },
    GOOD: {
        id: 'good',
        name: 'Boa Fonte',
        icon: '🥈',
        color: '#3b82f6', // Blue
        bg: 'rgba(59, 130, 246, 0.15)',
        border: 'rgba(59, 130, 246, 0.4)',
        minPercentage: 20,
        minGramsPer100Kcal: 5.0,
        badgeText: 'Proteína Moderada/Boa',
        description: 'Boa fonte de proteína, embora venha acompanhada de gorduras ou carboidratos.',
        examples: 'Exemplos: Ovos Inteiros, Queijo Minas Frescal Light, Tofu, Leite Desnatado.'
    },
    MODERATE: {
        id: 'moderate',
        name: 'Fonte Complementar',
        icon: '⚖️',
        color: '#f59e0b', // Amber
        bg: 'rgba(245, 158, 11, 0.15)',
        border: 'rgba(245, 158, 11, 0.4)',
        minPercentage: 10,
        minGramsPer100Kcal: 2.5,
        badgeText: 'Densidade Regular',
        description: 'Contribui para o total do dia, mas a maior parte das calorias vem de carbo/gordura.',
        examples: 'Exemplos: Feijão, Lentilha, Aveia, Leite Integral, Pão Integral.'
    },
    LOW: {
        id: 'low',
        name: 'Cuidado / Pouca Proteína',
        icon: '⚠️',
        color: '#ef4444', // Red
        bg: 'rgba(239, 68, 68, 0.15)',
        border: 'rgba(239, 68, 68, 0.4)',
        minPercentage: 0,
        minGramsPer100Kcal: 0,
        badgeText: 'Falso Saudável / Baixa Proteína',
        description: 'Atenção! Mais de 90% das calorias vêm de açúcares/gorduras. Não compre pensando em bater proteína.',
        examples: 'Exemplos: Barrinhas de cereais comuns, Biscoitos "fit", Salgadinhos, Pasta de amendoim tradicional.'
    }
};

/**
 * Converte qualquer valor de entrada para número seguro (suporta vírgula decimal, string e null)
 */
function parseSafeNumber(val) {
    if (val === null || val === undefined || val === '') return 0;
    const num = parseFloat(String(val).replace(',', '.').trim());
    return (!isNaN(num) && isFinite(num)) ? Math.max(0, num) : 0;
}

/**
 * Calcula todas as métricas nutricionais e de custo de um produto de acordo com as regras solicitadas.
 * 
 * @param {Object} data
 * @param {number|string} data.calories - Calorias por porção (kcal)
 * @param {number|string} data.protein - Proteínas por porção (g)
 * @param {number|string} [data.carbs] - Carboidratos por porção (g)
 * @param {number|string} [data.fat] - Gorduras totais por porção (g)
 * @param {number|string} [data.portion] - Tamanho da porção (g ou ml)
 * @param {number|string} [data.totalWeight|data.weight] - Peso total da embalagem (g ou ml)
 * @param {number|string} [data.price] - Preço do produto (R$)
 * @returns {Object} Resultados completos
 */
function calculateNutritionalMetrics(data) {
    if (!data) {
        return {
            isValid: false,
            message: 'Insira os dados nutricionais para calcular.',
            proteinPercentage: 0,
            gramsPer100Kcal: 0,
            macroSplit: { proteinPct: 0, carbsPct: 0, fatPct: 0 }
        };
    }

    const calories = parseSafeNumber(data.calories);
    const protein = parseSafeNumber(data.protein);
    const carbs = parseSafeNumber(data.carbs);
    const fat = parseSafeNumber(data.fat);
    const portion = parseSafeNumber(data.portion);
    const totalWeight = parseSafeNumber(data.totalWeight !== undefined ? data.totalWeight : data.weight);
    const price = parseSafeNumber(data.price);

    // Validação inicial
    if (calories <= 0 || protein <= 0) {
        return {
            isValid: false,
            message: 'Insira pelo menos as calorias e as proteínas maiores que zero.',
            proteinPercentage: 0,
            gramsPer100Kcal: 0,
            macroSplit: { proteinPct: 0, carbsPct: 0, fatPct: 0 },
            raw: { calories, protein, carbs, fat, portion, totalWeight, price }
        };
    }

    // 1. Percentual de Proteína (% de Proteína):
    // Fórmula: ((proteinas * 4) / calorias) * 100. Se as calorias forem zero, retorne 0%.
    const proteinPercentage = calories > 0 ? ((protein * 4) / calories) * 100 : 0;

    // 2. Eficiência Proteica (EFICIÊNCIA):
    // Fórmula: (proteinas / calorias) * 100, formatando a saída como X.X g / 100 kcal
    const gramsPer100Kcal = calories > 0 ? (protein / calories) * 100 : 0;

    // 3. Divisão de Macronutrientes (MACROS P / C / G) - BASE CALÓRICA:
    // % Proteína = (proteína_g × 4) / calorias_totais × 100
    // % Carboidrato = (carboidrato_g × 4) / calorias_totais × 100
    // % Gordura = (gordura_g × 9) / calorias_totais × 100
    // Os três valores representam a distribuição calórica (% das calorias totais)
    const proteinCalories = protein * 4;
    const carbCalories = carbs * 4;
    const fatCalories = fat * 9;

    let proteinPct = 0;
    let carbsPct = 0;
    let fatPct = 0;

    if (calories > 0) {
        proteinPct = Math.round((proteinCalories / calories) * 100);
        carbsPct = Math.round((carbCalories / calories) * 100);
        fatPct = Math.round((fatCalories / calories) * 100);
    }

    const macroSplit = {
        proteinPct,
        carbsPct,
        fatPct,
        proteinCalories: Number(proteinCalories.toFixed(1)),
        carbCalories: Number(carbCalories.toFixed(1)),
        fatCalories: Number(fatCalories.toFixed(1)),
        proteinPctExact: Number(((proteinCalories / (calories || 1)) * 100).toFixed(1)),
        carbsPctExact: Number(((carbCalories / (calories || 1)) * 100).toFixed(1)),
        fatPctExact: Number(((fatCalories / (calories || 1)) * 100).toFixed(1))
    };

    // 4. Determinação do Tier / Veredito Nutricional
    let tier = NUTRI_TIERS.LOW;
    if (proteinPercentage >= NUTRI_TIERS.ELITE.minPercentage || gramsPer100Kcal >= NUTRI_TIERS.ELITE.minGramsPer100Kcal) {
        tier = NUTRI_TIERS.ELITE;
    } else if (proteinPercentage >= NUTRI_TIERS.EXCELLENT.minPercentage || gramsPer100Kcal >= NUTRI_TIERS.EXCELLENT.minGramsPer100Kcal) {
        tier = NUTRI_TIERS.EXCELLENT;
    } else if (proteinPercentage >= NUTRI_TIERS.GOOD.minPercentage || gramsPer100Kcal >= NUTRI_TIERS.GOOD.minGramsPer100Kcal) {
        tier = NUTRI_TIERS.GOOD;
    } else if (proteinPercentage >= NUTRI_TIERS.MODERATE.minPercentage || gramsPer100Kcal >= NUTRI_TIERS.MODERATE.minGramsPer100Kcal) {
        tier = NUTRI_TIERS.MODERATE;
    } else {
        tier = NUTRI_TIERS.LOW;
    }

    // 5. Custo por 30g de Proteína (CUSTO POR 30G DE PROTEÍNA):
    // Fórmula: proteinaTotalEmbalagem = (proteinas / porcao) * pesoLiquido
    // custoPorGrama = precoTotal / proteinaTotalEmbalagem
    // custoPor30g = custoPorGrama * 30
    let costAnalysis = null;
    if (price > 0 && totalWeight > 0 && portion > 0 && protein > 0) {
        const totalProteinInPackage = (protein / portion) * totalWeight;
        
        if (totalProteinInPackage > 0) {
            const costPerGramProtein = price / totalProteinInPackage;
            const costPer30gProtein = costPerGramProtein * 30;
            const costPer10gProtein = costPerGramProtein * 10;
            const pricePer100g = (price / totalWeight) * 100;
            const servingsPerPackage = totalWeight / portion;

            let costVerdict = 'Preço Justo';
            let costBadgeColor = '#3b82f6';

            if (costPer30gProtein <= 4.0) {
                costVerdict = '🔥 Super Econômico';
                costBadgeColor = '#10b981';
            } else if (costPer30gProtein <= 8.5) {
                costVerdict = '👍 Bom Custo-Benefício';
                costBadgeColor = '#06b6d4';
            } else if (costPer30gProtein <= 15.0) {
                costVerdict = '⏱️ Preço de Conveniência';
                costBadgeColor = '#f59e0b';
            } else {
                costVerdict = '💸 Proteína de Alto Custo';
                costBadgeColor = '#ef4444';
            }

            costAnalysis = {
                hasData: true,
                servingsPerPackage: Number(servingsPerPackage.toFixed(1)),
                totalProteinInPackage: Number(totalProteinInPackage.toFixed(1)),
                costPerGramProtein: Number(costPerGramProtein.toFixed(4)),
                costPer10gProtein: Number(costPer10gProtein.toFixed(2)),
                costPer30gProtein: Number(costPer30gProtein.toFixed(2)),
                pricePer100g: Number(pricePer100g.toFixed(2)),
                costVerdict,
                costBadgeColor
            };
        }
    }

    return {
        isValid: true,
        proteinPercentage: Number(proteinPercentage.toFixed(1)),
        gramsPer100Kcal: Number(gramsPer100Kcal.toFixed(1)),
        proteinCalories: Number((protein * 4).toFixed(1)),
        carbCalories: Number((carbs * 4).toFixed(1)),
        fatCalories: Number((fat * 9).toFixed(1)),
        macroSplit,
        tier,
        costAnalysis,
        raw: {
            calories,
            protein,
            carbs,
            fat,
            portion,
            totalWeight,
            price
        }
    };
}

// Exportações Globais (compatíveis com script padrão e file://)
window.NUTRI_TIERS = NUTRI_TIERS;
window.parseSafeNumber = parseSafeNumber;
window.calculateNutritionalMetrics = calculateNutritionalMetrics;
window.NutriCalc = { NUTRI_TIERS, parseSafeNumber, calculateNutritionalMetrics };
