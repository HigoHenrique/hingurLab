/**
 * storage.js - Gerenciador de persistência no LocalStorage (Histórico e Carrinho do Supermercado)
 */

const STORAGE_KEYS = {
    HISTORY: 'nutriprotein_history_v1',
    CART: 'nutriprotein_cart_v1',
    SETTINGS: 'nutriprotein_settings_v1'
};

const StorageManager = {
    // ---- HISTÓRICO DE ANÁLISES ----
    getHistory() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Erro ao ler histórico:', e);
            return [];
        }
    },

    saveToHistory(product) {
        try {
            const history = this.getHistory();
            const item = {
                id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                timestamp: new Date().toISOString(),
                ...product
            };
            // Manter os 50 mais recentes
            const updated = [item, ...history.filter(h => h.name !== product.name || h.calories !== product.calories)].slice(0, 50);
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
            return item;
        } catch (e) {
            console.error('Erro ao salvar no histórico:', e);
            return null;
        }
    },

    removeFromHistory(id) {
        try {
            const history = this.getHistory().filter(item => item.id !== id);
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
            return history;
        } catch (e) {
            console.error('Erro ao remover do histórico:', e);
            return [];
        }
    },

    clearHistory() {
        try {
            localStorage.removeItem(STORAGE_KEYS.HISTORY);
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
        } catch (e) {
            console.error('Erro ao limpar histórico:', e);
        }
    },

    // ---- CARRINHO DE COMPRAS DO MERCADO ----
    getCart() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.CART);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Erro ao ler carrinho:', e);
            return [];
        }
    },

    addToCart(product, quantity = 1) {
        try {
            const cart = this.getCart();
            const existingIndex = cart.findIndex(item => item.name === product.name && item.calories === product.calories);
            
            if (existingIndex >= 0) {
                cart[existingIndex].quantity += quantity;
            } else {
                cart.push({
                    id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                    quantity,
                    addedAt: new Date().toISOString(),
                    ...product
                });
            }

            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
            return cart;
        } catch (e) {
            console.error('Erro ao adicionar ao carrinho:', e);
            return [];
        }
    },

    updateCartQuantity(id, delta) {
        try {
            let cart = this.getCart();
            const item = cart.find(i => i.id === id);
            if (item) {
                item.quantity += delta;
                if (item.quantity <= 0) {
                    cart = cart.filter(i => i.id !== id);
                }
                localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
            }
            return cart;
        } catch (e) {
            console.error('Erro ao atualizar quantidade do carrinho:', e);
            return [];
        }
    },

    removeFromCart(id) {
        try {
            const cart = this.getCart().filter(item => item.id !== id);
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
            return cart;
        } catch (e) {
            console.error('Erro ao remover do carrinho:', e);
            return [];
        }
    },

    clearCart() {
        try {
            localStorage.removeItem(STORAGE_KEYS.CART);
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
        } catch (e) {
            console.error('Erro ao limpar carrinho:', e);
        }
    },

    getCartSummary() {
        const cart = this.getCart();
        let totalItems = 0;
        let totalCost = 0;
        let totalProteinGrams = 0;
        let totalCalories = 0;

        cart.forEach(item => {
            const q = item.quantity || 1;
            totalItems += q;
            
            if (item.costAnalysis && item.costAnalysis.hasData) {
                totalCost += (item.raw.price || 0) * q;
                totalProteinGrams += (item.costAnalysis.totalProteinInPackage || 0) * q;
            } else if (item.raw) {
                totalProteinGrams += (item.raw.protein || 0) * q;
                totalCalories += (item.raw.calories || 0) * q;
                if (item.raw.price) totalCost += item.raw.price * q;
            }
        });

        const avgCostPer30g = totalProteinGrams > 0 ? (totalCost / totalProteinGrams) * 30 : 0;

        return {
            totalItems,
            totalCost: Number(totalCost.toFixed(2)),
            totalProteinGrams: Number(totalProteinGrams.toFixed(1)),
            totalCalories: Number(totalCalories.toFixed(0)),
            avgCostPer30g: Number(avgCostPer30g.toFixed(2))
        };
    },

    // ---- CONFIGURAÇÕES ----
    getTheme() {
        return localStorage.getItem('nutriprotein_theme') || 'dark';
    },

    setTheme(theme) {
        localStorage.setItem('nutriprotein_theme', theme);
    }
};

window.StorageManager = StorageManager;
window.NutriStorage = StorageManager;
