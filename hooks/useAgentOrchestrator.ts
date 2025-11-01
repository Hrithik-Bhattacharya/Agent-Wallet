import { useState, useCallback, useRef, useEffect } from 'react';
import type { AgentState, Wallet, Transaction, LogEntry, Service, AgentDecision, Asset, TransactionQuality } from '../types';
import { AgentStatusValue, LogType } from '../types';
import { getAgentDecision } from '../services/geminiService';

const INITIAL_GOAL = "Acquire 150 AGENT-COIN by trading data packets.";
const INITIAL_BALANCE = 100;
const AGENT_TICK_RATE_MS = 8000; // 8 seconds between decisions

const AVAILABLE_SERVICES: Service[] = [
    { id: '1', name: 'Basic Data API', description: 'Provides basic, free market data.', cost: 0 },
    { id: '2', name: 'Premium Data Feed', description: 'Real-time, in-depth market analytics. Grants one "Premium Data Packet".', cost: 75, producesAsset: { assetId: 'pdp', name: 'Premium Data Packet' } },
    { id: '3', name: 'Liquidity Pool Stake', description: 'Stake coins to earn a Staking Reward Voucher.', cost: 50, producesAsset: { assetId: 'srv', name: 'Staking Reward Voucher' } },
    { id: '4', name: 'Price Oracle', description: 'Get a trusted price for an asset.', cost: 5 },
    { id: '5', name: 'Sell Data Packet', description: 'Sell a "Premium Data Packet" on the open market.', cost: -85, requiresAssetId: 'pdp' },
    { id: '6', name: 'Take Loan (150)', description: 'Borrow 150 AGENT-COIN. Increases debt.', cost: -150 },
    { id: '7', name: 'Repay Loan (175)', description: 'Repay the entire loan with interest. Requires 175 AGENT-COIN.', cost: 175 },
];

