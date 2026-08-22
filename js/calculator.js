/**
 * calculator.js - Motor de cálculo nutricional, classificação contextual e custo-benefício
 * Baseado no Sistema Geral de Fatores de Atwater, Tabela TACO / USDA e Diretrizes Científicas de Nutrição.
 * Desenvolvido para HingurLab
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
        badgeText: 'Altíssima Eficiência Proteica',
        defaultDescription: 'Excelente para bater a meta de proteínas sem estourar as calorias. Produto padrão-ouro!',
        examples: 'Exemplos: Whey Isolado/Concentrado 80%+, Peito de Frango, Tilápia, Claras de Ovo.'
    },
    EXCELLENT: {
        id: 'excellent',
        name: 'Excelente Densidade (Regra 10:1)',
        icon: '🥇',
        color: '#06b6d4', // Cyan
        bg: 'rgba(6, 182, 212, 0.15)',
        border: 'rgba(6, 182, 212, 0.4)',
        minPercentage: 40,
        minGramsPer100Kcal: 10.0,
        badgeText: 'Aprovado na Regra 10:1',
        defaultDescription: 'Excelente proporção proteica (≥ 1g de proteína a cada 10 kcal). Ótima escolha para o dia a dia.',
        examples: 'Exemplos: Iogurtes YoPRO/PRO, Queijo Cottage, Atum ao natural, Patinho bovino magro.'
    },
    GOOD: {
        id: 'good',
        name: 'Boa Fonte Proteica',
        icon: '🥈',
        color: '#3b82f6', // Blue
        bg: 'rgba(59, 130, 246, 0.15)',
        border: 'rgba(59, 130, 246, 0.4)',
        minPercentage: 25,
        minGramsPer100Kcal: 6.25,
        badgeText: 'Densidade Boa / Equilibrada',
        defaultDescription: 'Boa fonte de proteína, embora venha acompanhada de gorduras ou carboidratos moderados.',
        examples: 'Exemplos: Ovos Inteiros, Queijo Minas Frescal Light, Tofu, Leite Desnatado.'
    },
    MODERATE: {
        id: 'moderate',
        name: 'Fonte Complementar',
        icon: '⚖️',
        color: '#f59e0b', // Amber
        bg: 'rgba(245, 158, 11, 0.15)',
        border: 'rgba(245, 158, 11, 0.4)',
        minPercentage: 12,
        minGramsPer100Kcal: 3.0,
        badgeText: 'Densidade Regular / Mista',
        defaultDescription: 'Contribui para o total diário, mas a maior parte das calorias (> 75%) vem de carboidratos ou gorduras.',
        examples: 'Exemplos: Feijão, Lentilha, Grão-de-bico, Aveia, Leite Integral, Pão Integral.'
    },
    LOW: {
        id: 'low',
        name: 'Cuidado / Baixa Proteína',
        icon: '⚠️',
        color: '#ef4444', // Red
        bg: 'rgba(239, 68, 68, 0.15)',
        border: 'rgba(239, 68, 68, 0.4)',
        minPercentage: 0,
        minGramsPer100Kcal: 0,
        badgeText: 'Falso Saudável / Baixa Eficiência',
        defaultDescription: 'Atenção! Mais de 88% das calorias vêm de açúcares/gorduras. Não compre pensando em bater proteínas.',
        examples: 'Exemplos: Barrinhas de cereais doces, Biscoitos "fit", Salgadinhos, Pasta de amendoim tradicional.'
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
 * Gera análise contextual inteligente considerando não só a proteína, mas também
 * as calorias totais da porção, teor de carboidratos, teor de gorduras e possíveis inconsistências no rótulo.
 */
