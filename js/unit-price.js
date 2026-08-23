/**
 * unit-price.js - Comparador de Preço por Unidade e Calculadora de Custo-Benefício
 * Desenvolvido para HingurLab
 */

// ==========================================
// 1. Definições de Unidades e Grandezas
// ==========================================
const UNIT_DEFINITIONS = {
    // Unidades contáveis
    unit: {
        category: 'unit',
        categoryLabel: 'Unidades',
        baseUnit: 'un',
        displayStandardUnit: 'unidade',
        standardMultiplier: 1,
        options: [
            { value: 'unit', label: 'Unidade (un)', factor: 1, symbol: 'un' }
        ]
    },
    // Peso / Massa
    weight: {
        category: 'weight',
        categoryLabel: 'Peso / Massa',
        baseUnit: 'g',
        displayStandardUnit: '100 g',
        standardMultiplier: 100, // Preço exibido por 100g
        secondaryStandardUnit: 'kg',
        secondaryMultiplier: 1000, // Preço por kg
        options: [
            { value: 'g', label: 'Grama (g)', factor: 1, symbol: 'g' },
            { value: 'kg', label: 'Quilograma (kg)', factor: 1000, symbol: 'kg' }
        ]
    },
    // Volume / Líquidos
    volume: {
        category: 'volume',
        categoryLabel: 'Volume / Líquido',
        baseUnit: 'ml',
        displayStandardUnit: 'Litro (L)',
        standardMultiplier: 1000, // Preço exibido por 1L
        secondaryStandardUnit: '100 ml',
        secondaryMultiplier: 100, // Preço por 100ml
        options: [
            { value: 'ml', label: 'Mililitro (ml)', factor: 1, symbol: 'ml' },
            { value: 'l', label: 'Litro (L)', factor: 1000, symbol: 'L' }
        ]
    },
    // Comprimento
    length: {
        category: 'length',
        categoryLabel: 'Comprimento',
        baseUnit: 'cm',
        displayStandardUnit: 'Metro (m)',
        standardMultiplier: 100, // Preço exibido por 1m
        secondaryStandardUnit: '100 cm',
        secondaryMultiplier: 100,
        options: [
            { value: 'cm', label: 'Centímetro (cm)', factor: 1, symbol: 'cm' },
            { value: 'm', label: 'Metro (m)', factor: 100, symbol: 'm' }
        ]
    }
};

// Mapa rápido de unidade -> categoria e fator
const UNIT_LOOKUP = {
    'unit': { category: 'unit', factor: 1, symbol: 'un', label: 'unidade' },
    'un': { category: 'unit', factor: 1, symbol: 'un', label: 'unidade' },
    'g': { category: 'weight', factor: 1, symbol: 'g', label: 'g' },
    'kg': { category: 'weight', factor: 1000, symbol: 'kg', label: 'kg' },
    'ml': { category: 'volume', factor: 1, symbol: 'ml', label: 'ml' },
    'l': { category: 'volume', factor: 1000, symbol: 'L', label: 'L' },
    'cm': { category: 'length', factor: 1, symbol: 'cm', label: 'cm' },
    'm': { category: 'length', factor: 100, symbol: 'm', label: 'm' }
};

// ==========================================
// 2. Formatadores e Utilitários Puros
// ==========================================
const CurrencyFormatterBR = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

function formatMoney(val) {
    if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 'R$ 0,00';
    return CurrencyFormatterBR.format(val);
}

function parseLocaleNumber(val) {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const clean = String(val).replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
}

// ==========================================
// 3. Funções Puras de Cálculo e Normalização
// ==========================================

/**
 * Normaliza um item individual e calcula suas métricas unitárias
 */
