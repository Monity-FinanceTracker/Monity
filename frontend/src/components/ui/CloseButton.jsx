import { X } from 'lucide-react';

/**
 * Botão de fechar padrão do Monity
 * Sempre use este componente para botões de fechar (X)
 * 
 * @param {Function} onClick - Função chamada ao clicar
 * @param {string} className - Classes CSS adicionais (opcional)
 * @param {string} size - Tamanho do ícone: 'sm', 'md', 'lg' (padrão: 'md')
 */
export default function CloseButton({ onClick, className = '', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center transition-colors ${className}`}
      style={{ 
        background: 'transparent', 
        border: 'none', 
        outline: 'none', 
        padding: 0 
      }}
      title="Fechar"
      aria-label="Fechar"
    >
      <X className={`${sizeClasses[size]} text-gray-400 hover:text-white`} />
    </button>
  );
}

