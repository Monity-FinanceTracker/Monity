# 🎨 Monity Design System Documentation

> **Última atualização**: Outubro 2025  
> **Status**: Sistema de design completo e implementado

## 📖 Índice

1. [Visão Geral](#-visão-geral)
2. [Princípios de Design](#-princípios-de-design)
3. [Sistema de Cores](#-sistema-de-cores)
4. [Tipografia](#-tipografia)
5. [Componentes Base](#-componentes-base)
6. [Sistema Responsivo](#-sistema-responsivo)
7. [Espaçamento e Layout](#-espaçamento-e-layout)
8. [Padrões de UI](#-padrões-de-ui)
9. [Performance e Otimizações](#-performance-e-otimizações)
10. [Acessibilidade](#-acessibilidade)
11. [Boas Práticas](#-boas-práticas)

---

## 🎯 Visão Geral

O sistema de design Monity é construído com foco em:

- **Mobile-First**: Design progressivo começando de dispositivos móveis
- **Dark Theme Nativo**: Interface escura otimizada para uso prolongado
- **Performance**: Componentes memoizados e otimizados
- **Consistência**: Padrões visuais e de interação unificados
- **Acessibilidade**: Suporte completo a leitores de tela e navegação por teclado

### Pilha Tecnológica

```javascript
- React 18+ (com Hooks e Memo)
- Tailwind CSS 3.x
- React Query (TanStack Query)
- i18next (Internacionalização)
- Lucide React (Ícones)
```

---

## 🧠 Princípios de Design

### 1. **Clareza Visual**
- Hierarquia tipográfica clara
- Contraste adequado entre texto e fundo
- Espaçamento consistente entre elementos

### 2. **Feedback Imediato**
- Estados de hover e focus visíveis
- Animações suaves e propositais
- Indicadores de carregamento claros

### 3. **Consistência**
- Mesmos padrões em toda aplicação
- Nomenclatura padronizada de classes
- Comportamento previsível de componentes

### 4. **Performance First**
- Componentes memoizados
- Lazy loading de recursos
- Otimização de re-renders

---

## 🎨 Sistema de Cores

### Paleta Principal

```css
/* Backgrounds */
--background: #0A0A0A              /* Fundo principal (preto profundo) */
--primary-bg: #191E29              /* Fundo secundário */
--secondary-bg: #23263a            /* Fundo de cards */
--card-bg: #171717                 /* Fundo de componentes */

/* Borders & Dividers */
--border: #262626                  /* Bordas e divisores */
--border-hover: #262626/80         /* Bordas em hover */

/* Accent Colors */
--accent: #01C38D                  /* Cor primária (teal) */
--accent-hover: #01A071            /* Hover do accent */
--accent-light: #01C38D/10         /* Background accent leve */
--accent-medium: #01C38D/20        /* Background accent médio */

/* Text Colors */
--text-primary: #FFFFFF            /* Texto principal (branco) */
--text-secondary: #696E79          /* Texto secundário */
--text-muted: #9CA3AF              /* Texto discreto (gray-400) */
--text-gray: #D1D5DB               /* Texto cinza claro (gray-300) */

/* Status Colors */
--success: #10B981                 /* Verde - sucesso */
--success-light: #10B981/20        /* Background success */
--error: #EF4444                   /* Vermelho - erro */
--error-light: #EF4444/20          /* Background error */
--warning: #F59E0B                 /* Amarelo - aviso */
--warning-light: #F59E0B/20        /* Background warning */
--info: #3B82F6                    /* Azul - informação */
--info-light: #3B82F6/20           /* Background info */
```

### Cores Semânticas por Contexto

#### Transações

```css
/* Receitas */
.income-color: text-green-400      /* #4ADE80 */
.income-bg: bg-green-500/20

/* Despesas */
.expense-color: text-red-400       /* #F87171 */
.expense-bg: bg-red-500/20

/* Economia */
.savings-color: text-blue-400      /* #60A5FA */
.savings-bg: bg-blue-500/20
```

#### Estados de Saúde Financeira

```css
/* Excelente (80-100) */
.health-excellent: text-green-400
.health-excellent-gradient: from-green-500 to-green-600

/* Bom (60-79) */
.health-good: text-blue-400
.health-good-gradient: from-blue-500 to-blue-600

/* Regular (40-59) */
.health-fair: text-yellow-400
.health-fair-gradient: from-yellow-500 to-yellow-600

/* Ruim (0-39) */
.health-poor: text-red-400
.health-poor-gradient: from-red-500 to-red-600
```

### Gradientes

```css
/* Gradiente principal - Accent */
.gradient-primary: bg-gradient-to-r from-[#01C38D] to-[#01A071]

/* Gradiente em texto */
.gradient-text: bg-gradient-to-r from-[#01C38D] to-[#01A071] bg-clip-text text-transparent

/* Gradiente invertido */
.gradient-reverse: bg-gradient-to-r from-[#01A071] to-[#01C38D]

/* Gradiente radial */
.gradient-radial: bg-gradient-radial from-[#01C38D] to-[#01A071]
```

---

## 📝 Tipografia

### Família de Fontes

```css
font-family: 'DM Sans', system-ui, Avenir, Helvetica, Arial, sans-serif;
```

**DM Sans** foi escolhido por:
- Legibilidade excepcional em telas
- Suporte completo a caracteres latinos
- Peso variável para hierarquia
- Renderização otimizada

### Componentes de Tipografia

#### 1. **Heading Component**

Componente para títulos semânticos com responsividade automática.

```jsx
import { Heading } from '../ui/Typography';

// Uso básico
<Heading level={1}>Título Principal</Heading>
<Heading level={2}>Subtítulo</Heading>
<Heading level={3}>Seção</Heading>

// Com variantes
<Heading level={1} variant="gradient">
  Título com Gradiente
</Heading>

<Heading level={2} variant="accent" weight="semibold">
  Título com Accent
</Heading>

// Props disponíveis
level: 1-6           // Nível semântico HTML
variant: 'default' | 'gradient' | 'accent' | 'muted' | 'error' | 'success' | 'warning'
weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
className: string    // Classes Tailwind adicionais
```

**Escala Responsiva de Headings:**

```css
/* H1 - Hero Text */
text-4xl md:text-5xl lg:text-6xl
font-bold tracking-tight

/* H2 - Page Title */
text-3xl md:text-4xl lg:text-5xl
font-bold tracking-tight

/* H3 - Section Title */
text-2xl md:text-3xl lg:text-4xl
font-semibold tracking-tight

/* H4 - Subsection */
text-xl md:text-2xl lg:text-3xl
font-semibold

/* H5 - Card Title */
text-lg md:text-xl lg:text-2xl
font-medium

/* H6 - Small Heading */
text-base md:text-lg lg:text-xl
font-medium
```

#### 2. **Text Component**

Componente para texto de corpo com variações de tamanho e estilo.

```jsx
import { Text } from '../ui/Typography';

// Tamanhos
<Text size="xs">Texto extra pequeno</Text>
<Text size="sm">Texto pequeno</Text>
<Text size="base">Texto padrão</Text>
<Text size="lg">Texto grande</Text>
<Text size="xl">Texto extra grande</Text>
<Text size="2xl">Texto 2XL</Text>

// Variantes de cor
<Text variant="default">Texto padrão</Text>
<Text variant="muted">Texto discreto</Text>
<Text variant="accent">Texto com accent</Text>
<Text variant="error">Texto de erro</Text>
<Text variant="success">Texto de sucesso</Text>

// Peso e espaçamento
<Text weight="semibold" leading="relaxed">
  Texto semi-negrito com espaçamento relaxado
</Text>

// Elemento customizado
<Text as="span" size="sm" variant="muted">
  Renderizado como span
</Text>

// Props disponíveis
size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
variant: 'default' | 'muted' | 'accent' | 'error' | 'success' | 'warning'
weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
leading: 'tight' | 'normal' | 'relaxed' | 'loose'
as: string          // Elemento HTML a renderizar
```

#### 3. **Label Component**

Para labels de formulários e textos pequenos importantes.

```jsx
import { Label } from '../ui/Typography';

<Label htmlFor="email">Email</Label>
<Label variant="required" htmlFor="password">
  Senha (obrigatório)
</Label>
<Label size="sm" variant="muted">Campo opcional</Label>

// Props
variant: 'default' | 'muted' | 'accent' | 'error' | 'required'
size: 'xs' | 'sm' | 'base'
htmlFor: string
```

#### 4. **Caption Component**

Texto descritivo pequeno para legendas e metadados.

```jsx
import { Caption } from '../ui/Typography';

<Caption variant="muted">
  Última atualização há 2 minutos
</Caption>

<Caption variant="error">
  Erro ao carregar dados
</Caption>
```

#### 5. **Display Component**

Texto grande promocional para landing pages e hero sections.

```jsx
import { Display } from '../ui/Typography';

<Display size="lg" variant="gradient">
  Bem-vindo ao Monity
</Display>

// Tamanhos disponíveis
size: 'sm' | 'lg' | 'xl'

// Variantes
variant: 'default' | 'gradient'
```

#### 6. **Code Component**

Texto inline para código ou valores técnicos.

```jsx
import { Code } from '../ui/Typography';

<Code>npm install</Code>
<Code variant="muted">API_KEY</Code>
```

#### 7. **TextLink Component**

Links com estilo consistente.

```jsx
import { TextLink } from '../ui/Typography';

<TextLink href="/settings" underline="hover">
  Configurações
</TextLink>

// Props
variant: 'default' | 'muted' | 'accent'
underline: 'none' | 'always' | 'hover'
```

### Escala de Tamanhos

```css
/* Extra Small */
text-xs: 0.75rem (12px)

/* Small */
text-sm: 0.875rem (14px)

/* Base */
text-base: 1rem (16px)

/* Large */
text-lg: 1.125rem (18px)

/* Extra Large */
text-xl: 1.25rem (20px)

/* 2XL */
text-2xl: 1.5rem (24px)
```

### Pesos de Fonte

```css
font-light: 300
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
font-extrabold: 800
```

### Line Height (Leading)

```css
leading-tight: 1.25
leading-normal: 1.5
leading-relaxed: 1.625
leading-loose: 2
```

---

## 🧩 Componentes Base

### Button Component

Botão versátil com múltiplas variantes e estados.

```jsx
import Button from '../ui/Button';

// Variantes
<Button variant="primary">Primário</Button>
<Button variant="secondary">Secundário</Button>
<Button variant="danger">Perigo</Button>
<Button variant="ghost">Fantasma</Button>
<Button variant="outline">Contorno</Button>
<Button variant="minimal">Mínimo</Button>

// Tamanhos
<Button size="xs">Extra Pequeno</Button>
<Button size="sm">Pequeno</Button>
<Button size="md">Médio</Button>
<Button size="lg">Grande</Button>
<Button size="xl">Extra Grande</Button>

// Estados
<Button loading>Carregando...</Button>
<Button disabled>Desabilitado</Button>

// Com ícones
<Button 
  leftIcon={<Icon name="Plus" size="sm" />}
  variant="primary"
>
  Adicionar
</Button>

<Button 
  rightIcon={<Icon name="ArrowRight" size="sm" />}
  variant="outline"
>
  Continuar
</Button>

// Largura completa
<Button fullWidth variant="primary">
  Botão Completo
</Button>

// Props disponíveis
variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'minimal'
size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
disabled: boolean
loading: boolean
leftIcon: ReactNode
rightIcon: ReactNode
fullWidth: boolean
className: string
```

**Estilos por Variante:**

```css
/* Primary */
bg-[#01C38D] hover:bg-[#01A071] text-[#232323]

/* Secondary */
bg-[#171717] hover:bg-[#262626] text-white border border-[#262626]

/* Danger */
bg-red-500 hover:bg-red-600 text-white

/* Ghost */
text-[#01C38D] hover:bg-[#01C38D]/10

/* Outline */
border-2 border-[#01C38D] text-[#01C38D] hover:bg-[#01C38D] hover:text-[#232323]

/* Minimal */
text-gray-300 hover:text-white hover:bg-[#171717]
```

### Card Component

Container para agrupar conteúdo relacionado.

```jsx
import Card from '../ui/Card';

// Uso básico
<Card title="Título do Card">
  Conteúdo do card
</Card>

// Com subtítulo e ação no header
<Card 
  title="Transações Recentes"
  subtitle="Últimos 30 dias"
  headerAction={
    <Button size="sm" variant="ghost">Ver Todas</Button>
  }
>
  Lista de transações...
</Card>

// Com ícone
<Card 
  title="Saldo Total"
  icon={<Icon name="Wallet" className="text-[#01C38D]" />}
>
  R$ 1.234,56
</Card>

// Variantes
<Card variant="default">Card padrão</Card>
<Card variant="elevated">Card com sombra</Card>
<Card variant="outline">Card com contorno</Card>
<Card variant="glass">Card com efeito vidro</Card>

// Sem padding interno
<Card noPadding>
  <img src="image.jpg" alt="Imagem em card" />
</Card>

// Props disponíveis
title: string
subtitle: string
headerAction: ReactNode
icon: ReactNode
variant: 'default' | 'elevated' | 'outline' | 'glass'
noPadding: boolean
className: string
```

**Estilos por Variante:**

```css
/* Default */
bg-[#171717] border border-[#262626]

/* Elevated */
bg-[#171717] border border-[#262626] shadow-lg

/* Outline */
bg-transparent border-2 border-[#262626]

/* Glass */
bg-[#171717]/80 border border-[#262626]/50 backdrop-blur-sm
```

### Dropdown Component

Seletor customizado para melhor controle de estilo.

```jsx
import { Dropdown } from '../ui';

<Dropdown
  value={sortBy}
  onChange={setSortBy}
  options={[
    { value: 'date', label: 'Data' },
    { value: 'amount', label: 'Valor' },
    { value: 'category', label: 'Categoria' }
  ]}
  placeholder="Ordenar por..."
  className="w-full"
/>

// Props
value: string
onChange: (value: string) => void
options: Array<{ value: string, label: string }>
placeholder: string
className: string
disabled: boolean
```

### Spinner Component

Indicador de carregamento animado.

```jsx
import Spinner from '../ui/Spinner';

// Tamanhos
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />

// Com mensagem
<Spinner message="Carregando transações..." />

// Centralizado
<Spinner center message="Aguarde..." />

// Props
size: 'sm' | 'md' | 'lg'
message: string
center: boolean
```

### Skeleton Component

Estados de carregamento para melhor experiência.

```jsx
import { TransactionSkeleton, CardSkeleton } from '../ui/Skeleton';

// Skeleton de transações
<TransactionSkeleton count={5} />

// Skeleton de card
<CardSkeleton />

// Skeleton genérico
<div className="animate-pulse">
  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
</div>
```

### FormField Component

Campo de formulário com label e validação.

```jsx
import { FormField } from '../ui';

<FormField
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
  placeholder="seu@email.com"
/>

// Props
label: string
type: string
value: any
onChange: (e) => void
error: string
required: boolean
disabled: boolean
placeholder: string
helpText: string
```

### EmptyStates Component

Estados vazios informativos.

```jsx
import { EmptyState } from '../ui/EmptyStates';

<EmptyState
  icon={<Icon name="Inbox" size="xxl" />}
  title="Nenhuma transação"
  description="Você ainda não tem transações cadastradas."
  action={
    <Button variant="primary" onClick={handleAdd}>
      Adicionar Transação
    </Button>
  }
/>
```

---

## 📱 Sistema Responsivo

### Breakpoints

```javascript
const breakpoints = {
  base: 0,      // 0px+ (Mobile first)
  sm: 640,      // 640px+ (Large mobile)
  md: 768,      // 768px+ (Tablet)
  lg: 1024,     // 1024px+ (Desktop)
  xl: 1280,     // 1280px+ (Large desktop)
  '2xl': 1536   // 1536px+ (Extra large)
};
```

### Hooks Responsivos

#### useResponsive

Hook principal para detecção de breakpoints e características do dispositivo.

```jsx
import { useResponsive } from '../../hooks/useResponsive';

function MyComponent() {
  const {
    breakpoint,       // 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    isMobile,         // true se base
    isTablet,         // true se sm ou md
    isDesktop,        // true se lg, xl ou 2xl
    isSmallScreen,    // true se base ou sm
    isLargeScreen,    // true se lg, xl ou 2xl
    isAboveSm,        // true se >= sm
    isAboveMd,        // true se >= md
    isAboveLg,        // true se >= lg
    isAboveXl,        // true se >= xl
    isTouchDevice,    // Detecta dispositivos touch
    isLandscape,      // Orientação paisagem
    isPortrait        // Orientação retrato
  } = useResponsive();

  return (
    <div>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </div>
  );
}
```

#### useResponsiveValue

Retorna valores diferentes baseado no breakpoint atual.

```jsx
import { useResponsiveValue } from '../../hooks/useResponsive';

function MyComponent() {
  const columns = useResponsiveValue({
    base: 1,    // Mobile: 1 coluna
    md: 2,      // Tablet: 2 colunas
    lg: 3,      // Desktop: 3 colunas
    xl: 4       // Large desktop: 4 colunas
  });

  return <div>Mostrando {columns} colunas</div>;
}
```

#### useMediaQuery

Hook para queries CSS personalizadas.

```jsx
import { useMediaQuery } from '../../hooks/useResponsive';

function MyComponent() {
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  return isLargeScreen ? <DesktopView /> : <MobileView />;
}
```

#### useBreakpoint

Retorna o breakpoint atual.

```jsx
import { useBreakpoint } from '../../hooks/useResponsive';

function MyComponent() {
  const breakpoint = useBreakpoint();
  
  return <div>Breakpoint atual: {breakpoint}</div>;
}
```

### Componentes Responsivos

#### Container

Container com largura máxima e padding responsivo.

```jsx
import { Container } from '../ui/ResponsiveContainer';

// Tamanhos
<Container size="sm">Conteúdo estreito</Container>
<Container size="default">Conteúdo padrão</Container>
<Container size="lg">Conteúdo largo</Container>
<Container size="full">Largura completa</Container>

// Padding responsivo
<Container padding="sm">Padding pequeno</Container>
<Container padding="default">Padding padrão</Container>
<Container padding="lg">Padding grande</Container>
<Container padding="none">Sem padding</Container>

// Centralização
<Container center>Centralizado</Container>

// Props
size: 'sm' | 'default' | 'lg' | 'full'
padding: 'none' | 'sm' | 'default' | 'lg'
center: boolean
className: string
```

#### Grid

Sistema de grid responsivo.

```jsx
import { Grid } from '../ui/ResponsiveContainer';

<Grid 
  cols={{ base: 1, md: 2, lg: 3, xl: 4 }}
  gap="default"
>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</Grid>

// Props
cols: { base?: number, sm?: number, md?: number, lg?: number, xl?: number }
gap: 'none' | 'sm' | 'default' | 'lg' | 'xl'
className: string
```

#### Flex

Container flexbox responsivo.

```jsx
import { Flex } from '../ui/ResponsiveContainer';

<Flex 
  direction={{ base: 'col', md: 'row' }}
  align="center"
  justify="between"
  gap="lg"
  wrap
>
  <div>Item 1</div>
  <div>Item 2</div>
</Flex>

// Props
direction: { base?: string, sm?: string, md?: string, lg?: string }
            // 'row' | 'col' | 'row-reverse' | 'col-reverse'
align: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
gap: 'none' | 'sm' | 'default' | 'lg'
wrap: boolean
className: string
```

#### Stack

Organização vertical ou horizontal com espaçamento.

```jsx
import { Stack } from '../ui/ResponsiveContainer';

<Stack space="default" direction="vertical">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

// Props
space: 'none' | 'sm' | 'default' | 'lg' | 'xl'
direction: 'vertical' | 'horizontal'
className: string
```

#### Show

Controle de visibilidade baseado em breakpoint.

```jsx
import { Show } from '../ui/ResponsiveContainer';

// Visível acima de md
<Show above="md">
  Apenas em desktop
</Show>

// Visível abaixo de md
<Show below="md">
  Apenas em mobile
</Show>

// Visível apenas em lg
<Show only="lg">
  Apenas em telas grandes
</Show>

// Props
above: 'sm' | 'md' | 'lg' | 'xl'
below: 'sm' | 'md' | 'lg' | 'xl'
only: 'sm' | 'md' | 'lg' | 'xl'
```

#### TouchTarget

Área de toque otimizada para mobile.

```jsx
import { TouchTarget } from '../ui/ResponsiveContainer';

<TouchTarget size="default">
  <button>Botão Mobile</button>
</TouchTarget>

// Garante mínimo 44px de área tocável (iOS guidelines)

// Props
size: 'sm' | 'default' | 'lg'  // 40px | 44px | 48px
className: string
```

#### AspectRatio

Mantém proporção de aspecto.

```jsx
import { AspectRatio } from '../ui/ResponsiveContainer';

<AspectRatio ratio="16/9">
  <img src="video-thumbnail.jpg" alt="Thumbnail" />
</AspectRatio>

// Ratios disponíveis
ratio: '1/1' | '4/3' | '16/9' | '21/9' | string
```

### Classes Utilitárias Responsivas

```jsx
// Exemplo de uso em componentes
<div className="
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  md:grid-cols-3 
  lg:grid-cols-4
  gap-4 
  sm:gap-6
  p-4 
  sm:p-6 
  md:p-8
">
  {items.map(item => (
    <Card key={item.id}>
      <h3 className="text-lg sm:text-xl md:text-2xl">
        {item.title}
      </h3>
      <p className="text-sm sm:text-base text-gray-400">
        {item.description}
      </p>
    </Card>
  ))}
</div>
```

---

## 📏 Espaçamento e Layout

### Escala de Espaçamento

```css
/* Tailwind Spacing Scale */
0: 0px
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)
24: 6rem (96px)
```

### Espaçamento Interno (Padding)

```jsx
// Padding uniforme
<div className="p-4">Padding 16px em todos os lados</div>

// Padding horizontal e vertical
<div className="px-4 py-2">Horizontal 16px, Vertical 8px</div>

// Padding responsivo
<div className="p-4 sm:p-6 lg:p-8">
  Padding adaptativo
</div>

// Padding por lado
<div className="pt-4 pr-6 pb-4 pl-6">
  Padding individual por lado
</div>
```

### Espaçamento Externo (Margin)

```jsx
// Margin uniforme
<div className="m-4">Margin 16px em todos os lados</div>

// Margin horizontal e vertical
<div className="mx-auto my-8">Centralizado com margin vertical</div>

// Margin negativo para sobreposição
<div className="-mt-4">Margin top negativo</div>

// Margin responsivo
<div className="mb-4 sm:mb-6 lg:mb-8">
  Margin bottom adaptativo
</div>
```

### Espaçamento entre Elementos (Gap)

```jsx
// Para flexbox e grid
<div className="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Gap responsivo
<div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Space between (alternativa ao gap)
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Largura Máxima

```jsx
// Max-width presets
<div className="max-w-xs">Extra small (20rem)</div>
<div className="max-w-sm">Small (24rem)</div>
<div className="max-w-md">Medium (28rem)</div>
<div className="max-w-lg">Large (32rem)</div>
<div className="max-w-xl">Extra large (36rem)</div>
<div className="max-w-2xl">2XL (42rem)</div>
<div className="max-w-3xl">3XL (48rem)</div>
<div className="max-w-4xl">4XL (56rem)</div>
<div className="max-w-5xl">5XL (64rem)</div>
<div className="max-w-6xl">6XL (72rem)</div>
<div className="max-w-7xl">7XL (80rem)</div>

// Max-width responsivo
<div className="max-w-full sm:max-w-xl lg:max-w-4xl">
  Largura adaptativa
</div>
```

### Altura Mínima

```jsx
// Prevenção de CLS (Cumulative Layout Shift)
<div className="min-h-[200px]">
  Altura mínima garantida
</div>

// Altura de viewport
<div className="min-h-screen">
  Altura completa da tela
</div>
```

---

## 🎨 Padrões de UI

### Cards de Transação

```jsx
// Card de transação padrão
<div className="
  bg-[#171717] 
  border border-[#262626] 
  rounded-lg 
  p-4 
  hover:border-[#01C38D] 
  transition-all duration-200
">
  <div className="flex items-center justify-between">
    {/* Ícone e informações */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
        <Icon name="CreditCard" className="text-red-400" />
      </div>
      <div>
        <h4 className="text-white font-medium">
          Supermercado
        </h4>
        <p className="text-gray-400 text-sm">
          Alimentação • Hoje
        </p>
      </div>
    </div>
    
    {/* Valor */}
    <div className="text-right">
      <div className="text-red-400 font-bold text-lg">
        {formatCurrency(amount, typeId)}
      </div>
    </div>
  </div>
</div>
```

### Cards de Estatística

```jsx
// Card de métrica/estatística
<Card>
  <div className="text-center">
    <div className="text-4xl font-bold text-[#01C38D] mb-2">
      R$ 12.345,67
    </div>
    <div className="text-gray-400 text-sm">
      Saldo Total
    </div>
    <div className="mt-4 flex items-center justify-center gap-2 text-green-400 text-sm">
      <Icon name="TrendingUp" size="sm" />
      <span>+12.5% este mês</span>
    </div>
  </div>
</Card>
```

### Formulários

```jsx
// Estrutura de formulário padrão
<form onSubmit={handleSubmit} className="space-y-6">
  {/* Grupo de campos */}
  <div className="space-y-4">
    <FormField
      label="Descrição"
      type="text"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      placeholder="Ex: Compra no supermercado"
      required
    />
    
    <FormField
      label="Valor"
      type="number"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      placeholder="0,00"
      required
      helpText="Digite apenas números"
    />
    
    <div>
      <Label htmlFor="category" variant="default">
        Categoria
      </Label>
      <Dropdown
        id="category"
        value={category}
        onChange={setCategory}
        options={categories}
        placeholder="Selecione uma categoria"
      />
    </div>
  </div>

  {/* Botões de ação */}
  <div className="flex gap-3">
    <Button 
      type="button" 
      variant="secondary" 
      onClick={onCancel}
    >
      Cancelar
    </Button>
    <Button 
      type="submit" 
      variant="primary" 
      loading={isSubmitting}
    >
      Salvar
    </Button>
  </div>
</form>
```

### Modais e Diálogos

```jsx
// Estrutura de modal
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  <div className="bg-[#171717] border border-[#262626] rounded-2xl w-full max-w-md overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-[#262626]">
      <Heading level={3}>Título do Modal</Heading>
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <Icon name="X" size="md" />
      </button>
    </div>
    
    {/* Conteúdo */}
    <div className="p-6">
      <Text variant="muted">
        Conteúdo do modal aqui...
      </Text>
    </div>
    
    {/* Footer */}
    <div className="flex gap-3 p-6 border-t border-[#262626] bg-[#171717]">
      <Button variant="secondary" onClick={onClose} fullWidth>
        Cancelar
      </Button>
      <Button variant="primary" onClick={onConfirm} fullWidth>
        Confirmar
      </Button>
    </div>
  </div>
</div>
```

### Listas com Paginação

```jsx
// Lista com carregamento progressivo
<div className="space-y-4">
  {transactions.map(transaction => (
    <TransactionCard 
      key={transaction.id} 
      transaction={transaction} 
    />
  ))}
  
  {hasMore && (
    <div className="flex justify-center pt-4">
      <Button 
        variant="ghost" 
        onClick={loadMore}
        loading={isLoadingMore}
      >
        Carregar Mais
      </Button>
    </div>
  )}
</div>
```

### Breadcrumbs

```jsx
// Navegação breadcrumb
<nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
  <Link to="/" className="hover:text-white transition-colors">
    Dashboard
  </Link>
  <Icon name="ChevronRight" size="xs" />
  <Link to="/transactions" className="hover:text-white transition-colors">
    Transações
  </Link>
  <Icon name="ChevronRight" size="xs" />
  <span className="text-white">Detalhes</span>
</nav>
```

### Tabs (Abas)

```jsx
// Sistema de tabs
<div>
  {/* Tab Navigation */}
  <div className="border-b border-[#262626]">
    <nav className="flex gap-4 px-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            py-3 px-3 text-sm font-medium border-b-2 transition-colors
            flex items-center gap-2
            ${activeTab === tab.id
              ? 'border-[#01C38D] text-[#01C38D]'
              : 'border-transparent text-gray-400 hover:text-white'
            }
          `}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </nav>
  </div>

  {/* Tab Content */}
  <div className="p-6">
    {renderTabContent(activeTab)}
  </div>
</div>
```

### Tooltips

```jsx
// Tooltip simples
<div className="relative group">
  <button className="p-2">
    <Icon name="Info" size="sm" />
  </button>
  <div className="
    absolute bottom-full left-1/2 -translate-x-1/2 mb-2
    px-3 py-2 bg-[#171717] border border-[#262626] rounded-lg
    text-sm text-white whitespace-nowrap
    opacity-0 group-hover:opacity-100 transition-opacity
    pointer-events-none
  ">
    Informação adicional
    <div className="
      absolute top-full left-1/2 -translate-x-1/2
      border-4 border-transparent border-t-[#171717]
    "></div>
  </div>
</div>
```

### Toggle Switches

```jsx
// Switch toggle
<label className="relative inline-flex items-center cursor-pointer">
  <input
    type="checkbox"
    checked={enabled}
    onChange={(e) => setEnabled(e.target.checked)}
    className="sr-only peer"
  />
  <div className="
    w-11 h-6 bg-gray-700 rounded-full
    peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#01C38D]/30
    peer-checked:after:translate-x-full
    peer-checked:after:border-white
    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
    after:bg-white after:rounded-full after:h-5 after:w-5
    after:transition-all
    peer-checked:bg-[#01C38D]
  "></div>
  <span className="ml-3 text-sm font-medium text-white">
    Notificações
  </span>
</label>
```

---

## ⚡ Performance e Otimizações

### Memoização de Componentes

Todos os componentes base usam `React.memo` para evitar re-renders desnecessários.

```jsx
import { memo } from 'react';

const MyComponent = memo(({ data }) => {
  return <div>{data}</div>;
});

// Comparador customizado
const MyComplexComponent = memo(
  ({ data }) => {
    return <div>{data.value}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.data.id === nextProps.data.id;
  }
);
```

### Lazy Loading

```jsx
import { lazy, Suspense } from 'react';
import Spinner from './ui/Spinner';

// Lazy load de componentes pesados
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function MyPage() {
  return (
    <Suspense fallback={<Spinner center message="Carregando..." />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Debouncing

```jsx
import { useSearchDebounce } from '../../hooks/useDebounce';

function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useSearchDebounce(searchQuery, 300);
  
  // debouncedQuery só atualiza 300ms após parar de digitar
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);
  
  return (
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Buscar..."
    />
  );
}
```

### Otimização de Re-renders

```jsx
// useMemo para cálculos pesados
const expensiveCalculation = useMemo(() => {
  return transactions.reduce((acc, t) => acc + t.amount, 0);
}, [transactions]);

// useCallback para funções passadas como props
const handleClick = useCallback(() => {
  doSomething(param);
}, [param]);
```

### React Query - Cache e Stale Time

```jsx
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['transactions', 'list'],
  queryFn: fetchTransactions,
  staleTime: 2 * 60 * 1000,    // 2 minutos
  gcTime: 5 * 60 * 1000,        // 5 minutos (antes era cacheTime)
  refetchOnWindowFocus: false,  // Não refetch ao focar janela
});
```

### Prevenção de Layout Shift (CLS)

```css
/* Altura mínima para containers dinâmicos */
.dynamic-content {
  min-height: 100px;
  contain: layout;
}

/* Skeleton loaders com mesma altura do conteúdo real */
.skeleton-container {
  min-height: 200px;
}

/* Reservar espaço para imagens */
img {
  max-width: 100%;
  height: auto;
  aspect-ratio: attr(width) / attr(height);
}
```

### Otimização de Animações

```css
/* Use transform e opacity para animações suaves */
.fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Will-change para animações frequentes */
.animated-element {
  will-change: transform;
}

/* Remove will-change após animação */
.animated-element:not(.animating) {
  will-change: auto;
}
```

### Code Splitting

```javascript
// Rotas com lazy loading
const routes = [
  {
    path: '/transactions',
    component: lazy(() => import('./pages/Transactions'))
  },
  {
    path: '/settings',
    component: lazy(() => import('./pages/Settings'))
  }
];
```

---

## ♿ Acessibilidade

### Navegação por Teclado

```jsx
// Garantir foco visível
<button className="
  focus:outline-none 
  focus:ring-2 
  focus:ring-[#01C38D] 
  focus:ring-offset-2 
  focus:ring-offset-[#232323]
">
  Botão Acessível
</button>

// Trap de foco em modais
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose }) {
  const modalRef = useRef();
  
  useEffect(() => {
    if (isOpen) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      firstElement?.focus();
      
      const handleTab = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };
      
      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);
  
  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {/* Conteúdo */}
    </div>
  );
}
```

### ARIA Labels e Roles

```jsx
// Labels descritivos
<button aria-label="Fechar modal" onClick={onClose}>
  <Icon name="X" />
</button>

// Landmarks
<nav aria-label="Navegação principal">
  {/* Links de navegação */}
</nav>

<main aria-label="Conteúdo principal">
  {/* Conteúdo da página */}
</main>

// Estados dinâmicos
<button 
  aria-expanded={isOpen}
  aria-controls="dropdown-menu"
  onClick={toggle}
>
  Menu
</button>

<div 
  id="dropdown-menu"
  role="menu"
  aria-hidden={!isOpen}
>
  {/* Itens do menu */}
</div>

// Live regions para anúncios
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  className="sr-only"
>
  {notification}
</div>
```

### Contraste de Cores

Todas as combinações de cores seguem WCAG 2.1 nível AA:

```css
/* Texto branco em fundo escuro */
color: #FFFFFF;
background: #0A0A0A;
/* Razão de contraste: 19.2:1 ✓ */

/* Texto accent em fundo escuro */
color: #01C38D;
background: #171717;
/* Razão de contraste: 5.8:1 ✓ */

/* Texto cinza em fundo escuro */
color: #9CA3AF;
background: #171717;
/* Razão de contraste: 4.6:1 ✓ */
```

### Texto Alternativo para Imagens

```jsx
// Imagens decorativas
<img src="pattern.svg" alt="" role="presentation" />

// Imagens informativas
<img 
  src="chart.png" 
  alt="Gráfico mostrando crescimento de 15% nas receitas" 
/>

// Ícones com contexto
<button>
  <Icon name="Trash" aria-hidden="true" />
  <span>Excluir</span>
</button>

// Ícones sem texto visível
<button aria-label="Excluir transação">
  <Icon name="Trash" aria-hidden="true" />
</button>
```

### Screen Reader Only Content

```css
/* Classe utilitária para conteúdo apenas para leitores de tela */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```jsx
// Uso
<button>
  <Icon name="Search" />
  <span className="sr-only">Buscar transações</span>
</button>
```

---

## ✅ Boas Práticas

### Estrutura de Componentes

```
components/
├── ui/                      # Componentes base reutilizáveis
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Typography.jsx
│   ├── ResponsiveContainer.jsx
│   └── index.js            # Exportações centralizadas
├── forms/                  # Componentes de formulário
│   ├── FormField.jsx
│   ├── DatePicker.jsx
│   └── index.js
├── layout/                 # Componentes de layout
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   └── index.js
├── transactions/           # Feature específica
│   ├── TransactionCard.jsx
│   ├── TransactionList.jsx
│   └── index.js
└── ...
```

### Nomenclatura

```jsx
// Componentes: PascalCase
const TransactionCard = () => {};

// Hooks: camelCase com prefixo 'use'
const useTransactions = () => {};

// Utilitários: camelCase
const formatCurrency = () => {};

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// Props: camelCase
<Button onClick={handleClick} isLoading={loading} />

// CSS Classes: kebab-case (Tailwind) ou camelCase (CSS modules)
<div className="bg-primary-500 hover:bg-primary-600" />
```

### Organização de Imports

```jsx
// 1. React e hooks
import React, { useState, useEffect, memo } from 'react';

// 2. Bibliotecas externas
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// 3. Componentes internos
import { Button, Card } from '../ui';
import TransactionCard from './TransactionCard';

// 4. Hooks customizados
import { useTransactions } from '../../hooks/useQueries';
import { useResponsive } from '../../hooks/useResponsive';

// 5. Utilitários e helpers
import { formatCurrency } from '../../utils/currency';
import { Icon } from '../../utils/iconMapping';

// 6. Tipos (se TypeScript)
import type { Transaction } from '../../types';

// 7. Estilos (se necessário)
import './styles.css';
```

### Comentários

```jsx
/**
 * Componente de card de transação otimizado
 * 
 * Exibe informações de uma transação com suporte a:
 * - Múltiplos tipos (receita, despesa, economia)
 * - Ações inline (editar, excluir)
 * - Estados de carregamento
 * - Responsividade total
 * 
 * @component
 * @example
 * <TransactionCard
 *   transaction={transaction}
 *   onDelete={handleDelete}
 *   isSelected={isSelected}
 * />
 */
const TransactionCard = memo(({ transaction, onDelete, isSelected }) => {
  // Lógica de formatação de valores
  const formattedAmount = formatCurrency(transaction.amount, transaction.typeId);
  
  // Handler otimizado para prevenir re-renders
  const handleDelete = useCallback(() => {
    onDelete(transaction.id);
  }, [transaction.id, onDelete]);
  
  return (
    // JSX...
  );
});
```

### Gerenciamento de Estado

```jsx
// Estado local para UI
const [isOpen, setIsOpen] = useState(false);

// Estado global com Context
const { user, subscriptionTier } = useAuth();

// Estado do servidor com React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['transactions'],
  queryFn: fetchTransactions
});

// Evitar prop drilling com Context
import { createContext, useContext } from 'react';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  
  return (
    <TransactionContext.Provider value={{ transactions, setTransactions }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactionContext must be used within TransactionProvider');
  }
  return context;
};
```

### Tratamento de Erros

```jsx
// Error Boundary para erros React
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <Heading level={2} variant="error">
            Algo deu errado
          </Heading>
          <Text variant="muted" className="mt-2">
            Tente recarregar a página
          </Text>
          <Button 
            onClick={() => window.location.reload()}
            variant="primary"
            className="mt-4"
          >
            Recarregar
          </Button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Tratamento de erros em requisições
const { data, error, isLoading } = useQuery({
  queryKey: ['transactions'],
  queryFn: async () => {
    try {
      const response = await api.get('/transactions');
      return response.data;
    } catch (error) {
      // Log do erro
      console.error('Failed to fetch transactions:', error);
      
      // Notificação ao usuário
      toast.error('Erro ao carregar transações');
      
      // Re-throw para React Query lidar
      throw error;
    }
  },
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
});

// Renderização de estados de erro
if (error) {
  return (
    <Card variant="elevated" className="border-red-500/20">
      <div className="text-center py-8">
        <Icon name="AlertCircle" className="text-red-400 mx-auto mb-4" size="xl" />
        <Heading level={3} variant="error">
          Erro ao carregar dados
        </Heading>
        <Text variant="muted" className="mt-2">
          {error.message || 'Ocorreu um erro inesperado'}
        </Text>
        <Button 
          variant="danger" 
          onClick={refetch}
          className="mt-4"
        >
          Tentar Novamente
        </Button>
      </div>
    </Card>
  );
}
```

### Testes

```jsx
// Estrutura de teste com React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TransactionCard from './TransactionCard';

describe('TransactionCard', () => {
  const mockTransaction = {
    id: 1,
    description: 'Supermercado',
    amount: 150.00,
    typeId: 1,
    category: 'Alimentação',
    date: '2024-01-15'
  };
  
  const queryClient = new QueryClient();
  
  const renderWithProviders = (ui) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };
  
  it('renderiza corretamente', () => {
    renderWithProviders(
      <TransactionCard transaction={mockTransaction} />
    );
    
    expect(screen.getByText('Supermercado')).toBeInTheDocument();
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
  });
  
  it('chama onDelete quando botão é clicado', async () => {
    const onDelete = jest.fn();
    
    renderWithProviders(
      <TransactionCard 
        transaction={mockTransaction}
        onDelete={onDelete}
      />
    );
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(mockTransaction.id);
    });
  });
  
  it('formata o valor corretamente', () => {
    renderWithProviders(
      <TransactionCard transaction={mockTransaction} />
    );
    
    expect(screen.getByText('-R$ 150,00')).toBeInTheDocument();
  });
});
```

### Internacionalização

```jsx
// Uso do i18next
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <div>
      <Heading level={2}>
        {t('dashboard.welcome')}
      </Heading>
      
      <Text>
        {t('dashboard.greeting', { name: user.name })}
      </Text>
      
      <Button onClick={() => changeLanguage('en')}>
        English
      </Button>
      <Button onClick={() => changeLanguage('pt')}>
        Português
      </Button>
    </div>
  );
}

// Arquivo de tradução (pt-BR.json)
{
  "dashboard": {
    "welcome": "Bem-vindo",
    "greeting": "Olá, {{name}}!"
  }
}
```

---

## 📚 Exemplos Completos

### Página de Dashboard

```jsx
import React from 'react';
import { Container, Grid } from '../ui/ResponsiveContainer';
import { Heading, Text } from '../ui/Typography';
import { Card, Button } from '../ui';
import { useResponsive } from '../../hooks/useResponsive';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../utils/iconMapping';

const Dashboard = () => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  
  return (
    <Container size="default" padding="default">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#01C38D] to-[#01A071] rounded-xl p-6">
          <Heading level={1} className="text-white mb-2">
            {t('dashboard.welcome_back')} 👋
          </Heading>
          <Text className="text-white/80">
            {t('dashboard.overview_today')}
          </Text>
        </div>

        {/* Stats Grid */}
        <Grid 
          cols={{ base: 1, md: 2, lg: 4 }} 
          gap="default"
        >
          <Card variant="elevated">
            <div className="flex items-center justify-between mb-4">
              <Text variant="muted" size="sm">
                {t('dashboard.balance')}
              </Text>
              <Icon name="Wallet" className="text-[#01C38D]" />
            </div>
            <Heading level={3} className="mb-1">
              R$ 12.345,67
            </Heading>
            <Text size="sm" variant="success">
              +12.5% este mês
            </Text>
          </Card>

          <Card variant="elevated">
            <div className="flex items-center justify-between mb-4">
              <Text variant="muted" size="sm">
                {t('dashboard.income')}
              </Text>
              <Icon name="TrendingUp" className="text-green-400" />
            </div>
            <Heading level={3} className="mb-1 text-green-400">
              R$ 8.500,00
            </Heading>
            <Text size="sm" variant="muted">
              Este mês
            </Text>
          </Card>

          <Card variant="elevated">
            <div className="flex items-center justify-between mb-4">
              <Text variant="muted" size="sm">
                {t('dashboard.expenses')}
              </Text>
              <Icon name="CreditCard" className="text-red-400" />
            </div>
            <Heading level={3} className="mb-1 text-red-400">
              R$ 3.200,00
            </Heading>
            <Text size="sm" variant="muted">
              Este mês
            </Text>
          </Card>

          <Card variant="elevated">
            <div className="flex items-center justify-between mb-4">
              <Text variant="muted" size="sm">
                {t('dashboard.savings')}
              </Text>
              <Icon name="PiggyBank" className="text-blue-400" />
            </div>
            <Heading level={3} className="mb-1 text-blue-400">
              R$ 5.300,00
            </Heading>
            <Text size="sm" variant="muted">
              62% da meta
            </Text>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Card 
          title={t('dashboard.quick_actions')}
          variant="elevated"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              fullWidth
              leftIcon={<Icon name="Plus" size="sm" />}
            >
              {t('dashboard.add_income')}
            </Button>
            <Button 
              variant="outline" 
              fullWidth
              leftIcon={<Icon name="Minus" size="sm" />}
            >
              {t('dashboard.add_expense')}
            </Button>
            <Button 
              variant="outline" 
              fullWidth
              leftIcon={<Icon name="Target" size="sm" />}
            >
              {t('dashboard.set_goal')}
            </Button>
            <Button 
              variant="outline" 
              fullWidth
              leftIcon={<Icon name="Download" size="sm" />}
            >
              {t('dashboard.export')}
            </Button>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card 
          title={t('dashboard.recent_transactions')}
          subtitle={t('dashboard.last_30_days')}
          headerAction={
            <Button variant="ghost" size="sm">
              {t('dashboard.view_all')}
            </Button>
          }
          variant="elevated"
        >
          <TransactionList limit={5} />
        </Card>
      </div>
    </Container>
  );
};

export default Dashboard;
```

---

## 🎉 Conclusão

Este design system fornece todos os componentes, padrões e diretrizes necessárias para construir interfaces consistentes, acessíveis e performáticas no Monity.

### Recursos Adicionais

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [DM Sans Font](https://fonts.google.com/specimen/DM+Sans)

### Manutenção

Este documento deve ser atualizado sempre que:
- Novos componentes são adicionados
- Padrões de design são modificados
- Novas cores ou tokens são introduzidos
- Mudanças significativas na arquitetura são feitas

---

**Última revisão**: Outubro 2025  
**Versão**: 2.0  
**Mantido por**: Equipe Monity