function generateContextualVerdict(params) {
    const { 
        calories, 
        declaredCalories,
        protein, 
        carbs, 
        fat, 
        proteinPercentage, 
        macroSplit, 
        rule10to1,
        hasCaloricInconsistency,
        macroSumKcal
    } = params;
    const { proteinPct, carbsPct, fatPct, otherPct } = macroSplit;

    const smartBadges = [];
    const observations = [];

    // 0. Alerta de Inconsistência de Macronutrientes (ex: digitar 100 kcal mas colocar 50g carb + 50g gord = 690 kcal)
    if (hasCaloricInconsistency) {
        smartBadges.push({
            type: 'warning',
            icon: '⚠️',
            label: 'Inconsistência Calórica',
            text: `Macros somam ${Math.round(macroSumKcal)} kcal (vs ${declaredCalories} kcal informadas)`,
            tooltip: `A soma de proteínas (${protein}g×4), carboidratos (${carbs}g×4) e gorduras (${fat}g×9) resulta em ${Math.round(macroSumKcal)} kcal. A física dos macronutrientes foi aplicada.`
        });
        observations.push(`Os macronutrientes informados totalizam ${Math.round(macroSumKcal)} kcal, excedendo as ${declaredCalories} kcal digitadas. O cálculo foi ajustado para a energia real dos nutrientes.`);
    }

    // 1. Badge da Regra 10:1 (Regra do Zero)
    if (rule10to1.passed) {
        smartBadges.push({
            type: 'success',
            icon: '🎯',
            label: 'Regra 10:1',
            text: `Aprovado (${rule10to1.kcalPerGram} kcal/g prot)`,
            tooltip: 'Tem pelo menos 1g de proteína para cada 10 kcal (ou seja, 40%+ das calorias vêm de proteína).'
        });
    } else {
        smartBadges.push({
            type: 'warning',
            icon: '⚠️',
            label: 'Regra 10:1',
            text: `Reprovado (${rule10to1.kcalPerGram} kcal/g prot)`,
            tooltip: 'Não cumpre a proporção de 1g de proteína a cada 10 kcal (ideal ≤ 10 kcal por grama de proteína).'
        });
    }

    // 2. Análise de Carga Calórica da Porção
    if (calories >= 600) {
        smartBadges.push({
            type: 'danger',
            icon: '🔥',
            label: 'Carga Calórica',
            text: `Hipercalórico (${calories} kcal/porção)`,
            tooltip: 'Porção com alto volume calórico. Ótimo para superávit (bulking), mas requer cautela em déficit calórico.'
        });
        observations.push(`Porção com densidade calórica altíssima (${calories} kcal). Apesar de conter ${protein}g de proteína, o custo calórico total é muito elevado.`);
    } else if (calories >= 350) {
        smartBadges.push({
            type: 'amber',
            icon: '⚡',
            label: 'Carga Calórica',
            text: `Calorias Moderadas (${calories} kcal)`,
            tooltip: 'Porção com volume calórico substancial.'
        });
    }

    // 3. Análise de Gorduras
    if (fatPct >= 50) {
        smartBadges.push({
            type: 'info',
            icon: '🥑',
            label: 'Lipídios',
            text: `${fatPct}% em Gordura`,
            tooltip: 'A maior parte da energia deste alimento vem de gorduras (9 kcal por grama).'
        });
        observations.push(`Predomínio de gorduras (${fatPct}% das calorias totais). Avalie se encaixa na sua cota diária de lipídios.`);
    } else if (fatPct >= 35) {
        smartBadges.push({
            type: 'info',
            icon: '🥑',
            label: 'Gordura',
            text: `${fatPct}% em Gordura`,
            tooltip: 'Presença considerável de gorduras.'
        });
    }

    // 4. Análise de Carboidratos
    if (carbsPct >= 50) {
        smartBadges.push({
            type: 'info',
            icon: '🌾',
            label: 'Carboidratos',
            text: `${carbsPct}% em Carbo`,
            tooltip: 'A maior parte da energia deste alimento vem de carboidratos (4 kcal por grama).'
        });
        observations.push(`Predomínio de carboidratos (${carbsPct}% das calorias). Atua primariamente como fonte energética.`);
    } else if (carbsPct >= 35) {
        smartBadges.push({
            type: 'info',
            icon: '🌾',
            label: 'Carbo',
            text: `${carbsPct}% em Carbo`,
            tooltip: 'Presença considerável de carboidratos.'
        });
    }

    // 5. Perfil de Pureza Proteica
    if (proteinPercentage >= 65 && fatPct <= 20 && carbsPct <= 20) {
        smartBadges.push({
            type: 'success',
            icon: '✨',
            label: 'Pureza',
            text: 'Proteína Limpa & Magra',
            tooltip: 'Baixíssimo teor de carboidratos e gorduras. Máximo rendimento proteico.'
        });
    }

    // 6. Construção do Texto de Veredito Contextual
    let headline = '';
    let recommendation = '';

    const nonProteinCalories = Math.max(0, calories - (protein * 4));
    const nonProteinPct = Math.max(0, 100 - proteinPct);

    if (hasCaloricInconsistency) {
        headline = `Dados com Inconsistência Calórica (${calories} kcal calculadas pelos macros).`;
        recommendation = `A soma dos macronutrientes resulta em ${Math.round(macroSumKcal)} kcal (${proteinPct}% Proteína, ${carbsPct}% Carbo, ${fatPct}% Gordura). A densidade proteica real é de ${proteinPercentage}%. Verifique a tabela nutricional do rótulo para confirmar os valores.`;
    } else if (calories >= 600) {
        headline = `Alimento Hipercalórico (${calories} kcal) com ${protein}g de Proteína.`;
        if (rule10to1.passed) {
            recommendation = `Embora cumpra a proporção da Regra 10:1 (${proteinPct}% proteico), traz ${Math.round(nonProteinCalories)} kcal (${nonProteinPct}%) provenientes de outros nutrientes (carbo/gordura). Excelente para superávit calórico (bulking), mas deve ser consumido com cautela se o objetivo for emagrecimento ou bater proteína de forma limpa.`;
        } else {
            recommendation = `Não cumpre a Regra 10:1. A esmagadora maioria das ${calories} kcal (${nonProteinPct}%) vem de carboidratos e gorduras. Não use como principal fonte de proteína para secar.`;
        }
    } else if (proteinPercentage >= 50) {
        headline = `Padrão-Ouro em Densidade Proteica (${proteinPercentage}% das calorias).`;
        recommendation = `Altíssima eficiência! Fornece ${protein}g de proteína com pouquíssimas calorias extras de carboidratos (${carbsPct}%) ou gorduras (${fatPct}%). Ideal para bater a meta diária com máxima economia calórica.`;
    } else if (proteinPercentage >= 40) {
        headline = `Excelente Densidade Proteica — Aprovado na Regra 10:1 (${proteinPercentage}%).`;
        if (fatPct > carbsPct && fatPct >= 30) {
            recommendation = `Atinge com folga a meta de 1g de proteína a cada 10 kcal. Vem acompanhado de gorduras (${fatPct}% das kcal), portanto contabilize os lipídios no seu planejamento diário.`;
        } else if (carbsPct >= 30) {
            recommendation = `Atinge a meta da Regra 10:1. Fornece energia mista com ${carbsPct}% em carboidratos, sendo ótimo para pré/pós-treino.`;
        } else {
            recommendation = `Excelente escolha proteica com ótimo equilíbrio entre macros e densidade nutricional.`;
        }
    } else if (proteinPercentage >= 25) {
        headline = `Boa Fonte Proteica (${proteinPercentage}%), porém com Carga de Carbo/Gordura (${nonProteinPct}%).`;
        if (fatPct >= 40) {
            recommendation = `Fonte sólida de proteína, mas os lipídios representam ${fatPct}% da energia total. Ótimo alimento integral, mas exige atenção às gorduras se estiver em dieta hipocalórica.`;
        } else {
            recommendation = `Alimento nutritivo e equilibrado. A maior parte das calorias (${nonProteinPct}%) vem de carbo/gordura, servindo como alimento misto.`;
        }
    } else if (proteinPercentage >= 12) {
        headline = `Fonte Mista/Complementar (${proteinPercentage}% de Proteína).`;
        recommendation = `Mais de 75% da energia (${nonProteinPct}%) é proveniente de carboidratos ou gorduras. Não deve ser considerado sua principal estratégia proteica, mas complementa bem as refeições.`;
    } else {
        headline = `Atenção: Baixa Densidade Proteica (< 12%).`;
        recommendation = `Mais de 88% das calorias vêm de carboidratos, açúcares ou gorduras. Se este produto for vendido no mercado com apelos como "rico em proteína" ou "fit", trata-se de uma pegadinha nutricional.`;
    }

    return {
        headline,
        description: recommendation,
        smartBadges,
        observations
    };
}

