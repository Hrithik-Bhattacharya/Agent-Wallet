
import React, { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';
import { LogType } from '../types';
import { ActionIcon, BrainIcon, ErrorIcon, InfoIcon, SystemIcon, WalletIcon } from './icons';

interface LogPanelProps {
    entries: LogEntry[];
}

const LogIcon: React.FC<{ type: LogType }> = ({ type }) => {
    switch (type) {
        case LogType.AGENT_THOUGHT: return <BrainIcon className="h-5 w-5 text-purple-400" />;
        case LogType.ACTION: return <ActionIcon className="h-5 w-5 text-cyan-400" />;
        case LogType.WALLET: return <WalletIcon className="h-5 w-5 text-green-400" />;
        case LogType.ERROR: return <ErrorIcon className="h-5 w-5 text-red-400" />;
        case LogType.SYSTEM: return <SystemIcon className="h-5 w-5 text-yellow-400" />;
        case LogType.INFO:
        default: return <InfoIcon className="h-5 w-5 text-blue-400" />;
    }
};

const LogPanel: React.FC<LogPanelProps> = ({ entries }) => {
    const endOfLogsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [entries]);

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700 h-96 flex flex-col">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 flex-shrink-0">Activity Log</h2>
            <div className="overflow-y-auto flex-grow pr-2">
                <div className="space-y-3">
                    {entries.map((entry) => (
                        <div key={entry.id} className="flex items-start gap-3 text-sm">
                            <div className="mt-1 flex-shrink-0"><LogIcon type={entry.type} /></div>
                            <div className="flex-grow">
                                <p className="font-mono text-slate-400 text-xs">
                                    {new Date(entry.timestamp).toLocaleTimeString()}
                                </p>
                                <p className="text-slate-200">{entry.message}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={endOfLogsRef} />
                </div>
            </div>
        </div>
    );
};

export default LogPanel;
