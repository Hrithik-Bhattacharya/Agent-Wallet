
import React from 'react';
import type { AgentState } from '../types';
import { AgentStatusValue } from '../types';
import { BrainIcon, GoalIcon, SparklesIcon, StatusIcon } from './icons';

interface AgentStatusProps extends AgentState {}

const StatusIndicator: React.FC<{ status: AgentStatusValue }> = ({ status }) => {
    const statusConfig = {
        [AgentStatusValue.IDLE]: { color: 'bg-blue-500', text: 'Idle' },
        [AgentStatusValue.THINKING]: { color: 'bg-yellow-500 animate-pulse', text: 'Thinking' },
        [AgentStatusValue.EXECUTING]: { color: 'bg-purple-500', text: 'Executing' },
        [AgentStatusValue.SUCCESS]: { color: 'bg-green-500', text: 'Goal Achieved' },
        [AgentStatusValue.ERROR]: { color: 'bg-red-500', text: 'Error' },
        [AgentStatusValue.STOPPED]: { color: 'bg-gray-500', text: 'Stopped' },
    };
    const { color, text } = statusConfig[status];

    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <span className="font-semibold text-lg">{text}</span>
        </div>
    );
};

const AgentStatus: React.FC<AgentStatusProps> = ({ status, goal, lastAction, lastReasoning }) => {
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700 h-full">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Agent Status</h2>
            <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg">
                    <StatusIcon />
                    <div>
                        <p className="text-sm text-slate-400">Current Status</p>
                        <StatusIndicator status={status} />
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
                   <GoalIcon className="mt-1 flex-shrink-0"/>
                    <div>
                        <p className="text-sm text-slate-400">Current Goal</p>
                        <p className="font-medium text-slate-100">{goal}</p>
                    </div>
                </div>

                {lastAction && (
                    <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
                       <SparklesIcon className="mt-1 flex-shrink-0"/>
                        <div>
                            <p className="text-sm text-slate-400">Last Action</p>
                            <p className="font-mono text-cyan-300 bg-slate-800 px-2 py-1 rounded text-sm">{lastAction}</p>
                        </div>
                    </div>
                )}
                
                {lastReasoning && (
                     <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
                        <BrainIcon className="mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-slate-400">Agent's Reasoning</p>
                            <p className="italic text-slate-300">"{lastReasoning}"</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentStatus;