function calculateSingleProductUnitPrice(product) {
    const name = (product.name || '').trim() || 'Produto';
    const quantity = parseLocaleNumber(product.quantity);
    const packagesCount = parseLocaleNumber(product.packagesCount) || 1;
    const price = parseLocaleNumber(product.price);
    const unitKey = (product.unit || 'unit').toLowerCase();

    const unitInfo = UNIT_LOOKUP[unitKey] || UNIT_LOOKUP['unit'];
    const categoryConfig = UNIT_DEFINITIONS[unitInfo.category];

    // Validações básicas
    if (quantity <= 0 || price <= 0 || packagesCount <= 0) {
        return {
            isValid: false,
            error: 'Preencha quantidade e preço com valores maiores que zero.',
            name,
            unitKey
        };
    }

    // Quantidade total na unidade informada e na unidade base do sistema
    const totalSelectedUnitQty = quantity * packagesCount;
    const totalBaseQuantity = totalSelectedUnitQty * unitInfo.factor;

    if (totalBaseQuantity <= 0) {
        return {
            isValid: false,
            error: 'Quantidade total inválida.',
            name,
            unitKey
        };
    }

    // Preço por unidade base (por 1g, por 1ml, por 1cm, por 1un)
    const pricePerBaseUnit = price / totalBaseQuantity;

    // Preço na unidade de exibição padrão (ex: por 100g, por 1L, por 1m, por 1un)
    const standardPrice = pricePerBaseUnit * categoryConfig.standardMultiplier;
    const standardLabel = categoryConfig.displayStandardUnit;

    // Preço secundário (ex: por kg para peso, por 100ml para volume)
    let secondaryPrice = null;
    let secondaryLabel = null;
    if (categoryConfig.secondaryMultiplier && categoryConfig.secondaryStandardUnit) {
        secondaryPrice = pricePerBaseUnit * categoryConfig.secondaryMultiplier;
        secondaryLabel = categoryConfig.secondaryStandardUnit;
    }

    // Preço direto por unidade do pacote informado
    const pricePerSingleUnitGiven = price / totalSelectedUnitQty;

    return {
        isValid: true,
        id: product.id || 'p_' + Math.random().toString(36).substr(2, 6),
        name,
        quantity,
        packagesCount,
        totalSelectedUnitQty,
        totalBaseQuantity,
        price,
        unitKey,
        unitInfo,
        category: unitInfo.category,
        categoryLabel: categoryConfig.categoryLabel,
        pricePerBaseUnit,
        standardPrice,
        standardLabel,
        secondaryPrice,
        secondaryLabel,
        pricePerSingleUnitGiven,
        formattedTotal: formatMoney(price),
        formattedStandardPrice: formatMoney(standardPrice),
        formattedSecondaryPrice: secondaryPrice !== null ? formatMoney(secondaryPrice) : null
    };
}

/**
 * Compara múltiplos produtos, valida compatibilidade e monta o ranking
 */
function compareProductsList(products) {
    if (!Array.isArray(products) || products.length === 0) {
        return {
            status: 'empty',
            message: 'Nenhum produto adicionado para comparação.',
            items: []
        };
    }

    const calculatedItems = products.map((p, index) => {
        const res = calculateSingleProductUnitPrice(p);
        return {
            ...res,
            originalIndex: index,
            displayName: (p.name && p.name.trim()) || `Opção ${String.fromCharCode(65 + index)}`
        };
    });

    const validItems = calculatedItems.filter(item => item.isValid);

    if (validItems.length === 0) {
        return {
            status: 'invalid_inputs',
            message: 'Preencha quantidade e preço válidos em pelo menos um produto.',
            items: calculatedItems
        };
    }

    // Verifica compatibilidade de grandezas entre os produtos válidos
    const categories = new Set(validItems.map(item => item.category));
    if (categories.size > 1) {
        const catLabels = Array.from(categories).map(c => UNIT_DEFINITIONS[c]?.categoryLabel || c);
        return {
            status: 'incompatible_units',
            message: `Não é possível comparar diretamente grandezas incompatíveis (${catLabels.join(' vs ')}). Ajuste todas as opções para o mesmo tipo de medida (ex: todas em peso ou todas em volume).`,
            items: calculatedItems,
            hasIncompatibleError: true
        };
    }

    // Ordena do MENOR preço por unidade base (mais barato) para o MAIOR
    const sortedValidItems = [...validItems].sort((a, b) => a.pricePerBaseUnit - b.pricePerBaseUnit);
    const bestItem = sortedValidItems[0];
    const worstItem = sortedValidItems[sortedValidItems.length - 1];

    // Calcula economias em relação ao vencedor
    const enrichedRanking = sortedValidItems.map((item, rankIndex) => {
        const isWinner = rankIndex === 0;
        const diffFromBestPerBase = item.pricePerBaseUnit - bestItem.pricePerBaseUnit;
        const standardDiff = diffFromBestPerBase * UNIT_DEFINITIONS[item.category].standardMultiplier;
        
        // Percentual mais caro que o vencedor: ((preço / precoVencedor) - 1) * 100
        const pctMoreExpensive = isWinner || bestItem.pricePerBaseUnit === 0
            ? 0
            : ((item.pricePerBaseUnit - bestItem.pricePerBaseUnit) / bestItem.pricePerBaseUnit) * 100;

        // Economia comprando a quantidade deste pacote no preço do vencedor
        const savingsOnThisPackage = isWinner
            ? 0
            : item.price - (item.totalBaseQuantity * bestItem.pricePerBaseUnit);

        return {
            ...item,
            rank: rankIndex + 1,
            isWinner,
            diffFromBestPerBase,
            standardDiff,
            formattedStandardDiff: formatMoney(standardDiff),
            pctMoreExpensive: Math.round(pctMoreExpensive * 10) / 10,
            savingsOnThisPackage: Math.max(0, savingsOnThisPackage),
            formattedSavingsOnPackage: formatMoney(Math.max(0, savingsOnThisPackage))
        };
    });

    return {
        status: 'success',
        category: bestItem.category,
        categoryLabel: bestItem.categoryLabel,
        standardLabel: bestItem.standardLabel,
        bestItem: enrichedRanking[0],
        worstItem: enrichedRanking[enrichedRanking.length - 1],
        ranking: enrichedRanking,
        allItems: calculatedItems,
        totalCompared: validItems.length
    };
}

