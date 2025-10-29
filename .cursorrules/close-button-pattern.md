# Close Button (X) Pattern

## SEMPRE use o componente CloseButton

Quando o usuário pedir para adicionar um botão "X", botão de fechar, ou close button:

### ✅ CORRETO:
```jsx
import CloseButton from '@/components/ui/CloseButton';
// ou
import { CloseButton } from '@/components/ui';

<CloseButton onClick={() => setIsOpen(false)} />

// Com tamanho customizado
<CloseButton onClick={() => setIsOpen(false)} size="lg" />

// Com classes adicionais (para posicionamento, por exemplo)
<CloseButton 
  onClick={() => setIsOpen(false)} 
  className="absolute top-4 right-4" 
/>
```

### ❌ INCORRETO:
```jsx
// NÃO criar botões X manualmente
<button onClick={() => setIsOpen(false)}>
  <X className="w-6 h-6" />
</button>

// NÃO adicionar estilos de background, border, etc.
<button className="bg-gray-500 border rounded-full">
  <X />
</button>
```

## Especificações do CloseButton

O componente `CloseButton` já vem com:
- ✅ Fundo transparente (sem background-color)
- ✅ Sem borda (border: none)
- ✅ Ícone cinza que fica branco no hover
- ✅ Transições suaves
- ✅ Acessibilidade (aria-label, title)

## Quando usar cada tamanho:
- `size="sm"` - Para espaços pequenos ou elementos compactos
- `size="md"` - **Padrão** - Para a maioria dos casos
- `size="lg"` - Para modais grandes ou quando precisa de mais destaque

## Lembre-se:
O usuário **NÃO quer**:
- Fundos brancos ou coloridos no botão
- Bordas ao redor do X
- Quadrados ou círculos visíveis
- Apenas o **X simples, cinza, sem fundo**

