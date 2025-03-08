import axios from "axios";

const BASE_URL = "https://li.quest/v1/quote";

export const fetchQuote = async (from: any, to: any, amount: number): Promise<any[] | undefined> => {
    try {
        const result = await axios.get(BASE_URL, { 
            params: {
                fromChain: from.chain,
                toChain: to.chain,
                fromToken: from.token,
                toToken: to.token,
                fromAddress: from.address,
                toAddress: to.address,
                fromAmount: amount
            }
        });

        // console.log(result.data.result);

        return result.data.result;
    } catch (e: any) {
        if (e.status === 400) {
            throw new Error("Quote not found.");
        }
        throw new Error("Failed to get quote.");
    }
}