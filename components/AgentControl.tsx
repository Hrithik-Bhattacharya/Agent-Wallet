
import React, { useState } from 'react';
import { PlayIcon, StopIcon, GoalIcon } from './icons';

interface AgentControlProps {
    isAgentRunning: boolean;
    onStart: () => void;
    onStop: () => void;
    onGoalChange: (goal: string) => void;
    currentGoal: string;
}

const AgentControl: React.FC<AgentControlProps> = ({ isAgentRunning, onStart, onStop, onGoalChange, currentGoal }) => {
    const [goalInput, setGoalInput] = useState(currentGoal);

    const handleGoalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (goalInput.trim()) {
            onGoalChange(goalInput.trim());
        }
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Agent Control</h2>
            
            <form onSubmit={handleGoalSubmit} className="space-y-4 mb-6">
                <label htmlFor="goal" className="block text-sm font-medium text-slate-300">
                    Agent's Goal
                </label>
                <div className="relative">
                    <GoalIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <textarea
                        id="goal"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all resize-none"
                        rows={3}
                        placeholder="Set a goal for the agent..."
                        disabled={isAgentRunning}
                    />
                </div>
                 <button 
                    type="submit"
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isAgentRunning || goalInput === currentGoal}
                >
                    Update Goal
                </button>
            </form>

            <div className="flex space-x-4">
                <button
                    onClick={onStart}
                    disabled={isAgentRunning}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PlayIcon />
                    <span>Start</span>
                </button>
                <button
                    onClick={onStop}
                    disabled={!isAgentRunning}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <StopIcon />
                    <span>Stop</span>
                </button>
            </div>
        </div>
    );
};

export default AgentControl;
