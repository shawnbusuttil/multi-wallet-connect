import { Token } from "@/types/token";
import axios from "axios";

const BASE_URL = "https://li.quest/v1/tokens";

export const fetchTokens = async (chainId: number): Promise<Token[]> => {
    try {
        const result = await axios.get(BASE_URL, { 
            params: {
                chains: chainId
            }
        });
        return result.data.tokens[`${chainId}`];
    } catch (e: any) {
        if (e.status === 400) {
            throw new Error("Network not supported.");
        }
        throw new Error("Network error.");
    }
}
