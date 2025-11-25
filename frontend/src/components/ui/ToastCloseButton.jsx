import React from 'react';
import { X } from 'lucide-react';

/**
 * Custom close button for react-toastify
 * This component properly handles the closeToast function from react-toastify
 * 
 * @param {Function} closeToast - Function provided by react-toastify to close the toast
 */
const ToastCloseButton = ({ closeToast }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (closeToast && typeof closeToast === 'function') {
      closeToast();
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      aria-label="Fechar"
      style={{
        background: 'transparent',
        border: 'none',
        outline: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1.5rem',
        height: '1.5rem',
        flexShrink: 0
      }}
      className="toast-close-button"
    >
      <X className="w-4 h-4 text-[#C2C0B6] hover:text-white transition-colors" />
    </button>
  );
};

export default ToastCloseButton;

