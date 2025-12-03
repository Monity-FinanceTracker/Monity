import React from 'react';
import { Eye } from 'lucide-react';

/**
 * DemoBadge Component
 * Displays a prominent badge when user is in demo/view-only mode
 */
const DemoBadge = ({ className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#56a69f]/20 to-[#4A8F88]/20 border border-[#56a69f]/30 rounded-full ${className}`}>
      <Eye className="w-4 h-4 text-[#56a69f]" />
      <span className="text-sm font-medium text-[#56a69f]">
        Modo Demonstração
      </span>
    </div>
  );
};

export default DemoBadge;