/**
 * Simula custo total para uma quantidade desejada em todas as opções comparadas
 */
function simulateTargetQuantityCost(ranking, targetAmount, targetUnitKey) {
    if (!ranking || ranking.length === 0 || targetAmount <= 0) return null;

    const unitInfo = UNIT_LOOKUP[targetUnitKey] || ranking[0].unitInfo;
    const targetBaseQty = targetAmount * unitInfo.factor;

    const simulationResults = ranking.map(item => {
        const costForTarget = targetBaseQty * item.pricePerBaseUnit;
        return {
            id: item.id,
            name: item.displayName || item.name,
            rank: item.rank,
            isWinner: item.isWinner,
            costForTarget,
            formattedCost: formatMoney(costForTarget)
        };
    });

    const bestCost = simulationResults[0].costForTarget;
    const simulationWithSavings = simulationResults.map(sim => {
        const diff = sim.costForTarget - bestCost;
        return {
            ...sim,
            savingsVsThis: diff,
            formattedSavings: formatMoney(diff)
        };
    });

    return {
        targetAmount,
        targetUnitLabel: unitInfo.label || unitInfo.symbol,
        results: simulationWithSavings,
        maxSavings: simulationWithSavings[simulationWithSavings.length - 1].savingsVsThis,
        formattedMaxSavings: formatMoney(simulationWithSavings[simulationWithSavings.length - 1].savingsVsThis)
    };
}

// ==========================================
// 4. Controlador de Estado e LocalStorage
// ==========================================
const UNIT_PRICE_STORAGE_KEY = 'nutriprotein_unit_price_state_v2';

