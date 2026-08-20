# 🥗 NutriProtein - Calculadora de Eficiência Proteica & Custo-Benefício

> **Tome decisões inteligentes no supermercado:** descubra se o alimento compensa as calorias e o preço pela quantidade de proteína, ou se é apenas um "falso saudável" com rótulo apelativo.

---

## 🚀 Funcionalidades

1. **⚡ Calculadora Rápida & Diagnóstico em Tempo Real**:
   - Calcula o **% de calorias vindas de proteína**.
   - Calcula o **Índice de Eficiência Proteica (g de proteína por 100 kcal)**.
   - Divisão visual de macronutrientes (Proteínas, Carboidratos e Gorduras).
   - Veredito imediato em 5 níveis:
     - 🏆 **Nível Elite** (&ge; 50% de proteína) - Ex: Whey, Peito de frango, Tilápia.
     - 🥇 **Excelente Fonte** (35% a 49%) - Ex: Iogurtes tipo YoPRO/PRO, Cottage, Atum.
     - 🥈 **Boa Fonte** (20% a 34%) - Ex: Ovos inteiros, Queijo Minas light, Tofu.
     - ⚖️ **Fonte Complementar** (10% a 19%) - Ex: Feijão, Aveia, Leite integral.
     - ⚠️ **Atenção / "Falso Saudável"** (&lt; 10%) - Ex: Barrinhas doces comuns, snacks fit com muita gordura/açúcar.

2. **⚔️ Duelo de Produtos Lado a Lado (A vs B)**:
   - Compare duas marcas ou versões diretamente no corredor do mercado e veja quem vence em densidade proteica e custo.

3. **💰 Análise Financeira (Custo por Proteína)**:
   - Custo por 30g de proteína pura (equivalente a uma dose padrão de whey ou bife).
   - Custo por 10g de proteína e total de proteína na embalagem inteira.

4. **🛒 Carrinho de Compras & Histórico**:
   - Some a proteína total de todas as compras que você colocou no carrinho do mercado.
   - Veja o custo total acumulado e o custo médio por proteína.
   - Exporte ou compartilhe a lista formatada no WhatsApp.

5. **📚 Banco de Referências & Pegadinhas do Mercado**:
   - Presets prontos com alimentos comuns (Whey, Frango, Patinho, Iogurtes, Ovos, Tofu e pegadinhas como barras tradicionais e pasta de amendoim).

6. **📱 PWA & Funcionamento 100% Offline**:
   - Funciona mesmo sem sinal de internet ou Wi-Fi dentro do supermercado.
   - Pode ser instalado na tela inicial do celular como um aplicativo nativo.

7. **🌓 Modo Escuro e Claro (Dark/Light Mode)**:
   - Interface moderna com glassmorphism e cores neon selecionadas.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** semântico
- **CSS3 Moderno** (Variáveis, Flexbox, CSS Grid, Glassmorphism, animações SVG)
- **JavaScript Puro (ES6+ Modules)** - Sem dependências, sem frameworks pesados, carregamento instantâneo.
- **Service Worker & Web Manifest** para PWA (Progressive Web App).

---

## 📦 Como Rodar Localmente

Como o projeto utiliza módulos JavaScript nativos (`<script type="module">`), execute um servidor local simples:

### Usando VS Code (Live Server):
Clique com o botão direito no `index.html` e selecione **"Open with Live Server"**.

### Usando Python:
```bash
python -m http.server 3000
```
Acesse em: `http://localhost:3000`

### Usando Node (npx serve):
```bash
npx serve .
```

---

## 🌐 Como Fazer Deploy Gratuito

### 1. Na Vercel (Recomendado - 1 Clique)
1. Crie uma conta gratuita em [vercel.com](https://vercel.com).
2. Conecte seu repositório do GitHub ou arraste a pasta do projeto diretamente na interface da Vercel.
3. Clique em **Deploy**. O arquivo `vercel.json` já está configurado!

### 2. No Netlify
1. Acesse [netlify.com](https://netlify.com).
2. Arraste e solte a pasta do projeto na aba **"Sites"**.
3. O deploy estará ativo em segundos.

### 3. No GitHub Pages
1. Suba o projeto para um repositório no GitHub.
2. Vá em **Settings** > **Pages**.
3. Em *Source*, selecione a branch `main` e a pasta `/ (root)`.
4. Salve e acesse o link gerado!
