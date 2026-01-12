# Design System - CJota Catálogo Profissional

## Visão Geral

Sistema de design minimalista e profissional para painel administrativo e catálogo público. **Sem emojis**, foco em clareza, hierarquia visual e usabilidade.

---

## Paleta de Cores

### Cores Principais

```css
--color-primary: #1a1a1a      /* Preto suave - textos e elementos principais */
--color-secondary: #4a5568    /* Cinza escuro - elementos secundários */
--color-accent: #3b82f6       /* Azul vibrante - CTAs e destaques */
```

### Superfícies e Fundos

```css
--color-surface: #ffffff      /* Branco - cards, modais */
--color-surface-variant: #f8fafc  /* Cinza muito claro - alternância */
--color-background: #f7fafc   /* Cinza clarinho - fundo geral */
```

### Texto

```css
--color-text-primary: #1a202c    /* Preto suave - títulos e textos principais */
--color-text-secondary: #718096  /* Cinza médio - textos secundários */
--color-text-tertiary: #a0aec0   /* Cinza claro - legendas */
--color-text-inverse: #ffffff    /* Branco - texto em fundos escuros */
```

### Bordas e Divisores

```css
--color-border: #e2e8f0          /* Cinza claro - bordas padrão */
--color-border-hover: #cbd5e0    /* Cinza mais escuro - hover */
--color-divider: #edf2f7         /* Cinza muito claro - divisórias sutis */
```

### Estados Semânticos

```css
--color-success: #10b981    /* Verde - sucesso, confirmações */
--color-warning: #f59e0b    /* Laranja - avisos, atenção */
--color-error: #ef4444      /* Vermelho - erros, exclusões */
--color-info: #3b82f6       /* Azul - informações gerais */
```

---

## Tipografia

### Fontes

**Família primária**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

- Moderna, clean e legível
- Ótima para interfaces
- Alternativa: Work Sans, Source Sans Pro

**Família de código**: JetBrains Mono, Fira Code, monospace

### Escala de Tamanhos

| Nome | Tamanho | Uso |
|------|---------|-----|
| xs | 12px | Labels pequenas, metadados |
| sm | 14px | Textos secundários, inputs |
| base | 16px | Corpo de texto padrão |
| lg | 18px | Subtítulos, leads |
| xl | 20px | Títulos de cards |
| 2xl | 24px | Títulos de seções |
| 3xl | 30px | Títulos de páginas |
| 4xl | 36px | Títulos principais (hero) |

### Pesos

| Peso | Valor | Uso |
|------|-------|-----|
| normal | 400 | Corpo de texto |
| medium | 500 | Ênfase leve |
| semibold | 600 | Títulos, botões |
| bold | 700 | Destaque máximo |

### Line Heights

- **Tight (1.25)**: Títulos, headings
- **Normal (1.5)**: Corpo de texto padrão
- **Relaxed (1.75)**: Textos longos, parágrafos

---

## Espaçamento

Sistema baseado em múltiplos de 4px para consistência.

| Token | Valor | Uso |
|-------|-------|-----|
| xs | 4px | Espaçamentos mínimos |
| sm | 8px | Espaçamentos pequenos |
| md | 16px | Espaçamento padrão |
| lg | 24px | Espaçamentos generosos |
| xl | 32px | Seções |
| 2xl | 48px | Entre seções grandes |
| 3xl | 64px | Espaçamento hero |

**Padrões recomendados:**
- Padding interno de cards: `--spacing-lg` (24px)
- Margem entre seções: `--spacing-2xl` (48px)
- Gap em grids: `--spacing-xl` (32px)

---

## Componentes

### Botões

#### Variantes

**Primary** (ações principais)
```css
background: var(--color-primary);
color: white;
padding: 8px 24px;
border-radius: 6px;
font-weight: 500;
```

**Secondary** (ações secundárias)
```css
background: var(--color-surface);
color: var(--color-text-primary);
border: 1px solid var(--color-border);
```

**Accent** (CTAs importantes)
```css
background: var(--color-accent);
color: white;
```

