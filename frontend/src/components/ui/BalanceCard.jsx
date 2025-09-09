import React, { memo } from "react";
import Spinner from "./Spinner";
import { useTranslation } from "react-i18next";
import { useBalance } from "../../hooks/useQueries";

const BalanceCard = memo(function BalanceCard({ selectedRange }) {
    const { t } = useTranslation();
    const { data: balance = 0, isLoading: loading, error } = useBalance(selectedRange);

    if (loading) {
        return <Spinner message={t('balanceCard.loading')} size="md" center={false} />;
    }
    if (error) {
        return <p className="text-red-500">{error?.message || t('balanceCard.fetchError')}</p>;
    }

    return (
        <h2 className="text-4xl font-bold mb-4">${balance.toFixed(2)}</h2>
    );
});

export default BalanceCard;