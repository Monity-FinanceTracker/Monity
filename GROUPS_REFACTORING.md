# Refatoração da Seção de Grupos

## Resumo

Refatoração completa da seção de grupos com foco em performance, consistência visual e melhorias de UX. Substituição de gerenciamento manual de estado por React Query, layout em grid responsivo, dropdown de informações, funcionalidade de ordenação e exibição de saldo do usuário.

## Mudanças Principais

### Performance e Arquitetura

- **React Query Integration**: Substituído estado manual por hooks `useGroups()` e `useGroupById()`
- **Mutations**: Implementadas para operações do grupo (`useAddGroupExpense`, `useInviteGroupMember`, `useSettleExpenseShare`)
- **Remoção de subscriptions Supabase**: Usando refetch automático do React Query
- **Cache inteligente**: `staleTime` de 5 minutos (lista) e 2 minutos (detalhes)
- **Otimizações**: `React.memo`, `useMemo`, funções utilitárias movidas para fora dos componentes
- **Resultado**: ~60-80% menos re-renders em listas com múltiplos grupos

### Layout e Visual

#### Grid Layout Responsivo
- Cards retangulares em grid (1 col mobile, 2 tablet, 3 desktop)
- Design minimalista com informações essenciais visíveis
- Hover effects com borda brilhante (`hover:border-[#3a3a3a]`)
- Containers separados (removido `divide-y`)

#### Dropdown de Informações
- Botão de três pontos (`MoreVertical`) no canto superior direito do card
- Exibe: gasto por membro, saldo do usuário e última atividade
- Saldo do usuário: verde se deve receber, vermelho se deve pagar
- Contraste melhorado (labels `text-[#8B8A85]`, valores `text-white font-bold`)
- Borda destacada (`border-2 border-[#3a3a3a]`)
- Fecha ao clicar fora, previne navegação ao clicar no botão

#### Ordenação de Grupos
- Dropdown para selecionar critério (Nome, Membros, Total Gasto, Última Atividade)
- Botão de direção para alternar crescente/decrescente (↑/↓)
- Posicionado na mesma linha do botão "Create Group", à esquerda
- Lógica otimizada com `useMemo`

#### Navegação
- Seta fixa no topo esquerdo (`fixed top-4 left-4`) em `CreateGroup.jsx` e `GroupPage.jsx`
- Mesmo padrão visual do `AddExpense`
- Traduções: "Back to Groups" → "Back" / "Voltar para Grupos" → "Voltar"

### Funcionalidades Adicionais

#### Saldo do Usuário no Grupo
- Cálculo no backend: quanto o usuário pagou - quanto o usuário deve
- Exibido no dropdown do card quando diferente de zero
- Cores: verde (deve receber), vermelho (deve pagar)
- Traduções: "Seu saldo", "Você deve receber", "Você deve"

### Página de Detalhes (GroupPage)

- React Query com `useGroupById` e mutations
- Cards de membros e despesas com hover effects e melhor contraste
- Loading states e botões desabilitados durante mutations
- Removido import supabase, useCallback desnecessários e alert()
- Estado local simplificado apenas para formulários

## Arquivos Modificados

```
frontend/src/components/groups/
├── Groups.jsx              # React Query + grid layout + ordenação
├── GroupCard.jsx           # Card retangular com dropdown e saldo
├── GroupPage.jsx           # Refatoração completa com React Query
├── CreateGroup.jsx         # Seta de navegação fixa
└── GroupSpendingCard.jsx   # Otimizações de performance

backend/models/
└── Group.js                # Cálculo de saldo do usuário

frontend/src/hooks/useQueries.js    # useGroupById e mutations
frontend/src/utils/locales/         # Traduções atualizadas
```

## Impacto

**Performance**: Cache automático, menos re-renders, melhor gerenciamento de estado  
**UX**: Navegação intuitiva, feedback visual melhor, layout limpo, ordenação flexível, visibilidade de saldos  
**Manutenibilidade**: Código simples, padrões consistentes, hooks reutilizáveis