#### Tamanhos
- **Small**: padding 4px 16px, font-size 14px
- **Base**: padding 8px 24px, font-size 16px
- **Large**: padding 16px 32px, font-size 18px

#### Estados
- **Hover**: reduzir opacity para 0.9
- **Active**: reduzir opacity para 0.8
- **Disabled**: opacity 0.5, cursor not-allowed

### Cards

```css
background: var(--color-surface);
border: 1px solid var(--color-border);
border-radius: 8px;
padding: 24px;
box-shadow: 0 1px 3px rgba(0,0,0,0.1);
```

**Hover**: `box-shadow: 0 4px 6px rgba(0,0,0,0.1);`

### Inputs

```css
width: 100%;
padding: 8px 16px;
font-size: 16px;
border: 1px solid var(--color-border);
border-radius: 6px;
transition: border-color 150ms;
```

**Focus**: 
```css
border-color: var(--color-accent);
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
```

### Badges

Pequenas etiquetas para status.

```css
padding: 4px 8px;
font-size: 12px;
font-weight: 500;
border-radius: 9999px;
```

**Success**: fundo verde claro, texto verde  
**Warning**: fundo laranja claro, texto laranja  
**Error**: fundo vermelho claro, texto vermelho

---

## Bordas e Sombras

### Border Radius

| Tamanho | Valor | Uso |
|---------|-------|-----|
| sm | 4px | Badges, tags |
| md | 6px | Inputs, botões |
| lg | 8px | Cards |
| xl | 12px | Modais, containers grandes |
| full | 9999px | Pills, avatares |

### Sombras

**XS**: `0 1px 2px rgba(0,0,0,0.05)` - elementos sutis  
**SM**: `0 1px 3px rgba(0,0,0,0.1)` - cards padrão  
**MD**: `0 4px 6px rgba(0,0,0,0.1)` - cards hover  
**LG**: `0 10px 15px rgba(0,0,0,0.1)` - modais  
**XL**: `0 20px 25px rgba(0,0,0,0.1)` - dropdowns, popovers

---

## Layout

### Máximas de Largura

| Breakpoint | Largura | Uso |
|------------|---------|-----|
| sm | 640px | Mobile landscape |
| md | 768px | Tablets |
| lg | 1024px | Desktops pequenos |
| xl | 1280px | Desktops padrão |
| 2xl | 1536px | Telas grandes |

### Grid de Produtos

```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: 32px;
```

### Sidebar Admin

- **Largura expandida**: 260px
- **Largura colapsada**: 64px
- **Altura do header**: 64px

---

## Painel Admin - Estrutura

### Sidebar

- Logo no topo (32px altura)
- Navegação com seções agrupadas
- Itens com ícones (20x20px) + texto
- Estado ativo: fundo primary, texto branco
- Hover: fundo surface-variant

### Header

- Altura fixa: 64px
- Título da página à esquerda (font-size 2xl)
- Ações/usuário à direita

### Conteúdo Principal

- Padding: 48px
- Máxima largura: container padrão
- Cards de estatísticas: grid auto-fit 240px

### Cards de Estatística

```
┌────────────────────────┐
│ Título      [Ícone]   │
│                        │
│ 1.234                  │
│ +12% vs mês anterior   │
└────────────────────────┘
```

---

## Catálogo Público - Estrutura

### Header

**Top bar** (opcional)
- Fundo: surface-variant
- Altura: 32px
- Contato/links institucionais

**Main header**
- Altura: 64px
- Logo (48px altura) + nome
- Menu de navegação (center ou right)
- Botão de carrinho (right)

### Banners

- Altura: 480px
- Imagem de fundo com overlay escuro
- Conteúdo: título (4xl), subtítulo (xl), CTA
- Posicionamento: esquerda, padding 48px

### Grid de Produtos

