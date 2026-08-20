/**
 * calculator.js - Motor de cálculo nutricional e de custo-benefício
 */

export const NUTRI_TIERS = {
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
 * Calcula todas as métricas nutricionais e de custo de um produto
 * @param {Object} data
 * @param {number} data.calories - Calorias por porção (kcal)
 * @param {number} data.protein - Proteínas por porção (g)
 * @param {number} [data.carbs] - Carboidratos por porção (g)
 * @param {number} [data.fat] - Gorduras totais por porção (g)
 * @param {number} [data.portion] - Tamanho da porção (g ou ml)
 * @param {number} [data.totalWeight] - Peso total da embalagem (g ou ml)
 * @param {number} [data.price] - Preço do produto (R$)
 * @returns {Object} Resultados completos
 */
export function calculateNutritionalMetrics(data) {
    const calories = Math.max(0, Number(data.calories) || 0);
    const protein = Math.max(0, Number(data.protein) || 0);
    const carbs = Math.max(0, Number(data.carbs) || 0);
    const fat = Math.max(0, Number(data.fat) || 0);
    const portion = Math.max(0, Number(data.portion) || 0);
    const totalWeight = Math.max(0, Number(data.totalWeight) || 0);
    const price = Math.max(0, Number(data.price) || 0);

    if (calories <= 0 || protein <= 0) {
        return {
            isValid: false,
            message: 'Insira pelo menos as calorias e as proteínas maiores que zero.'
        };
    }

    // 1. Calorias por macronutriente
    const proteinCalories = protein * 4;
    const carbCalories = carbs * 4;
    const fatCalories = fat * 9;
    const calculatedTotalCalories = proteinCalories + carbCalories + fatCalories;

    // Usamos o maior valor entre o informado na tabela e o somatório dos macros para evitar % > 100% por arredondamentos da ANVISA
    const effectiveCalories = Math.max(calories, proteinCalories);

    // 2. Percentual calórico de proteína
    const proteinPercentage = Math.min(100, (proteinCalories / effectiveCalories) * 100);

    // 3. Índice de Eficiência Proteica (g de proteína por 100 kcal)
    const gramsPer100Kcal = (protein / effectiveCalories) * 100;

    // 4. Determinação da Categoria / Veredito
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

    // 5. Distribuição de Macros (%)
    let macroSplit = {
        proteinPct: 0,
        carbsPct: 0,
        fatPct: 0
    };

    if (calculatedTotalCalories > 0) {
        macroSplit = {
            proteinPct: Math.round((proteinCalories / calculatedTotalCalories) * 100),
            carbsPct: Math.round((carbCalories / calculatedTotalCalories) * 100),
            fatPct: Math.round((fatCalories / calculatedTotalCalories) * 100)
        };
    } else {
        macroSplit = {
            proteinPct: Math.round(proteinPercentage),
            carbsPct: 0,
            fatPct: 0
        };
    }

    // 6. Cálculos de Custo-Benefício (se peso e preço foram fornecidos)
    let costAnalysis = null;
    if (price > 0 && totalWeight > 0 && portion > 0) {
        const servingsPerPackage = totalWeight / portion;
        const totalProteinInPackage = servingsPerPackage * protein;
        const costPerGramProtein = price / totalProteinInPackage;
        const costPer10gProtein = costPerGramProtein * 10;
        const costPer30gProtein = costPerGramProtein * 30; // 30g é uma dose padrão de referência (ex: scoop de whey ou bife)
        const pricePer100g = (price / totalWeight) * 100;

        // Classificação do Custo por 30g de proteína:
        // < R$ 4,00: Super Econômico (Ovo, Frango cru)
        // R$ 4,00 a R$ 8,00: Bom custo-benefício (Whey concentrado, Patinho, Leite)
        // R$ 8,01 a R$ 15,00: Moderado / Conveniência (Iogurtes proteicos prontos)
        // > R$ 15,00: Caro (Barrinhas gourmet, snacks proteicos caros)
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

    return {
        isValid: true,
        proteinPercentage: Number(proteinPercentage.toFixed(1)),
        gramsPer100Kcal: Number(gramsPer100Kcal.toFixed(1)),
        proteinCalories: Number(proteinCalories.toFixed(1)),
        carbCalories: Number(carbCalories.toFixed(1)),
        fatCalories: Number(fatCalories.toFixed(1)),
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
