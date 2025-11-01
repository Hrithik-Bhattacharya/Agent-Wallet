export interface Transaction {
    id: string;
    timestamp: number;
    description: string;
    amount: number; // positive for credit, negative for debit
    quality: TransactionQuality;
}

export type TransactionQuality = 'GOOD' | 'NEUTRAL' | 'BAD';

export interface Wallet {
    balance: number;
    transactions: Transaction[];
}

export enum AgentStatusValue {
    IDLE = 'IDLE',
    THINKING = 'THINKING',
    EXECUTING = 'EXECUTING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    STOPPED = 'STOPPED',
}

export interface AgentState {
    status: AgentStatusValue;
    goal: string;
    lastAction: string | null;
    lastReasoning: string | null;
}

export interface Asset {
    id: string; // Unique instance ID
    assetId: string; // Type of asset, e.g., 'pdp'
    name: string;
}

export interface Service {
    id: string;
    name: string;
    description: string;
    cost: number; // Can be negative for "sell" actions
    producesAsset?: { assetId: string, name: string };
    requiresAssetId?: string;
}

export enum LogType {
    INFO = 'INFO',
    AGENT_THOUGHT = 'AGENT_THOUGHT',
    ACTION = 'ACTION',
    WALLET = 'WALLET',
    ERROR = 'ERROR',
    SYSTEM = 'SYSTEM',
}

export interface LogEntry {
    id: string;
    timestamp: number;
    type: LogType;
    message: string;
}

export interface AgentDecision {
    action: string;
    reason: string;
    serviceId?: string;
}