```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│      │ │      │ │      │ │      │
│ IMG  │ │ IMG  │ │ IMG  │ │ IMG  │
│      │ │      │ │      │ │      │
├──────┤ ├──────┤ ├──────┤ ├──────┤
│Título│ │Título│ │Título│ │Título│
│Preço │ │Preço │ │Preço │ │Preço │
│[CTA] │ │[CTA] │ │[CTA] │ │[CTA] │
└──────┘ └──────┘ └──────┘ └──────┘
```

### Card de Produto

- Aspect ratio imagem: 3:4
- Hover: translateY(-4px) + sombra
- Badge de desconto (se aplicável): canto superior direito
- Categoria: uppercase, 12px, letra-spacing 0.05em
- Nome: 18px, semibold
- Descrição: 14px, 2 linhas máximo (ellipsis)
- Preço: 24px, bold, cor primary

### Página de Produto

**Layout duas colunas** (1:1)

**Coluna 1** - Galeria
- Imagem principal: aspect ratio 1:1
- Thumbnails abaixo: 4 colunas

**Coluna 2** - Informações
- Breadcrumb (pequeno, topo)
- Título (4xl, bold)
- Preço (seção destacada com fundo)
- Descrição (relaxed line-height)
- Seletor de variantes (grid)
- Quantidade + botão adicionar

---

## Página de Branding (Admin)

### Seções

1. **Upload de Logo**
   - Área de drop com borda tracejada
   - Preview da imagem atual
   - Dimensões recomendadas: 200x60px

2. **Paleta de Cores**
   - Grid de color pickers (180px min)
   - Preview visual da cor selecionada (60px altura)
   - Label descritivo

3. **Banners**
   - Lista de banners cadastrados
   - Formulário: upload imagem + título + subtítulo + link
   - Ordenação drag-and-drop (futuro)

---

## Boas Práticas

### ✅ Fazer

- Usar variáveis CSS para tudo
- Manter consistência no espaçamento (múltiplos de 4px)
- Priorizar legibilidade sobre "design bonito"
- Usar hierarquia visual clara
- Estados de hover/focus sempre visíveis
- Feedback visual em todas as interações

### ❌ Evitar

- Emojis em títulos, botões ou textos de interface
- Degradês chamativos ou cores muito vibrantes
- Tipografia abaixo de 14px (exceto labels muito pequenas)
- Contrastes insuficientes (mínimo 4.5:1 para texto)
- Animações excessivas
- Elementos decorativos sem função

---

## Implementação Técnica

### Como aplicar o tema

1. **No banco de dados**
   - Tabela `site_settings` armazena as cores
   - Helper `loadSiteSettings()` busca configurações

2. **No template EJS**
   ```ejs
   <style><%= themeCSS %></style>
   ```

3. **Helper gera CSS**
   ```javascript
   function generateThemeCSS(settings) {
     return `:root { --color-primary: ${settings.color_primary}; }`
   }
   ```

4. **CSS usa variáveis**
   ```css
   .btn-primary {
     background-color: var(--color-primary);
   }
   ```

### Middleware

Injetar configurações em todas as views:

```javascript
app.use(injectSiteSettings);
```

Disponibiliza:
- `res.locals.siteSettings`
- `res.locals.themeCSS`
- `res.locals.activeBanners`

---

## Responsividade

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Ajustes Mobile

- Sidebar admin: colapsar para 64px (apenas ícones)
- Grid de produtos: 1 coluna
- Banners: altura reduzida para 360px
- Padding geral: reduzir de 48px para 24px
- Página de produto: layout de 1 coluna

---

## Checklist de Qualidade

Antes de considerar uma tela "pronta":

- [ ] Todas as cores usam variáveis CSS
- [ ] Espaçamento segue o sistema de tokens
- [ ] Tipografia usa a escala definida
- [ ] Nenhum emoji presente
- [ ] Estados de hover/focus implementados
- [ ] Layout responsivo testado
- [ ] Contraste de cores adequado (WCAG AA)
- [ ] Feedback visual em todas as ações
- [ ] Loading states onde aplicável
- [ ] Tratamento de erros visível

---

**Versão**: 1.0  
**Última atualização**: Janeiro 2026  
**Mantido por**: Equipe CJota
