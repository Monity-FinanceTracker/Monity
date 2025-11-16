import React, { memo, useMemo } from "react";
import Spinner from "./Spinner";
import { useTranslation } from "react-i18next";
import { useBalance } from "../../hooks/useQueries";

const BalanceCard = memo(function BalanceCard({ selectedRange }) {
    const { t } = useTranslation();
    const { data: balance = 0, isLoading: loading, error } = useBalance(selectedRange);

    // Calcula o tamanho da fonte baseado no comprimento do texto
    const fontSize = useMemo(() => {
        const formattedBalance = balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const totalLength = formattedBalance.length + 3; // +3 para "R$ "
        
        // Escala o tamanho da fonte baseado no comprimento (aumentado)
        if (totalLength <= 10) return 'text-6xl'; // Números pequenos
        if (totalLength <= 15) return 'text-5xl'; // Números médios
        if (totalLength <= 20) return 'text-4xl'; // Números grandes
        if (totalLength <= 25) return 'text-3xl';  // Números muito grandes
        return 'text-2xl'; // Números extremamente grandes
    }, [balance]);

    if (loading) {
        return <Spinner message={t('balanceCard.loading')} size="md" center={false} />;
    }
    if (error) {
        return <p className="text-red-500">{error?.message || t('balanceCard.fetchError')}</p>;
    }

    return (
        <h2 className={`${fontSize} font-bold text-white whitespace-nowrap overflow-hidden text-left`}>
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
    );
});

export default BalanceCard;