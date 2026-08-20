/**
 * app.js - Controlador principal da interface NutriProtein
 */

import { calculateNutritionalMetrics, NUTRI_TIERS } from './calculator.js';
import { FOOD_PRESETS, PRESET_CATEGORIES, loadPresets } from './presets.js';
import { StorageManager } from './storage.js';

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

    // Results Elements
    const radialBar = document.getElementById('radial-bar');
    const radialPercentageText = document.getElementById('radial-percentage-text');
    const verdictPill = document.getElementById('verdict-pill');
    const verdictIcon = document.getElementById('verdict-icon');
    const verdictBadgeText = document.getElementById('verdict-badge-text');
    const verdictTitle = document.getElementById('verdict-title');
    const verdictDesc = document.getElementById('verdict-desc');
    const verdictExamples = document.getElementById('verdict-examples');
    
    const statGramsPer100Kcal = document.getElementById('stat-grams-100kcal');
    const statProtKcal = document.getElementById('stat-prot-kcal');
    
    const macroBarProtein = document.getElementById('macro-bar-protein');
    const macroBarCarbs = document.getElementById('macro-bar-carbs');
    const macroBarFat = document.getElementById('macro-bar-fat');
    const macroPctProtein = document.getElementById('macro-pct-protein');
    const macroPctCarbs = document.getElementById('macro-pct-carbs');
    const macroPctFat = document.getElementById('macro-pct-fat');

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
            }
        });
    });

    // ==========================================
    // 3. Live Calculator
    // ==========================================
    const calcInputs = [caloriesInput, proteinInput, carbsInput, fatInput, portionInput, totalWeightInput, priceInput, productNameInput];
    calcInputs.forEach(input => {
        input.addEventListener('input', () => {
            runQuickCalculation();
        });
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
            calories: caloriesInput.value,
            protein: proteinInput.value,
            carbs: carbsInput.value,
            fat: fatInput.value,
            portion: portionInput.value,
            totalWeight: totalWeightInput.value,
            price: priceInput.value
        };

        const result = calculateNutritionalMetrics(data);

        if (!result.isValid) {
            resetResultsView();
            currentAnalysis = null;
            return;
        }

        currentAnalysis = {
            name: productNameInput.value.trim() || 'Produto Analisado',
            ...result
        };

        updateResultsView(result);
    }

    function updateResultsView(result) {
        // 1. Radial Progress
        const pct = result.proteinPercentage;
        radialPercentageText.textContent = pct.toFixed(0);
        
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
        verdictDesc.textContent = result.tier.description;
        verdictExamples.textContent = result.tier.examples;

        // 3. Stats
        statGramsPer100Kcal.textContent = result.gramsPer100Kcal;
        statProtKcal.textContent = `${result.proteinCalories} kcal`;

        // 4. Macro Distribution
        const { proteinPct, carbsPct, fatPct } = result.macroSplit;
        macroBarProtein.style.width = `${proteinPct}%`;
        macroBarCarbs.style.width = `${carbsPct}%`;
        macroBarFat.style.width = `${fatPct}%`;

        macroPctProtein.textContent = `${proteinPct}%`;
        macroPctCarbs.textContent = `${carbsPct}%`;
        macroPctFat.textContent = `${fatPct}%`;

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

        statGramsPer100Kcal.textContent = '0.0';
        statProtKcal.textContent = '0 kcal';

        macroBarProtein.style.width = '0%';
        macroBarCarbs.style.width = '0%';
        macroBarFat.style.width = '0%';
        macroPctProtein.textContent = '0%';
        macroPctCarbs.textContent = '0%';
        macroPctFat.textContent = '0%';

        costCard.style.display = 'none';
    }

    // Clear form
    clearFormBtn.addEventListener('click', () => {
        productNameInput.value = '';
        caloriesInput.value = '';
        proteinInput.value = '';
        carbsInput.value = '';
        fatInput.value = '';
        portionInput.value = '';
        totalWeightInput.value = '';
        priceInput.value = '';
        resetResultsView();
        showToast('Formulário limpo!');
    });

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
    // 4. Quick Presets Carousel
    // ==========================================
    function renderQuickPresets() {
        if (!quickPresetsList) return;
        quickPresetsList.innerHTML = '';
        
        FOOD_PRESETS.slice(0, 8).forEach(preset => {
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
                        <span class="verdict-badge-pill" style="margin: 0; padding: 0.25rem 0.65rem; font-size: 0.75rem; background: ${metric.tier.bg}; color: ${metric.tier.color}; border: 1px solid ${metric.tier.border};">
                            ${metric.tier.icon} ${metric.proteinPercentage}% Prot
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
    const allCompInputs = [...Object.values(compAInputs), ...Object.values(compBInputs)];
    allCompInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                runComparisonDuel();
            });
        }
    });

    function runComparisonDuel() {
        const dataA = {
            calories: compAInputs.calories.value,
            protein: compAInputs.protein.value,
            carbs: compAInputs.carbs.value,
            fat: compAInputs.fat.value,
            portion: compAInputs.portion.value,
            totalWeight: compAInputs.weight.value,
            price: compAInputs.price.value
        };

        const dataB = {
            calories: compBInputs.calories.value,
            protein: compBInputs.protein.value,
            carbs: compBInputs.carbs.value,
            fat: compBInputs.fat.value,
            portion: compBInputs.portion.value,
            totalWeight: compBInputs.weight.value,
            price: compBInputs.price.value
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
            const diffPct = Math.abs(resA.proteinPercentage - resB.proteinPercentage).toFixed(1);

            if (resA.proteinPercentage > resB.proteinPercentage) {
                cardA.classList.add('winner');
                addWinnerRibbon(cardA, 'Vencedor em Proteína');
                winnerText = `🏆 <strong>${compAInputs.name.value.trim() || 'Produto A'}</strong> é o grande vencedor com <strong>${resA.proteinPercentage}%</strong> de calorias em proteínas (+${diffPct}% mais eficiente que o Produto B).`;
            } else if (resB.proteinPercentage > resA.proteinPercentage) {
                cardB.classList.add('winner');
                addWinnerRibbon(cardB, 'Vencedor em Proteína');
                winnerText = `🏆 <strong>${compBInputs.name.value.trim() || 'Produto B'}</strong> é o grande vencedor com <strong>${resB.proteinPercentage}%</strong> de calorias em proteínas (+${diffPct}% mais eficiente que o Produto A).`;
            } else {
                winnerText = `⚖️ <strong>Empate Técnico!</strong> Ambos os produtos possuem exatamente a mesma densidade proteica (${resA.proteinPercentage}%).`;
            }

            // Análise de Custo se houver
            if (resA.costAnalysis && resB.costAnalysis) {
                const costDiff = Math.abs(resA.costAnalysis.costPer30gProtein - resB.costAnalysis.costPer30gProtein).toFixed(2);
                if (resA.costAnalysis.costPer30gProtein < resB.costAnalysis.costPer30gProtein) {
                    winnerText += `<br>💰 <strong>Melhor Custo:</strong> ${compAInputs.name.value.trim() || 'Produto A'} sai por R$ ${resA.costAnalysis.costPer30gProtein}/30g prot (Economia de R$ ${costDiff} por dose).`;
                } else if (resB.costAnalysis.costPer30gProtein < resA.costAnalysis.costPer30gProtein) {
                    winnerText += `<br>💰 <strong>Melhor Custo:</strong> ${compBInputs.name.value.trim() || 'Produto B'} sai por R$ ${resB.costAnalysis.costPer30gProtein}/30g prot (Economia de R$ ${costDiff} por dose).`;
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
        return `
            <div style="margin: 1rem 0; text-align: center;">
                <span class="verdict-badge-pill" style="background: ${res.tier.bg}; color: ${res.tier.color}; border: 1px solid ${res.tier.border}">
                    ${res.tier.icon} ${res.tier.name}
                </span>
                <div style="font-size: 2.2rem; font-family: var(--font-heading); font-weight: 900; color: ${res.tier.color};">
                    ${res.proteinPercentage}% <span style="font-size: 1rem; color: var(--text-dim);">de Proteína</span>
                </div>
            </div>
            <div class="stats-row">
                <div class="stat-box">
                    <div class="stat-box-label">Eficiência</div>
                    <div class="stat-box-value">${res.gramsPer100Kcal} <span class="stat-box-unit">g / 100 kcal</span></div>
                </div>
                <div class="stat-box">
                    <div class="stat-box-label">Macros (P / C / G)</div>
                    <div class="stat-box-value" style="font-size: 1rem;">
                        ${res.macroSplit.proteinPct}% / ${res.macroSplit.carbsPct}% / ${res.macroSplit.fatPct}%
                    </div>
                </div>
            </div>
            ${res.costAnalysis ? `
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
                                <span style="color: ${item.tier.color}; font-weight: 700;">${item.tier.icon} ${item.proteinPercentage}%</span> • 
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
                                <span style="color: ${item.tier.color}; font-weight: 700;">${item.tier.icon} ${item.proteinPercentage}%</span> • 
                                ${item.raw.calories} kcal • ${item.raw.protein}g proteína
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

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Deseja limpar todos os itens do carrinho?')) {
                StorageManager.clearCart();
                renderCartAndHistory();
                updateCartBadge();
                showToast('Carrinho limpo!');
            }
        });
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Deseja limpar o histórico de análises?')) {
                StorageManager.clearHistory();
                renderCartAndHistory();
                showToast('Histórico limpo!');
            }
        });
    }

    if (shareCartBtn) {
        shareCartBtn.addEventListener('click', () => {
            const cart = StorageManager.getCart();
            const summary = StorageManager.getCartSummary();
            if (cart.length === 0) {
                showToast('Carrinho vazio para compartilhar!', 'warning');
                return;
            }

            let text = `🛒 *Minha Lista de Proteínas (NutriProtein)*\n\n`;
            cart.forEach(item => {
                text += `• ${item.quantity}x ${item.name} (${item.proteinPercentage}% Prot)\n`;
            });
            text += `\n📊 *Total:* ${summary.totalProteinGrams}g de Proteína`;
            if (summary.totalCost > 0) text += ` | R$ ${summary.totalCost.toFixed(2)}`;
            if (summary.avgCostPer30g > 0) text += `\n💰 *Média por 30g:* R$ ${summary.avgCostPer30g.toFixed(2)}`;

            if (navigator.share) {
                navigator.share({
                    title: 'Lista de Proteínas - NutriProtein',
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
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('Service Worker registrado:', reg.scope))
                .catch(err => console.log('Falha ao registrar SW:', err));
        });
    }

    // Initial setups
    renderQuickPresets();
    renderPresetsFilter();
    updateCartBadge();
    resetResultsView();

    // Carregamento dinâmico e modular dos JSONs de presets
    loadPresets().then(() => {
        renderQuickPresets();
        renderPresetsFilter();
        if (document.getElementById('tab-presets')?.classList.contains('active')) {
            renderPresetsGrid();
        }
    });
});