/**
 * Calcula todas as métricas nutricionais e de custo de um produto com rigor científico (Atwater).
 * 
 * @param {Object} data
 * @param {number|string} data.calories - Calorias por porção (kcal)
 * @param {number|string} data.protein - Proteínas por porção (g)
 * @param {number|string} [data.carbs] - Carboidratos por porção (g)
 * @param {number|string} [data.fat] - Gorduras totais por porção (g)
 * @param {number|string} [data.portion] - Tamanho da porção (g ou ml)
 * @param {number|string} [data.totalWeight|data.weight] - Peso total da embalagem (g ou ml)
 * @param {number|string} [data.price] - Preço do produto (R$)
 * @returns {Object} Resultados completos e validados
 */
function calculateNutritionalMetrics(data) {
    if (!data) {
        return {
            isValid: false,
            message: 'Insira os dados nutricionais para calcular.',
            proteinPercentage: 0,
            gramsPer100Kcal: 0,
            tier: NUTRI_TIERS.LOW,
            rule10to1: { passed: false, multiplierScore: 0, kcalPerGram: 0, ratioText: '0:1', statusText: 'Fora da Regra 10:1' },
            contextualVerdict: { headline: 'Aguardando Dados', description: 'Insira as calorias e proteínas do produto.', smartBadges: [], observations: [] },
            macroSplit: { proteinPct: 0, carbsPct: 0, fatPct: 0, otherPct: 0 }
        };
    }

    const declaredCalories = parseSafeNumber(data.calories);
    const protein = parseSafeNumber(data.protein);
    const carbs = parseSafeNumber(data.carbs);
    const fat = parseSafeNumber(data.fat);
    const portion = parseSafeNumber(data.portion);
    const totalWeight = parseSafeNumber(data.totalWeight !== undefined ? data.totalWeight : data.weight);
    const price = parseSafeNumber(data.price);

    // Validação inicial: é necessário ter pelo menos proteínas ou calorias
    if (protein <= 0 && declaredCalories <= 0) {
        return {
            isValid: false,
            message: 'Insira pelo menos as calorias e as proteínas maiores que zero.',
            proteinPercentage: 0,
            gramsPer100Kcal: 0,
            tier: NUTRI_TIERS.LOW,
            rule10to1: { passed: false, multiplierScore: 0, kcalPerGram: 0, ratioText: '0:1', statusText: 'Fora da Regra 10:1' },
            contextualVerdict: { headline: 'Aguardando Dados Nutricionais', description: 'Insira as calorias e proteínas do produto.', smartBadges: [], observations: [] },
            macroSplit: { proteinPct: 0, carbsPct: 0, fatPct: 0, otherPct: 0 },
            raw: { calories: declaredCalories, protein, carbs, fat, portion, totalWeight, price }
        };
    }

    // 1. Energia Fisiológica dos Macronutrientes (Atwater):
    // Proteína: 4 kcal/g | Carboidrato: 4 kcal/g | Gordura: 9 kcal/g
    const proteinCalories = protein * 4;
    const carbCalories = carbs * 4;
    const fatCalories = fat * 9;
    const macroSumKcal = proteinCalories + carbCalories + fatCalories;

    // Detecta se foi preenchimento parcial de macros
    const hasCarbs = data.carbs !== undefined && data.carbs !== null && String(data.carbs).trim() !== '';
    const hasFat = data.fat !== undefined && data.fat !== null && String(data.fat).trim() !== '';
    const isPartialMacros = !hasCarbs || !hasFat;

    // Se a soma física dos macronutrientes informados for maior que as calorias digitadas,
    // a física dos alimentos determina que o mínimo real são os macros (ex: 50g carbo + 50g gord = 650 kcal mínimas)
    const hasCaloricInconsistency = declaredCalories > 0 && macroSumKcal > (declaredCalories * 1.15);
    const effectiveCalories = Math.max(declaredCalories, macroSumKcal);

    // 2. Percentual de Proteína (% de Proteína no Alimento):
    // Denominador é sempre a energia real efetiva
    const proteinPercentage = effectiveCalories > 0 
        ? Math.min(100, (proteinCalories / effectiveCalories) * 100) 
        : 0;

    // 3. Eficiência Proteica (g de Proteína por 100 kcal):
    const gramsPer100Kcal = effectiveCalories > 0 
        ? (protein / effectiveCalories) * 100 
        : 0;

    // 4. Regra do 10:1 (Regra do Zero):
    // Multiplicar proteínas por 10 e comparar com as calorias efetivas.
    // Equivale a testar se tem pelo menos 1g de proteína a cada 10 kcal (≥ 40% das calorias totais).
    const rule10to1Multiplier = protein * 10;
    const rule10to1Passed = rule10to1Multiplier >= effectiveCalories;
    const kcalPerGramProtein = protein > 0 ? (effectiveCalories / protein) : 0;

    const rule10to1 = {
        passed: rule10to1Passed,
        multiplierScore: Number(rule10to1Multiplier.toFixed(1)),
        kcalPerGram: Number(kcalPerGramProtein.toFixed(1)),
        ratioText: `1g prot : ${kcalPerGramProtein.toFixed(1)} kcal`,
        statusText: rule10to1Passed ? 'Aprovado na Regra 10:1' : 'Fora da Regra 10:1'
    };

    // 5. Divisão Normalizada de Macronutrientes (SOMA É SEMPRE EXATAMENTE 100%):
    let proteinPct = 0;
    let carbsPct = 0;
    let fatPct = 0;
    let otherPct = 0;

    if (macroSumKcal > 0) {
        if (!isPartialMacros || macroSumKcal >= declaredCalories || declaredCalories <= 0) {
            // Todos os macros informados (ou macros superam calorias digitadas):
            // Distribuição relativa sobre a soma de energia dos macros:
            const pExact = (proteinCalories / macroSumKcal) * 100;
            const cExact = (carbCalories / macroSumKcal) * 100;
            const fExact = (fatCalories / macroSumKcal) * 100;

            proteinPct = Math.round(pExact);
            carbsPct = Math.round(cExact);
            fatPct = Math.round(fExact);

            // Ajuste de precisão para garantir soma estrita de 100%
            const sumCurrent = proteinPct + carbsPct + fatPct;
            if (sumCurrent !== 100 && sumCurrent > 0) {
                const diff = 100 - sumCurrent;
                if (proteinPct >= carbsPct && proteinPct >= fatPct) {
                    proteinPct += diff;
                } else if (carbsPct >= proteinPct && carbsPct >= fatPct) {
                    carbsPct += diff;
                } else {
                    fatPct += diff;
                }
            }
            otherPct = 0;
        } else {
            // Preenchimento parcial com calorias declaradas maiores que os macros informados:
            // Ex: 150 kcal, 20g prot (80 kcal), carbo e gordura vazios
            proteinPct = Math.round((proteinCalories / declaredCalories) * 100);
            carbsPct = Math.round((carbCalories / declaredCalories) * 100);
            fatPct = Math.round((fatCalories / declaredCalories) * 100);
            otherPct = Math.max(0, 100 - (proteinPct + carbsPct + fatPct));
        }
    } else if (declaredCalories > 0) {
        otherPct = 100;
    }

    const macroSplit = {
        proteinPct,
        carbsPct,
        fatPct,
        otherPct,
        proteinCalories: Number(proteinCalories.toFixed(1)),
        carbCalories: Number(carbCalories.toFixed(1)),
        fatCalories: Number(fatCalories.toFixed(1)),
        macroSumKcal: Number(macroSumKcal.toFixed(1)),
        proteinPctExact: Number(((proteinCalories / (effectiveCalories || 1)) * 100).toFixed(1)),
        carbsPctExact: Number(((carbCalories / (effectiveCalories || 1)) * 100).toFixed(1)),
        fatPctExact: Number(((fatCalories / (effectiveCalories || 1)) * 100).toFixed(1))
    };

    // 6. Determinação do Tier Nutricional
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

    // 7. Veredito Contextual Inteligente (combina calorias efetivas, gordura, carbo e inconsistências)
    const contextualVerdict = generateContextualVerdict({
        calories: effectiveCalories,
        declaredCalories,
        protein,
        carbs,
        fat,
        proteinPercentage: Number(proteinPercentage.toFixed(1)),
        macroSplit,
        rule10to1,
        hasCaloricInconsistency,
        macroSumKcal
    });

    // 8. Custo por 30g de Proteína (CUSTO POR 30G DE PROTEÍNA):
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
        declaredCalories,
        effectiveCalories,
        hasCaloricInconsistency,
        proteinPercentage: Number(proteinPercentage.toFixed(1)),
        gramsPer100Kcal: Number(gramsPer100Kcal.toFixed(1)),
        proteinCalories: Number(proteinCalories.toFixed(1)),
        carbCalories: Number(carbCalories.toFixed(1)),
        fatCalories: Number(fatCalories.toFixed(1)),
        macroSumKcal: Number(macroSumKcal.toFixed(1)),
        macroSplit,
        rule10to1,
        contextualVerdict,
        tier,
        costAnalysis,
        raw: {
            calories: declaredCalories,
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
window.generateContextualVerdict = generateContextualVerdict;
window.calculateNutritionalMetrics = calculateNutritionalMetrics;
window.NutriCalc = { NUTRI_TIERS, parseSafeNumber, generateContextualVerdict, calculateNutritionalMetrics };
