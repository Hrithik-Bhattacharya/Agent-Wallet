import { GoogleGenAI, Type } from "@google/genai";
import type { Service, AgentDecision, Asset } from "../types";

const makePrompt = (goal: string, balance: number, debt: number, services: Service[], ownedAssets: Asset[]): string => {
    const serviceDescriptions = services.map(s => 
        `- ${s.name} (ID: ${s.id}): Costs ${s.cost} AGENT-COIN. Description: ${s.description}`
    ).join('\n');

    const serviceActions = services.map(s => `"USE_SERVICE_${s.id}"`).join(' | ');

    const assetList = ownedAssets.length > 0
        ? ownedAssets.map(a => `- ${a.name} (Type ID: ${a.assetId})`).join('\n')
        : 'None';

    return `You are an autonomous AI agent managing a crypto wallet. Your mission is to make smart decisions to achieve your goal.

    **Current Goal:** "${goal}"
    **Current Wallet Balance:** ${balance.toFixed(2)} AGENT-COIN
    **Current Debt:** ${debt.toFixed(2)} AGENT-COIN

    **Owned Assets:**
    ${assetList}

    **Available Services (Smart Contracts):**
    ${serviceDescriptions}
    Note: You can take out a loan for a quick cash injection, but you must repay it with interest, which costs more in the long run. Only take a loan if it's strategically necessary. Some services may require you to own a specific asset.

    **Possible Actions:**
    - ${serviceActions}: Use one of the available services.
    - "WAIT": Do nothing and wait for the next cycle. This is a good choice if no service helps with the current goal or if you are saving funds.
    - "FINISH": The goal has been successfully achieved.

    Based on your goal, resources, and owned assets, what is your next action?
    You must choose an action and provide a brief reason for your choice.
    Your response MUST be a valid JSON object following this exact schema. Do not include markdown formatting.
    `;
};


export const getAgentDecision = async (
    goal: string,
    balance: number,
    debt: number,
    services: Service[],
    ownedAssets: Asset[]
): Promise<AgentDecision> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        // Return a default action for UI development without a key
        return {
            action: 'WAIT',
            reason: 'API Key not configured. Falling back to default action.',
        };
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = makePrompt(goal, balance, debt, services, ownedAssets);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        action: { type: Type.STRING, description: "The chosen action ID." },
                        reason: { type: Type.STRING, description: "A brief justification for the action." }
                    },
                    required: ["action", "reason"],
                },
                temperature: 0.7,
            },
        });

        const jsonText = response.text;
        const decision = JSON.parse(jsonText);

        // Extract service ID from action
        if (decision.action.startsWith('USE_SERVICE_')) {
            decision.serviceId = decision.action.replace('USE_SERVICE_', '');
        }

        return decision;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get a decision from the AI agent.");
    }
};