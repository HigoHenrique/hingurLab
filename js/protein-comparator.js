/**
 * Comparador de custo por proteína declarada no rótulo.
 * Todas as métricas abaixo usam somente os valores informados pelo usuário.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'hingurlab_protein_value_products_v1';
    const TYPES = [
        'Whey concentrado', 'Whey isolado', 'Whey hidrolisado', 'Blend de whey',
        'Caseína', 'Albumina', 'Proteína de soja', 'Proteína de ervilha',
        'Proteína de arroz', 'Blend vegetal', 'Proteína bovina', 'Colágeno', 'Outro'
    ];
    const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
    let products = [];
    let list, results, winner, ranking;

    const defaultProduct = (index) => ({
        id: `pv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: `Produto ${String.fromCharCode(65 + index)}`,
        type: 'Whey concentrado', portion: '', protein: '', netWeight: '', price: '', shipping: '', discount: ''
    });

    const parseNumber = value => {
        const parsed = parseFloat(String(value || '').replace(',', '.'));
        return Number.isFinite(parsed) ? parsed : 0;
    };
    const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
    })[char]);

    function calculate(product) {
        const portion = parseNumber(product.portion);
        const protein = parseNumber(product.protein);
        const netWeight = parseNumber(product.netWeight);
        const price = parseNumber(product.price);
        const shipping = parseNumber(product.shipping);
        const discount = parseNumber(product.discount);
        const finalPrice = price + shipping - discount;
        const validLabel = portion > 0 && protein > 0 && protein <= portion;
        const concentration = validLabel ? protein / portion * 100 : 0;
        const estimatedProtein = validLabel && netWeight > 0 ? netWeight * protein / portion : 0;
        const validComparison = estimatedProtein > 0 && finalPrice > 0;

        return {
            portion, protein, netWeight, finalPrice, concentration, estimatedProtein, validLabel, validComparison,
            costPerGram: validComparison ? finalPrice / estimatedProtein : 0,
            gramsPerReal: validComparison ? estimatedProtein / finalPrice : 0,
            costPer25g: validComparison ? finalPrice / estimatedProtein * 25 : 0
        };
    }

    function load() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (Array.isArray(saved) && saved.length >= 2) return saved;
        } catch (_) { /* A tela permanece funcional sem localStorage. */ }
        return [defaultProduct(0), defaultProduct(1)];
    }

    function save() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); } catch (_) { /* Persistência é opcional. */ }
    }

    function previewMarkup(product) {
        const metrics = calculate(product);
        return metrics.validLabel
            ? `<strong>${number.format(metrics.concentration)}% de proteína</strong><span>${number.format(metrics.protein)} g em ${number.format(metrics.portion)} g de produto</span>`
            : '<span>Informe porção e proteína do rótulo. A proteína não pode ser maior que a porção.</span>';
    }

    function renderCard(product, index) {
        const options = TYPES.map(type => `<option value="${escapeHtml(type)}" ${product.type === type ? 'selected' : ''}>${escapeHtml(type)}</option>`).join('');
        const preview = previewMarkup(product);

        return `<article class="glass-card pv-product-card" data-index="${index}">
            <div class="pv-card-header">
                <span class="up-card-badge">${String.fromCharCode(65 + index)}</span>
                <input class="form-control up-prod-name-input" data-field="name" value="${escapeHtml(product.name)}" aria-label="Nome do produto" placeholder="Nome e marca">
                <button type="button" class="btn-icon pv-remove" data-action="remove" title="Remover produto" ${products.length <= 2 ? 'disabled' : ''}>×</button>
            </div>
            <div class="pv-card-body">
                <div class="form-group">
                    <label class="form-label">Tipo de suplemento <span class="optional-badge">informativo</span></label>
                    <select class="form-control" data-field="type">${options}</select>
                </div>
                <div class="pv-form-row">
                    <div class="form-group"><label class="form-label">Porção <span class="essential-badge">✨</span></label><div class="input-wrapper"><input type="number" class="form-control" data-field="portion" value="${escapeHtml(product.portion)}" min="0" step="any" inputmode="decimal" placeholder="Ex: 40"><span class="input-unit">g</span></div></div>
                    <div class="form-group"><label class="form-label">Proteína por porção <span class="essential-badge">✨</span></label><div class="input-wrapper"><input type="number" class="form-control" data-field="protein" value="${escapeHtml(product.protein)}" min="0" step="any" inputmode="decimal" placeholder="Ex: 30"><span class="input-unit">g</span></div></div>
                </div>
                <div class="pv-preview">${preview}</div>
                <div class="pv-form-row">
                    <div class="form-group"><label class="form-label">Peso líquido <span class="essential-badge">✨</span></label><div class="input-wrapper"><input type="number" class="form-control" data-field="netWeight" value="${escapeHtml(product.netWeight)}" min="0" step="any" inputmode="decimal" placeholder="Ex: 900"><span class="input-unit">g</span></div></div>
                    <div class="form-group"><label class="form-label">Preço do pote <span class="essential-badge">✨</span></label><div class="input-wrapper"><input type="number" class="form-control" data-field="price" value="${escapeHtml(product.price)}" min="0" step="any" inputmode="decimal" placeholder="Ex: 119.90"><span class="input-unit">R$</span></div></div>
                </div>
                <details class="pv-optional">
                    <summary>Frete e desconto (opcionais)</summary>
                    <div class="pv-form-row">
                        <div class="form-group"><label class="form-label">Frete</label><div class="input-wrapper"><input type="number" class="form-control" data-field="shipping" value="${escapeHtml(product.shipping)}" min="0" step="any" inputmode="decimal" placeholder="0"><span class="input-unit">R$</span></div></div>
                        <div class="form-group"><label class="form-label">Desconto</label><div class="input-wrapper"><input type="number" class="form-control" data-field="discount" value="${escapeHtml(product.discount)}" min="0" step="any" inputmode="decimal" placeholder="0"><span class="input-unit">R$</span></div></div>
                    </div>
                </details>
            </div>
        </article>`;
    }

    function renderResults() {
        const valid = products
            .map((product, index) => ({ product, index, metrics: calculate(product) }))
            .filter(item => item.metrics.validComparison)
            .sort((a, b) => a.metrics.costPerGram - b.metrics.costPerGram);

        results.hidden = valid.length < 2;
        if (valid.length < 2) return;

        const best = valid[0];
        const next = valid[1];
        const savings = (next.metrics.costPerGram / best.metrics.costPerGram - 1) * 100;
        const bestName = escapeHtml(best.product.name || `Produto ${String.fromCharCode(65 + best.index)}`);
        winner.innerHTML = `<div class="up-winner-badge-icon">🏆</div><div class="up-winner-content"><div class="up-winner-top"><span class="up-winner-tag">Melhor custo por grama</span><strong class="up-winner-standard-price">${money.format(best.metrics.costPerGram)} / g</strong></div><div class="up-winner-title">${bestName}</div><div class="up-winner-savings-msg">Entrega ${number.format(best.metrics.gramsPerReal)} g de proteína por R$ 1,00${savings > 0 ? ` e custa ${number.format(savings)}% menos por grama que a próxima opção.` : '.'}</div></div>`;
        ranking.innerHTML = valid.map((item, position) => {
            const isWinner = position === 0;
            const difference = isWinner ? 0 : (item.metrics.costPerGram / best.metrics.costPerGram - 1) * 100;
            const productName = escapeHtml(item.product.name || `Produto ${String.fromCharCode(65 + item.index)}`);
            return `<div class="up-ranking-item ${isWinner ? 'winner-row' : ''}">
                <div class="up-rank-main-wrap"><div class="up-rank-pos-col"><span class="up-rank-medal ${isWinner ? 'gold' : ''}">${isWinner ? '🥇' : `${position + 1}º`}</span></div><div class="up-rank-info-col"><div class="up-rank-name-row"><strong class="up-rank-name">${productName}</strong>${isWinner ? '<span class="up-badge-winner">MELHOR COMPRA</span>' : ''}</div><div class="up-rank-package-details">${number.format(item.metrics.concentration)}% proteína • ~${number.format(item.metrics.estimatedProtein)} g no pote • ${escapeHtml(item.product.type)}</div></div></div>
                <div class="up-rank-price-col"><div class="up-rank-main-price">${money.format(item.metrics.costPerGram)} <span class="up-rank-price-unit">/ g</span></div><div class="up-rank-price-unit">${money.format(item.metrics.costPer25g)} por 25 g</div>${isWinner ? '<span class="up-rank-best-tag">Melhor valor</span>' : `<span class="up-rank-diff-tag">+${number.format(difference)}% mais caro/g</span>`}</div>
            </div>`;
        }).join('');
    }

    function render() {
        if (!list) return;
        list.innerHTML = products.map(renderCard).join('');
        list.querySelectorAll('[data-field]').forEach(input => {
            const update = event => {
            const card = event.target.closest('[data-index]');
            const index = Number(card.dataset.index);
            products[index][event.target.dataset.field] = event.target.value;
            save();
            card.querySelector('.pv-preview').innerHTML = previewMarkup(products[index]);
            renderResults();
            };
            input.addEventListener('input', update);
            input.addEventListener('change', update);
        });
        list.querySelectorAll('.pv-remove').forEach(button => button.addEventListener('click', event => {
            if (products.length <= 2) return;
            products.splice(Number(event.target.closest('[data-index]').dataset.index), 1);
            save();
            render();
        }));
        renderResults();
    }

    function init() {
        list = document.getElementById('pv-products-list');
        results = document.getElementById('pv-results');
        winner = document.getElementById('pv-winner');
        ranking = document.getElementById('pv-ranking');
        if (!list || !results || !winner || !ranking) return;
        products = load();
        document.getElementById('pv-add-product').addEventListener('click', () => { products.push(defaultProduct(products.length)); save(); render(); });
        document.getElementById('pv-clear-products').addEventListener('click', () => { products = [defaultProduct(0), defaultProduct(1)]; save(); render(); });
        render();
        window.ProteinValueApp = { render };
    }

    document.addEventListener('DOMContentLoaded', init);
}());
