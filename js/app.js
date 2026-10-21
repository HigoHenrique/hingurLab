/**
 * app.js - Controlador principal da interface NutriProtein
 */

document.addEventListener('DOMContentLoaded', () => {
    // ---- DOM Elements ----
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Quick Calc Form
    const productNameInput = document.getElementById('product-name');
    const caloriesInput = document.getElementById('calories');
    const proteinInput = document.getElementById('protein');
    const carbsInput = document.getElementById('carbs');
    const fatInput = document.getElementById('fat');
    const portionInput = document.getElementById('portion');
    const totalWeightInput = document.getElementById('total-weight');
    const priceInput = document.getElementById('price');
    const clearFormBtn = document.getElementById('clear-form-btn');
    const saveProductBtn = document.getElementById('save-product-btn');
    const addToCartBtn = document.getElementById('add-to-cart-btn');

    // Quick Presets Bar
    const quickPresetsList = document.getElementById('quick-presets-list');
    const quickPresetsMobileSelect = document.getElementById('quick-presets-mobile-select');

    // Results Elements
    const radialBar = document.getElementById('radial-bar');
    const radialPercentageText = document.getElementById('radial-percentage-text');
    const verdictPill = document.getElementById('verdict-pill');
    const verdictIcon = document.getElementById('verdict-icon');
    const verdictBadgeText = document.getElementById('verdict-badge-text');
    const verdictTitle = document.getElementById('verdict-title');
    const verdictDesc = document.getElementById('verdict-desc');
    const verdictExamples = document.getElementById('verdict-examples');
    const smartBadgesContainer = document.getElementById('smart-badges-container');
    
    const statGramsPer100Kcal = document.getElementById('stat-grams-100kcal');
    const statProtKcal = document.getElementById('stat-prot-kcal');
    
    const macroBarProtein = document.getElementById('macro-bar-protein');
    const macroBarCarbs = document.getElementById('macro-bar-carbs');
    const macroBarFat = document.getElementById('macro-bar-fat');
    const macroBarOther = document.getElementById('macro-bar-other');
    const macroLegendOther = document.getElementById('macro-legend-other');
    const macroPctProtein = document.getElementById('macro-pct-protein');
    const macroPctCarbs = document.getElementById('macro-pct-carbs');
    const macroPctFat = document.getElementById('macro-pct-fat');
    const macroPctOther = document.getElementById('macro-pct-other');

    const costCard = document.getElementById('cost-card');
    const costBadge = document.getElementById('cost-badge');
    const costPer30gVal = document.getElementById('cost-30g-val');
    const costPer10gVal = document.getElementById('cost-10g-val');
    const totalProtPackageVal = document.getElementById('total-prot-package-val');

    // Collapsible
    const costSectionToggle = document.getElementById('cost-section-toggle');
    const costSectionContent = document.getElementById('cost-section-content');

    // Modal
    const guideModal = document.getElementById('guide-modal');
    const openGuideBtn = document.getElementById('open-guide-btn');
    const closeGuideBtn = document.getElementById('close-guide-btn');

    // Cart / History
    const cartCounterBadge = document.getElementById('cart-counter-badge');
    const cartList = document.getElementById('cart-list');
    const historyList = document.getElementById('history-list');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const shareCartBtn = document.getElementById('share-cart-btn');

    // Presets View
    const presetsGrid = document.getElementById('presets-grid');
    const presetsFilterContainer = document.getElementById('presets-filter-container');
    const presetSearchInput = document.getElementById('preset-search-input');

    // Comparison View
    const compAInputs = {
        name: document.getElementById('comp-a-name'),
        calories: document.getElementById('comp-a-calories'),
        protein: document.getElementById('comp-a-protein'),
        carbs: document.getElementById('comp-a-carbs'),
        fat: document.getElementById('comp-a-fat'),
        price: document.getElementById('comp-a-price'),
        weight: document.getElementById('comp-a-weight'),
        portion: document.getElementById('comp-a-portion')
    };

    const compBInputs = {
        name: document.getElementById('comp-b-name'),
        calories: document.getElementById('comp-b-calories'),
        protein: document.getElementById('comp-b-protein'),
        carbs: document.getElementById('comp-b-carbs'),
        fat: document.getElementById('comp-b-fat'),
        price: document.getElementById('comp-b-price'),
        weight: document.getElementById('comp-b-weight'),
        portion: document.getElementById('comp-b-portion')
    };

    let currentAnalysis = null;

    // ==========================================
    // 0. App Configuration Switch (ATIVAR_DADOS)
    // ==========================================
    function applyAppConfig() {
        const config = window.APP_CONFIG || { ATIVAR_DADOS: true };
        const isDataActive = config.ATIVAR_DADOS !== undefined ? config.ATIVAR_DADOS : (config.ENABLE_FOOD_PRESETS ?? true);

        if (!isDataActive) {
            // 1. Oculta a aba de alimentos no menu de navegação
            const presetsNavBtn = document.querySelector('[data-tab="presets"]');
            if (presetsNavBtn) presetsNavBtn.style.display = 'none';

            // 2. Oculta o conteúdo da aba de alimentos
            const presetsTabContent = document.getElementById('tab-presets');
            if (presetsTabContent) presetsTabContent.style.display = 'none';

            // 3. Oculta a barra de testes rápidos na Calculadora Rápida
            const quickPresetsContainer = document.getElementById('quick-presets-container');
            if (quickPresetsContainer) quickPresetsContainer.style.display = 'none';

            // 4. Oculta os seletores de carregar alimentos no Duelo A vs B
            const duelPresetA = document.getElementById('duel-preset-a');
            const duelPresetB = document.getElementById('duel-preset-b');
            if (duelPresetA) duelPresetA.style.display = 'none';
            if (duelPresetB) duelPresetB.style.display = 'none';

            document.body.classList.add('presets-disabled');
        } else {
            const presetsNavBtn = document.querySelector('[data-tab="presets"]');
            if (presetsNavBtn) presetsNavBtn.style.display = '';

            const presetsTabContent = document.getElementById('tab-presets');
            if (presetsTabContent) presetsTabContent.style.display = '';

            const quickPresetsContainer = document.getElementById('quick-presets-container');
            if (quickPresetsContainer) quickPresetsContainer.style.display = '';

            const duelPresetA = document.getElementById('duel-preset-a');
            const duelPresetB = document.getElementById('duel-preset-b');
            if (duelPresetA) duelPresetA.style.display = '';
            if (duelPresetB) duelPresetB.style.display = '';

            document.body.classList.remove('presets-disabled');
        }
    }

    applyAppConfig();

    // ==========================================
    // 1. Theme Management
    // ==========================================
    const savedTheme = StorageManager.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        StorageManager.setTheme(newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        themeToggleBtn.innerHTML = theme === 'dark'
            ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }

    // ==========================================
    // 2. Tab Navigation
    // ==========================================
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const activeContent = document.getElementById(`tab-${targetTab}`);
            if (activeContent) {
                activeContent.classList.add('active');
            }

            if (targetTab === 'cart') {
                renderCartAndHistory();
            } else if (targetTab === 'presets') {
                renderPresetsGrid();
            } else if (targetTab === 'unit-price' && window.UnitPriceApp) {
                window.UnitPriceApp.renderAll();
            } else if (targetTab === 'protein-value' && window.ProteinValueApp) {
                window.ProteinValueApp.render();
            }
        });
    });

    // ==========================================
    // 3. Live Calculator
    // ==========================================
    const calcInputs = [caloriesInput, proteinInput, carbsInput, fatInput, portionInput, totalWeightInput, priceInput, productNameInput];
    calcInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', runQuickCalculation);
            input.addEventListener('change', runQuickCalculation);
            input.addEventListener('keyup', runQuickCalculation);
        }
    });

    // Collapsible toggle for cost inputs
    if (costSectionToggle && costSectionContent) {
        costSectionToggle.addEventListener('click', () => {
            costSectionToggle.classList.toggle('open');
            costSectionContent.classList.toggle('open');
        });
    }

    function runQuickCalculation() {
        const data = {
            calories: caloriesInput ? caloriesInput.value : 0,
            protein: proteinInput ? proteinInput.value : 0,
            carbs: carbsInput ? carbsInput.value : 0,
            fat: fatInput ? fatInput.value : 0,
            portion: portionInput ? portionInput.value : 0,
            totalWeight: totalWeightInput ? totalWeightInput.value : 0,
            price: priceInput ? priceInput.value : 0
        };

        const result = calculateNutritionalMetrics(data);

        if (!result.isValid) {
            resetResultsView();
            currentAnalysis = null;
            return;
        }

        currentAnalysis = {
            name: (productNameInput && productNameInput.value.trim()) || 'Produto Analisado',
            ...result
        };

        updateResultsView(result);
    }

    function updateResultsView(result) {
        // 1. Radial Progress
        const pct = result.proteinPercentage || 0;
        radialPercentageText.textContent = (pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1));
        
        // Circumference is ~440 (2 * pi * 70)
        const maxOffset = 440;
        const strokeOffset = maxOffset - (pct / 100) * maxOffset;
        radialBar.style.strokeDashoffset = Math.max(0, strokeOffset);
        radialBar.style.stroke = result.tier.color;

        // 2. Verdict Card
        verdictPill.style.backgroundColor = result.tier.bg;
        verdictPill.style.borderColor = result.tier.border;
        verdictPill.style.color = result.tier.color;
        verdictIcon.textContent = result.tier.icon;
        verdictBadgeText.textContent = result.tier.badgeText;

        verdictTitle.textContent = result.tier.name;
        verdictTitle.style.color = result.tier.color;
        verdictDesc.textContent = (result.contextualVerdict && result.contextualVerdict.description) || result.tier.description;
        verdictExamples.textContent = result.tier.examples;

        // 2.1 Smart Badges (Regra 10:1, Carga Calórica, Lipídios, Carbos, Pureza)
        if (smartBadgesContainer) {
            smartBadgesContainer.innerHTML = '';
            if (result.contextualVerdict && Array.isArray(result.contextualVerdict.smartBadges)) {
                result.contextualVerdict.smartBadges.forEach(badge => {
                    const tag = document.createElement('span');
                    tag.className = `smart-badge-tag ${badge.type || 'info'}`;
                    if (badge.tooltip) tag.title = badge.tooltip;
                    tag.innerHTML = `<span>${badge.icon || ''}</span> <strong>${badge.label}:</strong> <span>${badge.text}</span>`;
                    smartBadgesContainer.appendChild(tag);
                });
            }
        }

        // 3. Stats
        statGramsPer100Kcal.textContent = (result.gramsPer100Kcal || 0).toFixed(1);
        statProtKcal.textContent = `${result.proteinCalories} kcal`;

        // 4. Macro Distribution (Normalizada e Baseada em Atwater)
        const { proteinPct, carbsPct, fatPct, otherPct } = result.macroSplit;
        macroBarProtein.style.width = `${proteinPct}%`;
        macroBarCarbs.style.width = `${carbsPct}%`;
        macroBarFat.style.width = `${fatPct}%`;

        macroPctProtein.textContent = `${proteinPct}%`;
        macroPctCarbs.textContent = `${carbsPct}%`;
        macroPctFat.textContent = `${fatPct}%`;

        if (otherPct && otherPct > 0) {
            if (macroBarOther) {
                macroBarOther.style.display = 'block';
                macroBarOther.style.width = `${otherPct}%`;
            }
            if (macroLegendOther) {
                macroLegendOther.style.display = 'flex';
            }
            if (macroPctOther) {
                macroPctOther.textContent = `${otherPct}%`;
            }
        } else {
            if (macroBarOther) {
                macroBarOther.style.display = 'none';
                macroBarOther.style.width = '0%';
            }
            if (macroLegendOther) {
                macroLegendOther.style.display = 'none';
            }
        }

        // 5. Cost-Benefit
        if (result.costAnalysis && result.costAnalysis.hasData) {
            costCard.style.display = 'block';
            costBadge.textContent = result.costAnalysis.costVerdict;
            costBadge.style.backgroundColor = result.costAnalysis.costBadgeColor;
            costPer30gVal.textContent = `R$ ${result.costAnalysis.costPer30gProtein.toFixed(2)}`;
            costPer10gVal.textContent = `R$ ${result.costAnalysis.costPer10gProtein.toFixed(2)}`;
            totalProtPackageVal.textContent = `${result.costAnalysis.totalProteinInPackage}g`;
        } else {
            costCard.style.display = 'none';
        }
    }

    function resetResultsView() {
        radialPercentageText.textContent = '0';
        radialBar.style.strokeDashoffset = 440;
        radialBar.style.stroke = 'var(--brand-primary)';

        verdictPill.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        verdictPill.style.borderColor = 'var(--border-color)';
        verdictPill.style.color = 'var(--text-muted)';
        verdictIcon.textContent = '🔍';
        verdictBadgeText.textContent = 'Aguardando Dados';

        verdictTitle.textContent = 'Insira os Dados da Tabela';
        verdictTitle.style.color = 'var(--text-main)';
        verdictDesc.textContent = 'Digite pelo menos as calorias e as proteínas da porção para ver o veredito instantâneo.';
        verdictExamples.textContent = 'Dica: Olhe a tabela nutricional atrás da embalagem.';

        if (smartBadgesContainer) {
            smartBadgesContainer.innerHTML = '';
        }

        statGramsPer100Kcal.textContent = '0.0';
        statProtKcal.textContent = '0 kcal';

        macroBarProtein.style.width = '0%';
        macroBarCarbs.style.width = '0%';
        macroBarFat.style.width = '0%';
        if (macroBarOther) {
            macroBarOther.style.width = '0%';
            macroBarOther.style.display = 'none';
        }
        if (macroLegendOther) {
            macroLegendOther.style.display = 'none';
        }
        macroPctProtein.textContent = '0%';
        macroPctCarbs.textContent = '0%';
        macroPctFat.textContent = '0%';

        costCard.style.display = 'none';
    }

    // Clear form
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            productNameInput.value = '';
            caloriesInput.value = '';
            proteinInput.value = '';
            carbsInput.value = '';
            fatInput.value = '';
            portionInput.value = '';
            totalWeightInput.value = '';
            priceInput.value = '';
            currentAnalysis = null;
            resetResultsView();
            showToast('Formulário limpo!');
        });
    }

    // Save product to history
    saveProductBtn.addEventListener('click', () => {
        if (!currentAnalysis) {
            showToast('Preencha os dados do produto primeiro!', 'warning');
            return;
        }
        StorageManager.saveToHistory(currentAnalysis);
        showToast('Salvo no Histórico com sucesso!');
        updateCartBadge();
    });

    // Add product to shopping cart
    addToCartBtn.addEventListener('click', () => {
        if (!currentAnalysis) {
            showToast('Preencha os dados do produto primeiro!', 'warning');
            return;
        }
        StorageManager.addToCart(currentAnalysis, 1);
        showToast('Adicionado ao Carrinho do Mercado! 🛒');
        updateCartBadge();
    });

    // ==========================================
    // 4. Quick Presets Carousel & Mobile Select
    // ==========================================
    function renderQuickPresets() {
        const presets = window.FOOD_PRESETS || [];

        // 1. Tablet & Desktop: Chips Carousel
        if (quickPresetsList) {
            quickPresetsList.innerHTML = '';
            presets.slice(0, 8).forEach(preset => {
                const chip = document.createElement('button');
                chip.className = 'preset-chip';
                chip.type = 'button';
                chip.innerHTML = `<span>${preset.name}</span>`;
                chip.addEventListener('click', () => {
                    loadPresetIntoCalculator(preset);
                });
                quickPresetsList.appendChild(chip);
            });
        }

        // 2. Mobile: Select Dropdown
        if (quickPresetsMobileSelect) {
            let optionsHTML = '<option value="">⚡ Testar Alimento de Referência...</option>';
            presets.forEach(p => {
                optionsHTML += `<option value="${p.id}">${p.name} (${p.protein}g prot / ${p.calories}kcal)</option>`;
            });
            quickPresetsMobileSelect.innerHTML = optionsHTML;
        }
    }

    if (quickPresetsMobileSelect) {
        quickPresetsMobileSelect.addEventListener('change', () => {
            const selectedId = quickPresetsMobileSelect.value;
            if (!selectedId) return;
            const presets = window.FOOD_PRESETS || [];
            const item = presets.find(p => p.id === selectedId);
            if (item) {
                loadPresetIntoCalculator(item);
            }
        });
    }

    function loadPresetIntoCalculator(preset) {
        productNameInput.value = preset.name;
        caloriesInput.value = preset.calories;
        proteinInput.value = preset.protein;
        carbsInput.value = preset.carbs || '';
        fatInput.value = preset.fat || '';
        portionInput.value = preset.portion || '';
        totalWeightInput.value = preset.totalWeight || '';
        priceInput.value = preset.price || '';

        // Open cost section if totalWeight & price exist
        if (preset.price && preset.totalWeight && costSectionContent) {
            costSectionToggle.classList.add('open');
            costSectionContent.classList.add('open');
        }

        runQuickCalculation();
        showToast(`Carregado: ${preset.name}`);

        // If not in calc tab, switch to it
        const calcTabBtn = document.querySelector('[data-tab="calc"]');
        if (calcTabBtn) calcTabBtn.click();
    }

    // ==========================================
    // 5. Presets Tab View & Filter
    // ==========================================
    let currentPresetCategory = 'ALL';

    function renderPresetsFilter() {
        if (!presetsFilterContainer) return;
        presetsFilterContainer.innerHTML = '';

        const allPill = document.createElement('button');
        allPill.className = `filter-pill ${currentPresetCategory === 'ALL' ? 'active' : ''}`;
        allPill.textContent = 'Todos os Alimentos';
        allPill.addEventListener('click', () => {
            currentPresetCategory = 'ALL';
            renderPresetsFilter();
            renderPresetsGrid();
        });
        presetsFilterContainer.appendChild(allPill);

        Object.values(PRESET_CATEGORIES).forEach(cat => {
            const pill = document.createElement('button');
            pill.className = `filter-pill ${currentPresetCategory === cat ? 'active' : ''}`;
            pill.textContent = cat;
            pill.addEventListener('click', () => {
                currentPresetCategory = cat;
                renderPresetsFilter();
                renderPresetsGrid();
            });
            presetsFilterContainer.appendChild(pill);
        });
    }

    function renderPresetsGrid() {
        if (!presetsGrid) return;
        const searchQuery = (presetSearchInput ? presetSearchInput.value : '').toLowerCase().trim();

        const filtered = FOOD_PRESETS.filter(item => {
            const matchesCat = currentPresetCategory === 'ALL' || item.category === currentPresetCategory;
            const matchesSearch = !searchQuery || 
                item.name.toLowerCase().includes(searchQuery) || 
                item.category.toLowerCase().includes(searchQuery) ||
                (item.notes && item.notes.toLowerCase().includes(searchQuery));
            return matchesCat && matchesSearch;
        });

        presetsGrid.innerHTML = '';

        if (filtered.length === 0) {
            presetsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">🔍</div>
                    <div class="empty-state-title">Nenhum alimento encontrado</div>
                    <p class="empty-state-desc">Tente buscar por outro termo ou selecione outra categoria.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(item => {
            const metric = calculateNutritionalMetrics(item);
            const card = document.createElement('div');
            card.className = 'preset-card';
            card.innerHTML = `
                <div>
                    <div class="preset-card-category">${item.category}</div>
                    <h3 class="preset-card-title">${item.name}</h3>
                    <div class="preset-card-macros">
                        <span><strong>${item.calories}</strong> kcal</span>
                        <span style="color: var(--color-protein)"><strong>${item.protein}g</strong> prot</span>
                        <span><strong>${item.carbs}g</strong> carbo</span>
                        <span><strong>${item.fat}g</strong> gord</span>
                    </div>
                    <p class="preset-card-notes">${item.notes || ''}</p>
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <span class="verdict-badge-pill" style="margin: 0; padding: 0.25rem 0.65rem; font-size: 0.75rem; background: ${(metric.tier && metric.tier.bg) || 'rgba(255,255,255,0.05)'}; color: ${(metric.tier && metric.tier.color) || 'var(--text-main)'}; border: 1px solid ${(metric.tier && metric.tier.border) || 'var(--border-color)'};">
                            ${(metric.tier && metric.tier.icon) || '🔍'} ${metric.proteinPercentage || 0}% Prot
                        </span>
                        ${item.price ? `<span style="font-weight: 700; font-size: 0.9rem;">R$ ${item.price.toFixed(2)}</span>` : ''}
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary btn-sm btn-full load-calc-btn">
                            Carregar na Calculadora
                        </button>
                        <button class="btn btn-primary btn-sm add-cart-btn" title="Adicionar ao Carrinho">
                            🛒
                        </button>
                    </div>
                </div>
            `;

            card.querySelector('.load-calc-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                loadPresetIntoCalculator(item);
            });

            card.querySelector('.add-cart-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const analyzed = { name: item.name, ...metric };
                StorageManager.addToCart(analyzed, 1);
                showToast(`Adicionado ao Carrinho: ${item.name}`);
                updateCartBadge();
            });

            presetsGrid.appendChild(card);
        });
    }

    if (presetSearchInput) {
        presetSearchInput.addEventListener('input', () => {
            renderPresetsGrid();
        });
    }

    // ==========================================
    // 6. Comparison Arena (A vs B Duel)
    // ==========================================
    const duelPresetA = document.getElementById('duel-preset-a');
    const duelPresetB = document.getElementById('duel-preset-b');

    function populateDuelPresetSelectors() {
        if (!duelPresetA || !duelPresetB) return;
        const presets = window.FOOD_PRESETS || [];
        
        let optionsHTML = '';
        presets.forEach(p => {
            optionsHTML += `<option value="${p.id}">${p.name} (${p.protein}g prot / ${p.calories}kcal)</option>`;
        });

        duelPresetA.innerHTML = '<option value="">⚡ Carregar Alimento no Produto A...</option>' + optionsHTML;
        duelPresetB.innerHTML = '<option value="">⚡ Carregar Alimento no Produto B...</option>' + optionsHTML;
    }

    if (duelPresetA) {
        duelPresetA.addEventListener('change', () => {
            const selectedId = duelPresetA.value;
            if (!selectedId) return;
            const presets = window.FOOD_PRESETS || [];
            const item = presets.find(p => p.id === selectedId);
            if (item) {
                compAInputs.name.value = item.name;
                compAInputs.calories.value = item.calories;
                compAInputs.protein.value = item.protein;
                compAInputs.carbs.value = item.carbs || '';
                compAInputs.fat.value = item.fat || '';
                compAInputs.portion.value = item.portion || '';
                compAInputs.weight.value = item.totalWeight || '';
                compAInputs.price.value = item.price || '';
                runComparisonDuel();
                showToast(`Produto A: ${item.name}`);
            }
        });
    }

    if (duelPresetB) {
        duelPresetB.addEventListener('change', () => {
            const selectedId = duelPresetB.value;
            if (!selectedId) return;
            const presets = window.FOOD_PRESETS || [];
            const item = presets.find(p => p.id === selectedId);
            if (item) {
                compBInputs.name.value = item.name;
                compBInputs.calories.value = item.calories;
                compBInputs.protein.value = item.protein;
                compBInputs.carbs.value = item.carbs || '';
                compBInputs.fat.value = item.fat || '';
                compBInputs.portion.value = item.portion || '';
                compBInputs.weight.value = item.totalWeight || '';
                compBInputs.price.value = item.price || '';
                runComparisonDuel();
                showToast(`Produto B: ${item.name}`);
            }
        });
    }

    function handleClearDuelA(e) {
        if (e && e.preventDefault) e.preventDefault();
        Object.values(compAInputs).forEach(inp => { if (inp) inp.value = ''; });
        if (duelPresetA) duelPresetA.value = '';
        runComparisonDuel();
        showToast('Produto A limpo!');
    }

    function handleClearDuelB(e) {
        if (e && e.preventDefault) e.preventDefault();
        Object.values(compBInputs).forEach(inp => { if (inp) inp.value = ''; });
        if (duelPresetB) duelPresetB.value = '';
        runComparisonDuel();
        showToast('Produto B limpo!');
    }

    function handleClearDuelBoth(e) {
        if (e && e.preventDefault) e.preventDefault();
        Object.values(compAInputs).forEach(inp => { if (inp) inp.value = ''; });
        Object.values(compBInputs).forEach(inp => { if (inp) inp.value = ''; });
        if (duelPresetA) duelPresetA.value = '';
        if (duelPresetB) duelPresetB.value = '';
        runComparisonDuel();
        showToast('Duelo reiniciado! Campos limpos.');
    }

    window.clearDuelA = handleClearDuelA;
    window.clearDuelB = handleClearDuelB;
    window.clearDuelBoth = handleClearDuelBoth;

    const allCompInputs = [...Object.values(compAInputs), ...Object.values(compBInputs)];
    allCompInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', runComparisonDuel);
            input.addEventListener('change', runComparisonDuel);
            input.addEventListener('keyup', runComparisonDuel);
        }
    });

    function runComparisonDuel() {
        const dataA = {
            name: compAInputs.name ? compAInputs.name.value : '',
            calories: compAInputs.calories ? compAInputs.calories.value : 0,
            protein: compAInputs.protein ? compAInputs.protein.value : 0,
            carbs: compAInputs.carbs ? compAInputs.carbs.value : 0,
            fat: compAInputs.fat ? compAInputs.fat.value : 0,
            portion: compAInputs.portion ? compAInputs.portion.value : 0,
            totalWeight: compAInputs.weight ? compAInputs.weight.value : 0,
            price: compAInputs.price ? compAInputs.price.value : 0
        };

        const dataB = {
            name: compBInputs.name ? compBInputs.name.value : '',
            calories: compBInputs.calories ? compBInputs.calories.value : 0,
            protein: compBInputs.protein ? compBInputs.protein.value : 0,
            carbs: compBInputs.carbs ? compBInputs.carbs.value : 0,
            fat: compBInputs.fat ? compBInputs.fat.value : 0,
            portion: compBInputs.portion ? compBInputs.portion.value : 0,
            totalWeight: compBInputs.weight ? compBInputs.weight.value : 0,
            price: compBInputs.price ? compBInputs.price.value : 0
        };

        const resA = calculateNutritionalMetrics(dataA);
        const resB = calculateNutritionalMetrics(dataB);

        renderComparisonResults(resA, resB);
    }

    function renderComparisonResults(resA, resB) {
        const cardA = document.getElementById('comp-card-a');
        const cardB = document.getElementById('comp-card-b');
        const resultBanner = document.getElementById('comp-result-banner');

        if (!cardA || !cardB) return;

        // Reset winner ribbons
        cardA.classList.remove('winner');
        cardB.classList.remove('winner');
        const oldRibbonA = cardA.querySelector('.winner-ribbon');
        const oldRibbonB = cardB.querySelector('.winner-ribbon');
        if (oldRibbonA) oldRibbonA.remove();
        if (oldRibbonB) oldRibbonB.remove();

        const statsA = document.getElementById('comp-stats-a');
        const statsB = document.getElementById('comp-stats-b');

        if (resA.isValid) {
            statsA.innerHTML = generateCompStatsHTML(resA);
        } else {
            statsA.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 2rem 0;">Preencha os dados do Produto A</p>';
        }

        if (resB.isValid) {
            statsB.innerHTML = generateCompStatsHTML(resB);
        } else {
            statsB.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 2rem 0;">Preencha os dados do Produto B</p>';
        }

        if (resA.isValid && resB.isValid) {
            resultBanner.style.display = 'block';

            let winnerText = '';
            const pctA = resA.proteinPercentage || 0;
            const pctB = resB.proteinPercentage || 0;
            const diffPct = Math.abs(pctA - pctB).toFixed(1);

            if (pctA > pctB) {
                cardA.classList.add('winner');
                addWinnerRibbon(cardA, 'Vencedor em Proteína');
                winnerText = `🏆 <strong>${compAInputs.name.value.trim() || 'Produto A'}</strong> é o grande vencedor com <strong>${pctA.toFixed(1)}%</strong> de calorias em proteínas (+${diffPct}% mais eficiente que o Produto B).`;
            } else if (pctB > pctA) {
                cardB.classList.add('winner');
                addWinnerRibbon(cardB, 'Vencedor em Proteína');
                winnerText = `🏆 <strong>${compBInputs.name.value.trim() || 'Produto B'}</strong> é o grande vencedor com <strong>${pctB.toFixed(1)}%</strong> de calorias em proteínas (+${diffPct}% mais eficiente que o Produto A).`;
            } else {
                winnerText = `⚖️ <strong>Empate Técnico!</strong> Ambos os produtos possuem exatamente a mesma densidade proteica (${pctA.toFixed(1)}%).`;
            }

            // Análise de Custo se houver em ambos
            if (resA.costAnalysis && resA.costAnalysis.hasData && resB.costAnalysis && resB.costAnalysis.hasData) {
                const costDiff = Math.abs(resA.costAnalysis.costPer30gProtein - resB.costAnalysis.costPer30gProtein).toFixed(2);
                if (resA.costAnalysis.costPer30gProtein < resB.costAnalysis.costPer30gProtein) {
                    winnerText += `<br>💰 <strong>Melhor Custo:</strong> ${compAInputs.name.value.trim() || 'Produto A'} sai por R$ ${resA.costAnalysis.costPer30gProtein.toFixed(2)}/30g prot (Economia de R$ ${costDiff} por dose).`;
                } else if (resB.costAnalysis.costPer30gProtein < resA.costAnalysis.costPer30gProtein) {
                    winnerText += `<br>💰 <strong>Melhor Custo:</strong> ${compBInputs.name.value.trim() || 'Produto B'} sai por R$ ${resB.costAnalysis.costPer30gProtein.toFixed(2)}/30g prot (Economia de R$ ${costDiff} por dose).`;
                }
            }

            resultBanner.innerHTML = winnerText;
        } else {
            resultBanner.style.display = 'none';
        }
    }

    function addWinnerRibbon(card, text) {
        const ribbon = document.createElement('div');
        ribbon.className = 'winner-ribbon';
        ribbon.innerHTML = `<span>👑 ${text}</span>`;
        card.appendChild(ribbon);
    }

    function generateCompStatsHTML(res) {
        const proteinPercentage = res.proteinPercentage !== undefined ? res.proteinPercentage.toFixed(1) : '0.0';
        const gramsPer100Kcal = res.gramsPer100Kcal !== undefined ? res.gramsPer100Kcal.toFixed(1) : '0.0';
        const pPct = res.macroSplit ? res.macroSplit.proteinPct : 0;
        const cPct = res.macroSplit ? res.macroSplit.carbsPct : 0;
        const fPct = res.macroSplit ? res.macroSplit.fatPct : 0;

        return `
            <div style="margin: 1rem 0; text-align: center;">
                <span class="verdict-badge-pill" style="background: ${(res.tier && res.tier.bg) || 'rgba(255,255,255,0.05)'}; color: ${(res.tier && res.tier.color) || 'var(--text-main)'}; border: 1px solid ${(res.tier && res.tier.border) || 'var(--border-color)'}">
                    ${(res.tier && res.tier.icon) || '🔍'} ${(res.tier && res.tier.name) || 'Avaliação'}
                </span>
                <div style="font-size: 2.2rem; font-family: var(--font-heading); font-weight: 900; color: ${(res.tier && res.tier.color) || 'var(--text-main)'};">
                    ${proteinPercentage}% <span style="font-size: 1rem; color: var(--text-dim);">de Proteína</span>
                </div>
                ${res.rule10to1 ? `
                    <div style="margin-top: 0.4rem;">
                        <span class="smart-badge-tag ${res.rule10to1.passed ? 'success' : 'warning'}" style="font-size: 0.72rem;">
                            ${res.rule10to1.passed ? '🎯 Regra 10:1 OK' : '⚠️ Fora da Regra 10:1'} (${res.rule10to1.kcalPerGram} kcal/g)
                        </span>
                    </div>
                ` : ''}
            </div>
            <div class="stats-row">
                <div class="stat-box">
                    <div class="stat-box-label">Eficiência</div>
                    <div class="stat-box-value">${gramsPer100Kcal} <span class="stat-box-unit">g / 100 kcal</span></div>
                </div>
                <div class="stat-box" title="Distribuição calórica: percentual das calorias totais (% das kcal) fornecidas por cada macronutriente">
                    <div class="stat-box-label" style="display: flex; align-items: center; justify-content: center; gap: 0.25rem;">
                        <span>Macros (P / C / G)</span>
                        <span style="font-size: 0.75rem; color: var(--brand-primary); cursor: help;" title="Distribuição calórica: % das calorias totais vindas de cada macro">ℹ️</span>
                    </div>
                    <div class="stat-box-value" style="font-size: 1rem;">
                        ${pPct}% / ${cPct}% / ${fPct}%
                    </div>
                </div>
            </div>
            ${res.costAnalysis && res.costAnalysis.hasData ? `
                <div class="stat-box" style="margin-top: 0.5rem; border-color: ${res.costAnalysis.costBadgeColor};">
                    <div class="stat-box-label">Custo por 30g de Proteína</div>
                    <div class="stat-box-value" style="color: ${res.costAnalysis.costBadgeColor};">
                        R$ ${res.costAnalysis.costPer30gProtein.toFixed(2)}
                    </div>
                </div>
            ` : ''}
        `;
    }

    // ==========================================
    // 7. Shopping Cart & History Management
    // ==========================================
    function updateCartBadge() {
        const cart = StorageManager.getCart();
        const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        if (cartCounterBadge) {
            cartCounterBadge.textContent = totalItems;
            cartCounterBadge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    function renderCartAndHistory() {
        // Render Cart
        const cart = StorageManager.getCart();
        const summary = StorageManager.getCartSummary();

        const cartBanner = document.getElementById('cart-summary-banner');
        if (cartBanner) {
            if (cart.length > 0) {
                cartBanner.style.display = 'grid';
                cartBanner.innerHTML = `
                    <div>
                        <div class="stat-box-label">Itens no Carrinho</div>
                        <div class="stat-box-value" style="justify-content: center;">${summary.totalItems}</div>
                    </div>
                    <div>
                        <div class="stat-box-label">Proteína Acumulada</div>
                        <div class="stat-box-value" style="justify-content: center; color: var(--brand-primary);">${summary.totalProteinGrams} <span class="stat-box-unit">g</span></div>
                    </div>
                    <div>
                        <div class="stat-box-label">Gasto Total</div>
                        <div class="stat-box-value" style="justify-content: center;">R$ ${summary.totalCost.toFixed(2)}</div>
                    </div>
                    ${summary.avgCostPer30g > 0 ? `
                    <div>
                        <div class="stat-box-label">Custo Médio / 30g Prot</div>
                        <div class="stat-box-value" style="justify-content: center; color: var(--brand-secondary);">R$ ${summary.avgCostPer30g.toFixed(2)}</div>
                    </div>` : ''}
                `;
            } else {
                cartBanner.style.display = 'none';
            }
        }

        if (cartList) {
            if (cart.length === 0) {
                cartList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🛒</div>
                        <div class="empty-state-title">Seu carrinho de proteínas está vazio</div>
                        <p class="empty-state-desc">Analise produtos na calculadora ou selecione presets para adicioná-los aqui e planejar suas compras!</p>
                    </div>
                `;
            } else {
                cartList.innerHTML = '';
                cart.forEach(item => {
                    const el = document.createElement('div');
                    el.className = 'cart-item-card';
                    
                    const protTotal = item.costAnalysis && item.costAnalysis.hasData 
                        ? (item.costAnalysis.totalProteinInPackage * item.quantity).toFixed(1) + 'g prot total'
                        : `${(item.raw.protein * item.quantity).toFixed(1)}g prot`;

                    const priceTotal = item.raw.price ? `R$ ${(item.raw.price * item.quantity).toFixed(2)}` : '';

                    el.innerHTML = `
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name || 'Produto'}</div>
                            <div class="cart-item-sub">
                                <span style="color: ${(item.tier && item.tier.color) || 'var(--text-main)'}; font-weight: 700;">${(item.tier && item.tier.icon) || '🔍'} ${item.proteinPercentage || 0}%</span> • 
                                ${protTotal} ${priceTotal ? `• <strong>${priceTotal}</strong>` : ''}
                            </div>
                        </div>
                        <div class="cart-item-controls">
                            <button class="qty-btn minus-btn" data-id="${item.id}">-</button>
                            <span style="font-weight: 800; min-width: 20px; text-align: center;">${item.quantity}</span>
                            <button class="qty-btn plus-btn" data-id="${item.id}">+</button>
                            <button class="btn-icon" data-id="${item.id}" style="color: var(--tier-low); width: 32px; height: 32px;" title="Remover">
                                🗑️
                            </button>
                        </div>
                    `;

                    el.querySelector('.minus-btn').addEventListener('click', () => {
                        StorageManager.updateCartQuantity(item.id, -1);
                        renderCartAndHistory();
                        updateCartBadge();
                    });

                    el.querySelector('.plus-btn').addEventListener('click', () => {
                        StorageManager.updateCartQuantity(item.id, 1);
                        renderCartAndHistory();
                        updateCartBadge();
                    });

                    el.querySelector('.btn-icon').addEventListener('click', () => {
                        StorageManager.removeFromCart(item.id);
                        renderCartAndHistory();
                        updateCartBadge();
                        showToast('Item removido do carrinho');
                    });

                    cartList.appendChild(el);
                });
            }
        }

        // Render History
        const history = StorageManager.getHistory();
        if (historyList) {
            if (history.length === 0) {
                historyList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <div class="empty-state-title">Nenhum produto no histórico</div>
                        <p class="empty-state-desc">Os produtos calculados e salvos aparecerão aqui para consultas rápidas.</p>
                    </div>
                `;
            } else {
                historyList.innerHTML = '';
                history.forEach(item => {
                    const el = document.createElement('div');
                    el.className = 'cart-item-card';
                    el.innerHTML = `
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name || 'Produto'}</div>
                            <div class="cart-item-sub">
                                <span style="color: ${(item.tier && item.tier.color) || 'var(--text-main)'}; font-weight: 700;">${(item.tier && item.tier.icon) || '🔍'} ${item.proteinPercentage || 0}%</span> • 
                                ${item.raw ? item.raw.calories : 0} kcal • ${item.raw ? item.raw.protein : 0}g proteína
                            </div>
                        </div>
                        <div class="cart-item-controls">
                            <button class="btn btn-secondary btn-sm load-hist-btn" data-id="${item.id}">
                                Reabrir
                            </button>
                            <button class="btn btn-primary btn-sm add-cart-hist-btn" data-id="${item.id}" title="Adicionar ao Carrinho">
                                🛒
                            </button>
                            <button class="btn-icon delete-hist-btn" data-id="${item.id}" style="color: var(--tier-low); width: 32px; height: 32px;" title="Remover">
                                🗑️
                            </button>
                        </div>
                    `;

                    el.querySelector('.load-hist-btn').addEventListener('click', () => {
                        loadPresetIntoCalculator({
                            name: item.name,
                            calories: item.raw.calories,
                            protein: item.raw.protein,
                            carbs: item.raw.carbs,
                            fat: item.raw.fat,
                            portion: item.raw.portion,
                            totalWeight: item.raw.totalWeight,
                            price: item.raw.price
                        });
                    });

                    el.querySelector('.add-cart-hist-btn').addEventListener('click', () => {
                        StorageManager.addToCart(item, 1);
                        renderCartAndHistory();
                        updateCartBadge();
                        showToast(`Adicionado ao Carrinho: ${item.name}`);
                    });

                    el.querySelector('.delete-hist-btn').addEventListener('click', () => {
                        StorageManager.removeFromHistory(item.id);
                        renderCartAndHistory();
                        showToast('Removido do histórico');
                    });

                    historyList.appendChild(el);
                });
            }
        }
    }

    function handleClearCart(e) {
        if (e && e.preventDefault) e.preventDefault();
        StorageManager.clearCart();
        renderCartAndHistory();
        updateCartBadge();
        showToast('Carrinho limpo com sucesso!');
    }

    function handleClearHistory(e) {
        if (e && e.preventDefault) e.preventDefault();
        StorageManager.clearHistory();
        renderCartAndHistory();
        showToast('Histórico limpo com sucesso!');
    }

    function handleClearForm(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (productNameInput) productNameInput.value = '';
        if (caloriesInput) caloriesInput.value = '';
        if (proteinInput) proteinInput.value = '';
        if (carbsInput) carbsInput.value = '';
        if (fatInput) fatInput.value = '';
        if (portionInput) portionInput.value = '';
        if (totalWeightInput) totalWeightInput.value = '';
        if (priceInput) priceInput.value = '';
        currentAnalysis = null;
        resetResultsView();
        showToast('Formulário limpo!');
    }

    // Delegação de cliques no documento para máxima resiliência
    document.addEventListener('click', (e) => {
        if (e.target.closest('#clear-cart-btn')) {
            handleClearCart(e);
        } else if (e.target.closest('#clear-history-btn')) {
            handleClearHistory(e);
        } else if (e.target.closest('#clear-form-btn')) {
            handleClearForm(e);
        } else if (e.target.closest('#clear-comp-a-btn')) {
            handleClearDuelA(e);
        } else if (e.target.closest('#clear-comp-b-btn')) {
            handleClearDuelB(e);
        } else if (e.target.closest('#clear-comp-both-btn')) {
            handleClearDuelBoth(e);
        }
    });

    window.clearNutriCart = handleClearCart;
    window.clearNutriHistory = handleClearHistory;
    window.clearNutriForm = handleClearForm;

    if (shareCartBtn) {
        shareCartBtn.addEventListener('click', () => {
            const cart = StorageManager.getCart();
            const summary = StorageManager.getCartSummary();
            if (cart.length === 0) {
                showToast('Carrinho vazio para compartilhar!', 'warning');
                return;
            }

            let text = `🛒 *Minha Lista de Proteínas (HingurLab)*\n\n`;
            cart.forEach(item => {
                text += `• ${item.quantity}x ${item.name} (${item.proteinPercentage}% Prot)\n`;
            });
            text += `\n📊 *Total:* ${summary.totalProteinGrams}g de Proteína`;
            if (summary.totalCost > 0) text += ` | R$ ${summary.totalCost.toFixed(2)}`;
            if (summary.avgCostPer30g > 0) text += `\n💰 *Média por 30g:* R$ ${summary.avgCostPer30g.toFixed(2)}`;

            if (navigator.share) {
                navigator.share({
                    title: 'Lista de Proteínas - HingurLab',
                    text: text
                }).catch(() => {});
            } else {
                navigator.clipboard.writeText(text).then(() => {
                    showToast('Lista copiada para a Área de Transferência!');
                });
            }
        });
    }

    // ==========================================
    // 8. Educational Modal
    // ==========================================
    if (openGuideBtn && guideModal && closeGuideBtn) {
        openGuideBtn.addEventListener('click', () => {
            guideModal.classList.add('open');
        });

        closeGuideBtn.addEventListener('click', () => {
            guideModal.classList.remove('open');
        });

        guideModal.addEventListener('click', (e) => {
            if (e.target === guideModal) {
                guideModal.classList.remove('open');
            }
        });
    }

    // ==========================================
    // 9. Toast Notification System
    // ==========================================
    function showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        const icon = type === 'warning' ? '⚠️' : '✅';
        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ==========================================
    // 10. Service Worker Registration (PWA)
    // ==========================================
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('Service Worker registrado:', reg.scope))
                .catch(err => console.log('Falha ao registrar SW:', err));
        });
    }

    // Initial setups
    applyAppConfig();
    renderQuickPresets();
    renderPresetsFilter();
    populateDuelPresetSelectors();
    updateCartBadge();
    resetResultsView();

    // Carregamento dinâmico e modular dos JSONs de presets
    loadPresets().then(() => {
        applyAppConfig();
        renderQuickPresets();
        renderPresetsFilter();
        populateDuelPresetSelectors();
        if (document.getElementById('tab-presets')?.classList.contains('active')) {
            renderPresetsGrid();
        }
    });
});
