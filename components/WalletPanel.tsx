import React from 'react';
import type { Transaction } from '../types';
import { DownloadIcon, WalletIcon } from './icons';

interface WalletPanelProps {
    balance: number;
    transactions: Transaction[];
    debt: number;
}

const TransactionQualityIndicator: React.FC<{ quality: Transaction['quality'] }> = ({ quality }) => {
    const qualityConfig = {
        GOOD: { color: 'bg-green-500', title: 'Good Transaction' },
        NEUTRAL: { color: 'bg-yellow-500', title: 'Neutral Transaction' },
        BAD: { color: 'bg-red-500', title: 'Bad Transaction' },
    };
    const { color, title } = qualityConfig[quality];
    return <div className={`w-3 h-3 rounded-full ${color}`} title={title}></div>;
};


const WalletPanel: React.FC<WalletPanelProps> = ({ balance, transactions, debt }) => {
    const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

    const handleDownload = () => {
        if (sortedTransactions.length === 0) return;

        const headers = ['ID', 'Timestamp', 'Description', 'Amount', 'Quality'];
        const csvRows = sortedTransactions.map(tx => {
            const description = tx.description.includes(',') ? `"${tx.description}"` : tx.description;
            const timestamp = new Date(tx.timestamp).toISOString();
            return [tx.id, timestamp, description, tx.amount.toFixed(2), tx.quality].join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'transaction-history.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
                <WalletIcon className="h-8 w-8 text-green-400" />
                <h2 className="text-xl font-bold text-green-400">Agent Wallet</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
                 <div>
                    <p className="text-sm text-slate-400">Current Balance</p>
                    <p className="text-4xl font-bold text-white">
                        {balance.toFixed(2)}
                        <span className="text-xl text-slate-400 ml-2">AGENT-COIN</span>
                    </p>
                </div>
                 <div>
                    <p className="text-sm text-slate-400">Current Debt</p>
                    <p className={`text-4xl font-bold ${debt > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                        {debt.toFixed(2)}
                        <span className={`text-xl ${debt > 0 ? 'text-slate-400' : 'text-slate-500'} ml-2`}>AGENT-COIN</span>
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-slate-300">Transaction History</h3>
                <button
                    onClick={handleDownload}
                    disabled={sortedTransactions.length === 0}
                    className="text-slate-400 hover:text-cyan-400 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                    title="Download Transaction History (CSV)"
                >
                    <DownloadIcon className="h-5 w-5" />
                </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                {sortedTransactions.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No transactions yet.</p>
                ) : (
                    sortedTransactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                                <TransactionQualityIndicator quality={tx.quality} />
                                <div>
                                    <p className="font-medium text-slate-200">{tx.description}</p>
                                    <p className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                            <span className={`font-semibold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WalletPanel;