export const useAgentOrchestrator = () => {
    const [agentState, setAgentState] = useState<AgentState>({
        status: AgentStatusValue.STOPPED,
        goal: INITIAL_GOAL,
        lastAction: null,
        lastReasoning: null,
    });

    const [walletState, setWalletState] = useState<Wallet>({
        balance: INITIAL_BALANCE,
        transactions: [],
    });
    
    const [debt, setDebt] = useState<number>(0);
    const [ownedAssets, setOwnedAssets] = useState<Asset[]>([]);
    const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
    const [isAgentRunning, setIsAgentRunning] = useState(false);
    const intervalRef = useRef<number | null>(null);

    const addLog = useCallback((type: LogType, message: string) => {
        setLogEntries(prev => [...prev, { id: crypto.randomUUID(), timestamp: Date.now(), type, message }]);
    }, []);

    const addTransaction = useCallback((description: string, amount: number, quality: TransactionQuality) => {
        const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            description,
            amount,
            quality,
        };

        setWalletState(prev => ({
            balance: prev.balance + amount,
            transactions: [...prev.transactions, newTransaction],
        }));

        const logMessage = `Transaction: ${description} | Amount: ${amount.toFixed(2)} AGENT-COIN | New Balance: ${(walletState.balance + amount).toFixed(2)}`;
        addLog(LogType.WALLET, logMessage);
    }, [addLog, walletState.balance]);

    const runAgentCycle = useCallback(async () => {
        if (agentState.status === AgentStatusValue.SUCCESS) {
            addLog(LogType.SYSTEM, "Agent has completed its goal. Stopping.");
            setIsAgentRunning(false);
            return;
        }

        setAgentState(prev => ({ ...prev, status: AgentStatusValue.THINKING }));
        addLog(LogType.INFO, 'Agent is thinking...');

        try {
            const decision: AgentDecision = await getAgentDecision(agentState.goal, walletState.balance, debt, AVAILABLE_SERVICES, ownedAssets);

            setAgentState(prev => ({
                ...prev,
                status: AgentStatusValue.EXECUTING,
                lastAction: decision.action,
                lastReasoning: decision.reason
            }));
            addLog(LogType.AGENT_THOUGHT, `"${decision.reason}"`);
            addLog(LogType.ACTION, `Executing action: ${decision.action}`);

            // Process decision
            if (decision.action.startsWith('USE_SERVICE_')) {
                const serviceId = decision.serviceId;
                const service = AVAILABLE_SERVICES.find(s => s.id === serviceId);

                if (service) {
                    // Pre-conditions
                    if (service.id === '6' && debt > 0) { // Take Loan
                        addLog(LogType.ERROR, `Failed to use ${service.name}: A loan is already outstanding.`);
                        return;
                    }
                     if (service.id === '7' && debt === 0) { // Repay Loan
                        addLog(LogType.ERROR, `Failed to use ${service.name}: No loan to repay.`);
                        return;
                    }

                    const assetToRemove = service.requiresAssetId ? ownedAssets.find(a => a.assetId === service.requiresAssetId) : undefined;
                    if (service.requiresAssetId && !assetToRemove) {
                        addLog(LogType.ERROR, `Failed to use ${service.name}: Required asset not found in inventory.`);
                        return;
                    }

                    if (walletState.balance >= service.cost) {
                        // Determine transaction quality
                        let quality: TransactionQuality = 'NEUTRAL';
                        if (service.cost < 0) quality = 'GOOD'; // Receiving money is good
                        if (service.id === '7') quality = 'GOOD'; // Repaying debt is good

                        addTransaction(`Payment for ${service.name}`, -service.cost, quality);
                        addLog(LogType.INFO, `Successfully used service: ${service.name}.`);

                        // Handle state changes AFTER successful transaction
                        if (service.id === '6') setDebt(-service.cost); // Take Loan
                        if (service.id === '7') setDebt(0); // Repay Loan

                        if (assetToRemove) {
                           setOwnedAssets(prev => prev.filter(a => a.id !== assetToRemove.id));
                           addLog(LogType.INFO, `Consumed asset: ${assetToRemove.name}.`);
                        }

                        if (service.producesAsset) {
                            const newAsset: Asset = {
                                id: crypto.randomUUID(),
                                assetId: service.producesAsset.assetId,
                                name: service.producesAsset.name,
                            };
                            setOwnedAssets(prev => [...prev, newAsset]);
                            addLog(LogType.INFO, `Acquired asset: ${newAsset.name}.`);
                        }
                    } else {
                        addLog(LogType.ERROR, `Insufficient funds to use ${service.name}. Cost: ${service.cost}, Balance: ${walletState.balance}.`);
                    }
                } else {
                    addLog(LogType.ERROR, `Attempted to use unknown service ID: ${serviceId}`);
                }
            } else if (decision.action === 'WAIT') {
                addLog(LogType.INFO, 'Agent chose to wait.');
            } else if (decision.action === 'FINISH') {
                setAgentState(prev => ({ ...prev, status: AgentStatusValue.SUCCESS }));
                addLog(LogType.SYSTEM, `Goal "${agentState.goal}" achieved!`);
            } else {
                addLog(LogType.ERROR, `Agent chose an unknown action: ${decision.action}`);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setAgentState(prev => ({ ...prev, status: AgentStatusValue.ERROR }));
            addLog(LogType.ERROR, `Agent cycle failed: ${errorMessage}`);
        } finally {
            setAgentState(prev => {
                if (
                    prev.status === AgentStatusValue.SUCCESS ||
                    prev.status === AgentStatusValue.STOPPED ||
                    prev.status === AgentStatusValue.ERROR
                ) {
                    return prev;
                }
                return { ...prev, status: AgentStatusValue.IDLE };
            });
        }
    }, [agentState.goal, agentState.status, walletState.balance, addLog, addTransaction, ownedAssets, debt]);

    const startAgent = useCallback(() => {
        if (isAgentRunning) return;
        addLog(LogType.SYSTEM, 'Agent started.');
        setIsAgentRunning(true);
        setAgentState(prev => ({ ...prev, status: AgentStatusValue.IDLE }));
        runAgentCycle(); // Run immediately, then start interval
    }, [isAgentRunning, addLog, runAgentCycle]);

    const stopAgent = useCallback(() => {
        if (!isAgentRunning) return;
        addLog(LogType.SYSTEM, 'Agent stopped.');
        setIsAgentRunning(false);
        setAgentState(prev => ({ ...prev, status: AgentStatusValue.STOPPED }));
    }, [isAgentRunning, addLog]);
    
    useEffect(() => {
        if (isAgentRunning) {
            intervalRef.current = window.setInterval(runAgentCycle, AGENT_TICK_RATE_MS);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isAgentRunning, runAgentCycle]);
    
    const setGoal = (newGoal: string) => {
        setAgentState(prev => ({ ...prev, goal: newGoal }));
        addLog(LogType.SYSTEM, `Agent goal updated: "${newGoal}"`);
    };

    return {
        agentState,
        walletState,
        debt,
        ownedAssets,
        logEntries,
        availableServices: AVAILABLE_SERVICES,
        isAgentRunning,
        startAgent,
        stopAgent,
        setGoal
    };
};