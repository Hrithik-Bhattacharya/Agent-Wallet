import React from 'react';
import AgentControl from './components/AgentControl';
import AgentStatus from './components/AgentStatus';
import LogPanel from './components/LogPanel';
import ServicesPanel from './components/ServicesPanel';
import WalletPanel from './components/WalletPanel';
import InventoryPanel from './components/InventoryPanel';
import { useAgentOrchestrator } from './hooks/useAgentOrchestrator';
import { TitleIcon } from './components/icons';

const App: React.FC = () => {
    const {
        agentState,
        walletState,
        debt,
        ownedAssets,
        logEntries,
        availableServices,
        isAgentRunning,
        startAgent,
        stopAgent,
        setGoal,
    } = useAgentOrchestrator();

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <div className="flex items-center space-x-4">
                    <TitleIcon />
                    <h1 className="text-3xl font-bold text-cyan-400">Autonomous AI Agent Dashboard</h1>
                </div>
                <p className="mt-2 text-slate-400">
                    Simulating an AI agent's decision-making process for on-chain interactions.
                </p>
            </header>

            <main className="flex flex-col xl:flex-row gap-6">
                {/* Left Column */}
                <div className="flex flex-col gap-6 xl:w-1/4">
                    <AgentControl
                        isAgentRunning={isAgentRunning}
                        onStart={startAgent}
                        onStop={stopAgent}
                        onGoalChange={setGoal}
                        currentGoal={agentState.goal}
                    />
                    <WalletPanel balance={walletState.balance} transactions={walletState.transactions} debt={debt} />
                    <InventoryPanel assets={ownedAssets} />
                </div>

                {/* Middle Column */}
                <div className="flex flex-col gap-6 xl:w-2/4">
                    <AgentStatus
                        status={agentState.status}
                        goal={agentState.goal}
                        lastAction={agentState.lastAction}
                        lastReasoning={agentState.lastReasoning}
                    />
                    <LogPanel entries={logEntries} />
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6 xl:w-1/4">
                    <ServicesPanel services={availableServices} />
                </div>
            </main>
        </div>
    );
};

export default App;