const UnitPriceStore = {
    getDefaultState() {
        return {
            activeMode: 'compare', // 'compare' | 'quick'
            quickCalc: {
                quantity: 12,
                packagesCount: 1,
                unit: 'unit',
                price: 80
            },
            compareProducts: [
                {
                    id: 'prod_a',
                    name: 'Produto A (Unidade)',
                    quantity: 1,
                    packagesCount: 1,
                    unit: 'unit',
                    price: 4
                },
                {
                    id: 'prod_b',
                    name: 'Produto B (Fardo c/ 12)',
                    quantity: 12,
                    packagesCount: 1,
                    unit: 'unit',
                    price: 80
                },
                {
                    id: 'prod_c',
                    name: 'Produto C (Caixa c/ 36)',
                    quantity: 36,
                    packagesCount: 1,
                    unit: 'unit',
                    price: 150
                }
            ],
            simulationAmount: 12,
            simulationUnit: 'unit'
        };
    },

    load() {
        try {
            const raw = localStorage.getItem(UNIT_PRICE_STORAGE_KEY);
            if (!raw) return this.getDefaultState();
            const parsed = JSON.parse(raw);
            return {
                ...this.getDefaultState(),
                ...parsed
            };
        } catch (e) {
            console.warn('Erro ao carregar dados do comparador de preço:', e);
            return this.getDefaultState();
        }
    },

    save(state) {
        try {
            localStorage.setItem(UNIT_PRICE_STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Erro ao salvar dados do comparador de preço:', e);
        }
    }
};

// ==========================================
// 5. Interface de Usuário e Renderização
// ==========================================
const UnitPriceApp = {
    state: null,

    init() {
        this.state = UnitPriceStore.load();
        this.cacheDOMElements();
        this.bindEvents();
        this.renderAll();
    },

    cacheDOMElements() {
        // Mode Switcher Buttons
        this.modeBtnCompare = document.getElementById('up-mode-compare-btn');
        this.modeBtnQuick = document.getElementById('up-mode-quick-btn');
        this.viewCompare = document.getElementById('up-compare-view');
        this.viewQuick = document.getElementById('up-quick-view');

        // Quick Calc Inputs
        this.quickQtyInput = document.getElementById('up-quick-qty');
        this.quickPacksInput = document.getElementById('up-quick-packs');
        this.quickUnitSelect = document.getElementById('up-quick-unit');
        this.quickPriceInput = document.getElementById('up-quick-price');
        this.quickResultBox = document.getElementById('up-quick-result');
        this.quickPriceVal = document.getElementById('up-quick-price-val');
        this.quickSubVal = document.getElementById('up-quick-sub-val');
        this.quickSendToCompBtn = document.getElementById('up-quick-send-to-comp');
        this.quickClearBtn = document.getElementById('up-quick-clear');

        // Compare View Elements
        this.productListContainer = document.getElementById('up-products-list');
        this.addProductBtn = document.getElementById('up-add-product-btn');
        this.clearCompareBtn = document.getElementById('up-clear-compare-btn');
        this.resultsCard = document.getElementById('up-results-card');
        this.rankingList = document.getElementById('up-ranking-list');
        this.winnerBanner = document.getElementById('up-winner-banner');
        this.incompatibleAlert = document.getElementById('up-incompatible-alert');
        this.emptyState = document.getElementById('up-empty-state');

        // Simulation Elements
        this.simContainer = document.getElementById('up-simulation-container');
        this.simQtyInput = document.getElementById('up-sim-qty');
        this.simUnitSelect = document.getElementById('up-sim-unit');
        this.simResultsList = document.getElementById('up-sim-results');
        this.simMaxSavingsText = document.getElementById('up-sim-max-savings');
    },

    bindEvents() {
        // Mode Switcher
        if (this.modeBtnCompare && this.modeBtnQuick) {
            this.modeBtnCompare.addEventListener('click', () => this.switchMode('compare'));
            this.modeBtnQuick.addEventListener('click', () => this.switchMode('quick'));
        }

        // Quick Calc Inputs
        const quickInputs = [this.quickQtyInput, this.quickPacksInput, this.quickUnitSelect, this.quickPriceInput];
        quickInputs.forEach(el => {
            if (el) {
                el.addEventListener('input', () => this.handleQuickCalcChange());
                el.addEventListener('change', () => this.handleQuickCalcChange());
            }
        });

        if (this.quickClearBtn) {
            this.quickClearBtn.addEventListener('click', () => {
                if (this.quickQtyInput) this.quickQtyInput.value = '';
                if (this.quickPacksInput) this.quickPacksInput.value = '1';
                if (this.quickPriceInput) this.quickPriceInput.value = '';
                this.handleQuickCalcChange();
            });
        }

        if (this.quickSendToCompBtn) {
            this.quickSendToCompBtn.addEventListener('click', () => this.sendQuickCalcToCompare());
        }

        // Compare Actions
        if (this.addProductBtn) {
            this.addProductBtn.addEventListener('click', () => this.addNewProductToCompare());
        }

        if (this.clearCompareBtn) {
            this.clearCompareBtn.addEventListener('click', () => this.clearAllCompareProducts());
        }

        // Simulation Inputs
        if (this.simQtyInput) {
            this.simQtyInput.addEventListener('input', () => this.handleSimulationChange());
        }
        if (this.simUnitSelect) {
            this.simUnitSelect.addEventListener('change', () => this.handleSimulationChange());
        }
    },

    switchMode(mode) {
        this.state.activeMode = mode;
        UnitPriceStore.save(this.state);

        if (mode === 'compare') {
            this.modeBtnCompare?.classList.add('active');
            this.modeBtnQuick?.classList.remove('active');
            if (this.viewCompare) this.viewCompare.style.display = 'block';
            if (this.viewQuick) this.viewQuick.style.display = 'none';
            this.renderCompareView();
        } else {
            this.modeBtnQuick?.classList.add('active');
            this.modeBtnCompare?.classList.remove('active');
            if (this.viewCompare) this.viewCompare.style.display = 'none';
            if (this.viewQuick) this.viewQuick.style.display = 'block';
            this.renderQuickCalc();
        }
    },

    // ----------------------------------------------------
    // MODO RÁPIDO
    // ----------------------------------------------------
    handleQuickCalcChange() {
        const qty = parseLocaleNumber(this.quickQtyInput?.value);
        const packs = parseLocaleNumber(this.quickPacksInput?.value) || 1;
        const unit = this.quickUnitSelect?.value || 'unit';
        const price = parseLocaleNumber(this.quickPriceInput?.value);

        this.state.quickCalc = { quantity: qty, packagesCount: packs, unit, price };
        UnitPriceStore.save(this.state);

        const res = calculateSingleProductUnitPrice(this.state.quickCalc);

        if (res.isValid) {
            if (this.quickPriceVal) {
                this.quickPriceVal.innerHTML = `${res.formattedStandardPrice} <span class="unit-ref">/ ${res.standardLabel}</span>`;
            }
            if (this.quickSubVal) {
                let subTexts = [];
                if (res.packagesCount > 1) {
                    subTexts.push(`${res.packagesCount} embalagens &times; ${res.quantity}${res.unitInfo.symbol} = <strong>${res.totalSelectedUnitQty}${res.unitInfo.symbol} totais</strong>`);
                }
                if (res.formattedSecondaryPrice && res.secondaryLabel) {
                    subTexts.push(`Ou ${res.formattedSecondaryPrice} / ${res.secondaryLabel}`);
                }
                this.quickSubVal.innerHTML = subTexts.join(' • ') || `Preço total: ${res.formattedTotal}`;
                this.quickSubVal.style.display = 'block';
            }
            if (this.quickResultBox) {
                this.quickResultBox.classList.add('has-result');
            }
            if (this.quickSendToCompBtn) {
                this.quickSendToCompBtn.disabled = false;
            }
        } else {
            if (this.quickPriceVal) {
                this.quickPriceVal.innerHTML = `<span style="color: var(--text-dim); font-size: 1.3rem;">R$ 0,00</span>`;
            }
            if (this.quickSubVal) {
                this.quickSubVal.textContent = 'Informe a quantidade e o preço para ver o custo proporcional.';
            }
            if (this.quickResultBox) {
                this.quickResultBox.classList.remove('has-result');
            }
            if (this.quickSendToCompBtn) {
                this.quickSendToCompBtn.disabled = true;
            }
        }
    },

    renderQuickCalc() {
        if (this.quickQtyInput) this.quickQtyInput.value = this.state.quickCalc.quantity || '';
        if (this.quickPacksInput) this.quickPacksInput.value = this.state.quickCalc.packagesCount || '1';
        if (this.quickUnitSelect) this.quickUnitSelect.value = this.state.quickCalc.unit || 'unit';
        if (this.quickPriceInput) this.quickPriceInput.value = this.state.quickCalc.price || '';
        this.handleQuickCalcChange();
    },

    sendQuickCalcToCompare() {
        const item = {
            id: 'prod_' + Date.now(),
            name: `Item Rápido (${this.state.quickCalc.quantity}${this.state.quickCalc.unit})`,
            quantity: this.state.quickCalc.quantity,
            packagesCount: this.state.quickCalc.packagesCount || 1,
            unit: this.state.quickCalc.unit,
            price: this.state.quickCalc.price
        };

        this.state.compareProducts.push(item);
        UnitPriceStore.save(this.state);
        this.switchMode('compare');
    },

    // ----------------------------------------------------
    // MODO COMPARADOR DE PRODUTOS
    // ----------------------------------------------------
    addNewProductToCompare(initialData = null) {
        const nextIndex = this.state.compareProducts.length;
        const letter = String.fromCharCode(65 + nextIndex);
        const lastUnit = this.state.compareProducts.length > 0 
            ? this.state.compareProducts[this.state.compareProducts.length - 1].unit 
            : 'unit';

        const newProd = initialData || {
            id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: `Produto ${letter}`,
            quantity: '',
            packagesCount: 1,
            unit: lastUnit,
            price: ''
        };

        this.state.compareProducts.push(newProd);
        UnitPriceStore.save(this.state);
        this.renderCompareView();
    },

    removeProductFromCompare(index) {
        this.state.compareProducts.splice(index, 1);
        UnitPriceStore.save(this.state);
        this.renderCompareView();
    },

    duplicateProductInCompare(index) {
        const source = this.state.compareProducts[index];
        if (!source) return;
        const copy = {
            ...source,
            id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: `${source.name || 'Produto'} (Cópia)`
        };
        this.state.compareProducts.splice(index + 1, 0, copy);
        UnitPriceStore.save(this.state);
        this.renderCompareView();
    },

    clearAllCompareProducts() {
        this.state.compareProducts = [
            {
                id: 'prod_a_' + Date.now(),
                name: 'Produto A',
                quantity: '',
                packagesCount: 1,
                unit: 'unit',
                price: ''
            },
            {
                id: 'prod_b_' + Date.now(),
                name: 'Produto B',
                quantity: '',
                packagesCount: 1,
                unit: 'unit',
                price: ''
            }
        ];
        UnitPriceStore.save(this.state);
        this.renderCompareView();
    },

    renderCompareView() {
        if (!this.productListContainer) return;

        // 1. Renderiza os cartões de entrada de cada produto
        this.productListContainer.innerHTML = '';

        this.state.compareProducts.forEach((prod, index) => {
            const card = document.createElement('div');
            card.className = 'up-product-card glass-card';
            card.dataset.index = index;

            const letter = String.fromCharCode(65 + index);
            const defaultPlaceholder = `Ex: Produto ${letter}, Marca X, Pacote Econômico`;

            card.innerHTML = `
                <div class="up-card-header">
                    <div class="up-card-title-wrap">
                        <span class="up-card-badge">${letter}</span>
                        <input type="text" class="form-control up-prod-name-input" data-field="name" value="${this.escapeHtml(prod.name || '')}" placeholder="${defaultPlaceholder}">
                    </div>
                    <div class="up-card-actions">
                        <button type="button" class="btn-icon up-duplicate-btn" title="Duplicar produto" data-action="duplicate">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                        ${this.state.compareProducts.length > 2 ? `
                        <button type="button" class="btn-icon up-remove-btn" title="Remover produto" data-action="remove">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>` : ''}
                    </div>
                </div>

                <div class="up-card-body">
                    <!-- Linha 1: Quantidade e Unidade de Medida -->
                    <div class="up-form-row">
                        <div class="form-group up-form-group">
                            <label class="form-label">
                                <span class="label-left"><span>Quantidade</span> <span class="essential-badge">✨</span></span>
                            </label>
                            <div class="input-wrapper">
                                <input type="number" class="form-control up-qty-input" data-field="quantity" value="${prod.quantity || ''}" placeholder="Ex: 500" min="0" step="any" inputmode="decimal" required>
                            </div>
                        </div>

                        <div class="form-group up-form-group">
                            <label class="form-label">
                                <span>Unidade</span>
                            </label>
                            <select class="form-control up-unit-select" data-field="unit">
                                <optgroup label="Contagem">
                                    <option value="unit" ${prod.unit === 'unit' ? 'selected' : ''}>Unidade (un)</option>
                                </optgroup>
                                <optgroup label="Peso">
                                    <option value="g" ${prod.unit === 'g' ? 'selected' : ''}>Grama (g)</option>
                                    <option value="kg" ${prod.unit === 'kg' ? 'selected' : ''}>Quilograma (kg)</option>
                                </optgroup>
                                <optgroup label="Volume">
                                    <option value="ml" ${prod.unit === 'ml' ? 'selected' : ''}>Mililitro (ml)</option>
                                    <option value="l" ${prod.unit === 'l' ? 'selected' : ''}>Litro (L)</option>
                                </optgroup>
                                <optgroup label="Comprimento">
                                    <option value="cm" ${prod.unit === 'cm' ? 'selected' : ''}>Centímetro (cm)</option>
                                    <option value="m" ${prod.unit === 'm' ? 'selected' : ''}>Metro (m)</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    <!-- Linha 2: Multiplicador de Kit / Embalagens e Preço Total -->
                    <div class="up-form-row">
                        <div class="form-group up-form-group">
                            <label class="form-label">
                                <span>Embalagens</span>
                                <span class="optional-badge">Kit/Fardo</span>
                            </label>
                            <div class="input-wrapper">
                                <input type="number" class="form-control up-packs-input" data-field="packagesCount" value="${prod.packagesCount || 1}" placeholder="1" min="1" step="1" inputmode="numeric">
                                <span class="input-unit">pct</span>
                            </div>
                        </div>

                        <div class="form-group up-form-group">
                            <label class="form-label">
                                <span class="label-left"><span>Preço Total</span> <span class="essential-badge">✨</span></span>
                                <span class="helper">R$</span>
                            </label>
                            <div class="input-wrapper">
                                <input type="number" class="form-control up-price-input" data-field="price" value="${prod.price || ''}" placeholder="Ex: 80.00" min="0" step="any" inputmode="decimal" required>
                                <span class="input-unit">R$</span>
                            </div>
                        </div>
                    </div>

                    <!-- Rodapé do Card com Mini-cálculo Live -->
                    <div class="up-card-live-preview" id="up-card-preview-${index}">
                        <!-- Preenchido via updateLivePreviews() -->
                    </div>
                </div>
            `;

            // Eventos dos inputs deste card
            const inputs = card.querySelectorAll('input, select');
            inputs.forEach(input => {
                const updateHandler = () => {
                    const field = input.dataset.field;
                    let val = input.value;
                    if (field === 'quantity' || field === 'price' || field === 'packagesCount') {
                        val = parseLocaleNumber(val);
                    }
                    this.state.compareProducts[index][field] = input.value;
                    UnitPriceStore.save(this.state);
                    this.recalculateAndRenderResults();
                };

                input.addEventListener('input', updateHandler);
                input.addEventListener('change', updateHandler);
            });

            // Botão Duplicar
            card.querySelector('[data-action="duplicate"]')?.addEventListener('click', () => {
                this.duplicateProductInCompare(index);
            });

            // Botão Remover
            card.querySelector('[data-action="remove"]')?.addEventListener('click', () => {
                this.removeProductFromCompare(index);
            });

            this.productListContainer.appendChild(card);
        });

        // 2. Calcula e renderiza os resultados da comparação
        this.recalculateAndRenderResults();
    },

    recalculateAndRenderResults() {
        const result = compareProductsList(this.state.compareProducts);

        // Atualiza os mini-previews individuais em cada card
        this.updateLivePreviews(result);

        // Trata os diferentes estados de resultado
        if (result.status === 'incompatible_units') {
            if (this.incompatibleAlert) {
                this.incompatibleAlert.style.display = 'flex';
                this.incompatibleAlert.querySelector('.up-alert-text').textContent = result.message;
            }
            if (this.resultsCard) this.resultsCard.style.display = 'none';
            if (this.simContainer) this.simContainer.style.display = 'none';
            return;
        } else {
            if (this.incompatibleAlert) this.incompatibleAlert.style.display = 'none';
        }

        if (result.status !== 'success' || result.ranking.length === 0) {
            if (this.resultsCard) this.resultsCard.style.display = 'none';
            if (this.simContainer) this.simContainer.style.display = 'none';
            return;
        }

        // Exibe resultados
        if (this.resultsCard) this.resultsCard.style.display = 'block';
        if (this.simContainer) this.simContainer.style.display = 'block';

        this.renderWinnerBanner(result);
        this.renderRankingList(result);
        this.renderSimulationSection(result);
    },

    updateLivePreviews(result) {
        this.state.compareProducts.forEach((prod, index) => {
            const previewEl = document.getElementById(`up-card-preview-${index}`);
            if (!previewEl) return;

            const calc = calculateSingleProductUnitPrice(prod);
            if (calc.isValid) {
                let text = `<strong>${calc.formattedStandardPrice}</strong> / ${calc.standardLabel}`;
                if (calc.packagesCount > 1) {
                    text += ` <span class="up-preview-sub">(${calc.packagesCount}&times;${calc.quantity}${calc.unitInfo.symbol} = ${calc.totalSelectedUnitQty}${calc.unitInfo.symbol})</span>`;
                }
                previewEl.innerHTML = text;
                previewEl.style.display = 'block';
            } else {
                previewEl.innerHTML = `<span class="up-preview-pending">Aguardando dados completos...</span>`;
                previewEl.style.display = 'block';
            }
        });
    },

    renderWinnerBanner(result) {
        if (!this.winnerBanner) return;

        const winner = result.bestItem;
        const totalItems = result.ranking.length;

        let bannerHTML = `
            <div class="up-winner-badge-icon">🏆</div>
            <div class="up-winner-content">
                <div class="up-winner-top">
                    <span class="up-winner-tag">Melhor Custo-Benefício</span>
                    <span class="up-winner-standard-price">${winner.formattedStandardPrice} / ${winner.standardLabel}</span>
                </div>
                <h3 class="up-winner-title">${this.escapeHtml(winner.displayName || winner.name)}</h3>
        `;

        if (totalItems > 1) {
            const secondPlace = result.ranking[1];
            const diffStandard = secondPlace.standardPrice - winner.standardPrice;
            const pctSavings = Math.round(((secondPlace.pricePerBaseUnit - winner.pricePerBaseUnit) / secondPlace.pricePerBaseUnit) * 100);

            bannerHTML += `
                <p class="up-winner-savings-msg">
                    🎉 <strong>Economia de ${formatMoney(diffStandard)} por ${winner.standardLabel}</strong> (${pctSavings}% mais barato que o 2º colocado, <em>${this.escapeHtml(secondPlace.displayName || secondPlace.name)}</em>).
                </p>
            `;
        } else {
            bannerHTML += `
                <p class="up-winner-savings-msg">
                    Adicione outros produtos ou marcas para descobrir quanto você economiza!
                </p>
            `;
        }

        bannerHTML += `</div>`;
        this.winnerBanner.innerHTML = bannerHTML;
    },

    renderRankingList(result) {
        if (!this.rankingList) return;

        this.rankingList.innerHTML = '';

        result.ranking.forEach((item, index) => {
            const row = document.createElement('div');
            const isWinner = item.isWinner;
            row.className = `up-ranking-item ${isWinner ? 'winner-row' : ''}`;

            const medal = index === 0 ? '🥇 1º' : index === 1 ? '🥈 2º' : index === 2 ? '🥉 3º' : `${index + 1}º`;

            let detailsHTML = `
                <div class="up-rank-main-wrap">
                    <div class="up-rank-pos-col">
                        <span class="up-rank-medal ${isWinner ? 'gold' : ''}">${medal}</span>
                    </div>
                    <div class="up-rank-info-col">
                        <div class="up-rank-name-row">
                            <strong class="up-rank-name">${this.escapeHtml(item.displayName || item.name)}</strong>
                            ${isWinner ? '<span class="up-badge-winner">Vencedor 🏆</span>' : ''}
                        </div>
                        <div class="up-rank-package-details">
                            ${item.packagesCount > 1 ? `${item.packagesCount} caixas/pacotes &times; ` : ''}${item.quantity} ${item.unitInfo.symbol} 
                            (${item.totalSelectedUnitQty} ${item.unitInfo.symbol} totais) por <strong>${item.formattedTotal}</strong>
                        </div>
                    </div>
                </div>
                <div class="up-rank-price-col">
                    <div class="up-rank-main-price">${item.formattedStandardPrice} <span class="up-rank-price-unit">/ ${item.standardLabel}</span></div>
                    ${!isWinner ? `
                        <div class="up-rank-diff-tag">
                            +${item.formattedStandardDiff} (+${item.pctMoreExpensive}%)
                        </div>
                    ` : `
                        <div class="up-rank-best-tag">Melhor Preço</div>
                    `}
                </div>
            `;

            row.innerHTML = detailsHTML;
            this.rankingList.appendChild(row);
        });
    },

    // ----------------------------------------------------
    // SIMULADOR DE COMPRA EM QUANTIDADE
    // ----------------------------------------------------
    renderSimulationSection(result) {
        if (!this.simContainer) return;

        // Ajusta opções do select de unidade da simulação de acordo com a categoria
        const category = result.category;
        const catConfig = UNIT_DEFINITIONS[category];

        if (this.simUnitSelect && catConfig) {
            this.simUnitSelect.innerHTML = catConfig.options.map(opt => `
                <option value="${opt.value}" ${opt.value === this.state.simulationUnit ? 'selected' : ''}>${opt.label}</option>
            `).join('');
        }

        // Se o valor de simulação for inválido ou vazio, inicializa com o maior total de pacote comparado
        if (!this.state.simulationAmount || this.state.simulationAmount <= 0) {
            const maxPackage = Math.max(...result.ranking.map(r => r.totalSelectedUnitQty));
            this.state.simulationAmount = maxPackage || 10;
        }

        if (this.simQtyInput) {
            this.simQtyInput.value = this.state.simulationAmount;
        }

        this.handleSimulationChange();
    },

    handleSimulationChange() {
        const amount = parseLocaleNumber(this.simQtyInput?.value);
        const unit = this.simUnitSelect?.value || 'unit';

        this.state.simulationAmount = amount;
        this.state.simulationUnit = unit;
        UnitPriceStore.save(this.state);

        const currentResult = compareProductsList(this.state.compareProducts);
        if (currentResult.status !== 'success' || currentResult.ranking.length === 0 || amount <= 0) {
            if (this.simResultsList) this.simResultsList.innerHTML = '';
            if (this.simMaxSavingsText) this.simMaxSavingsText.textContent = '';
            return;
        }

        const sim = simulateTargetQuantityCost(currentResult.ranking, amount, unit);
        if (!sim || !this.simResultsList) return;

        this.simResultsList.innerHTML = '';

        sim.results.forEach(item => {
            const card = document.createElement('div');
            card.className = `up-sim-item ${item.isWinner ? 'winner-sim' : ''}`;

            card.innerHTML = `
                <div class="up-sim-item-header">
                    <span class="up-sim-name">${this.escapeHtml(item.name)}</span>
                    ${item.isWinner ? '<span class="up-badge-winner-sm">Menor Custo</span>' : ''}
                </div>
                <div class="up-sim-item-body">
                    <div class="up-sim-price">${item.formattedCost}</div>
                    <div class="up-sim-sub">para ${amount} ${sim.targetUnitLabel}</div>
                    ${!item.isWinner && item.savingsVsThis > 0 ? `
                        <div class="up-sim-diff">Gasta ${item.formattedSavings} a mais</div>
                    ` : item.isWinner ? `
                        <div class="up-sim-best">Opção mais econômica</div>
                    ` : ''}
                </div>
            `;
            this.simResultsList.appendChild(card);
        });

        if (this.simMaxSavingsText && sim.maxSavings > 0) {
            this.simMaxSavingsText.innerHTML = `💡 Comprando <strong>${amount} ${sim.targetUnitLabel}</strong> na opção vencedora, você economiza <strong>${sim.formattedMaxSavings}</strong> no total!`;
        } else if (this.simMaxSavingsText) {
            this.simMaxSavingsText.innerHTML = '';
        }
    },

    renderAll() {
        this.switchMode(this.state.activeMode || 'compare');
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};

// ==========================================
// 6. Inicialização no Carregamento da Página
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    UnitPriceApp.init();
});

// Exporta globalmente para integração com outras abas
window.UnitPriceApp = UnitPriceApp;
window.calculateSingleProductUnitPrice = calculateSingleProductUnitPrice;
window.compareProductsList = compareProductsList;
window.simulateTargetQuantityCost = simulateTargetQuantityCost;
