
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCreateGroup } from '../../hooks/useQueries';

const CreateGroup = () => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const createGroupMutation = useCreateGroup();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await createGroupMutation.mutateAsync({ name });
            navigate('/groups');
        } catch (err) {
            setError(t('groups.create_fail'));
            console.error(err);
        }
    };

    return (
        <div className="flex-1 p-6">
            {/* Back Button - Fixed position */}
            <button
                onClick={() => navigate('/groups')}
                className="fixed top-4 left-4 z-10 flex items-center justify-center w-10 h-10 rounded-lg bg-[#1F1E1D] border border-[#262626] hover:border-[#56a69f] transition-colors group"
                title={t('groups.back')}
            >
                <svg 
                    className="w-5 h-5 text-[#C2C0B6] group-hover:text-[#56a69f] transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8 text-center">{t('groups.create_title')}</h1>
                
                <div className="bg-[#1F1E1D] rounded-lg border border-[#262626] p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-white font-medium mb-2">
                                {t('groups.group_name')}
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-[#1F1E1D] border border-[#262626] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#56a69f] focus:border-transparent"
                                placeholder={t('groups.group_name')}
                                required
                            />
                        </div>
                        
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}
                        
                        <button
                            type="submit"
                            className="w-full bg-[#56a69f] text-[#1F1E1D] font-bold px-4 py-3 rounded-lg hover:bg-[#4A8F88] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={createGroupMutation.isPending}
                        >
                            {createGroupMutation.isPending ? t('groups.creating') : t('groups.create')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateGroup; 