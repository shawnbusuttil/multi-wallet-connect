import axios from "axios";

import { ALCHEMY_CHAINS, SOLANA_CHAIN_ID } from "@/config";
import { Account } from "@/types/api";
import { TokenBalance } from "@/types/balance";

const ALCHEMY_GET_TOKENS_METHOD = "alchemy_getTokenBalances";
const SOLANA_GET_TOKENS_METHOD = "getTokenAccountsByOwner";

const SOLANA_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

const getUrl = (chainId = 1) => {
    if (chainId === SOLANA_CHAIN_ID) {
        return `https://mainnet.helius-rpc.com/?api-key=${import.meta.env.VITE_HELIUS_API_KEY}`;
    }
    const chainName = ALCHEMY_CHAINS[chainId as keyof typeof ALCHEMY_CHAINS];

    if (!chainName) return undefined;

    return `https://${chainName}.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
}

const fetchEVMBalances = async (url: string, address: string): Promise<TokenBalance[] | undefined> => {
    try {
        const result = await axios.post(url, { 
            jsonrpc: "2.0",
            method: ALCHEMY_GET_TOKENS_METHOD,
            params: [address, "erc20"],
            id: 1
        });

        return result.data.result.tokenBalances as TokenBalance[];
    } catch (e: any) {
        if (e.status === 400) {
            throw new Error("Network not supported.");
        }
        throw new Error("Failed to get tokens.");
    }
}

const fetchSolanaBalances = async (url: string, address: string): Promise<TokenBalance[] | undefined> => {
    try {
        const result = await axios.post(url, { 
            jsonrpc: "2.0",
            id: 1,
            method: SOLANA_GET_TOKENS_METHOD,
            params: [
                address,
                {
                    programId: SOLANA_PROGRAM_ID
                },
                {
                    encoding: "jsonParsed"
                }
            ]
        });
    
        const tokenAccounts: Account[] = result.data.result.value;
    
        const tokens = tokenAccounts
            .filter((account: Account) => {
                const amount = account.account.data.parsed.info.tokenAmount.uiAmount;
                const decimals = account.account.data.parsed.info.tokenAmount.decimals;
    
                return decimals > 0 && amount > 0;
            })
            .map((account: Account) => {
                const amount = account.account.data.parsed.info.tokenAmount.uiAmount;
                const mint = account.account.data.parsed.info.mint;
    
            return {
                contractAddress: mint,
                tokenBalance: amount.toString()
            };
        });
    
        return tokens;
    } catch (e: any) {
        if (e.status === 400) {
            throw new Error("Network not supported.");
        }
        throw new Error(e);
    }
}

export const fetchBalances = async (address: string, chainId: number): Promise<TokenBalance[]> => {
    const url = getUrl(chainId);

    if (!url) return [];

    if (chainId === SOLANA_CHAIN_ID) {
        return await fetchSolanaBalances(url, address) ?? [];
    } else {
        return await fetchEVMBalances(url, address) ?? [];
    }
}
