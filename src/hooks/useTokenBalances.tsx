import { useQuery } from "@tanstack/react-query";

import { fetchBalances } from "@/api/fetchBalances";
import { TokenBalance } from "@/types/balance";

export const useTokenBalances = (address: string, chainId: number): {
    balanceData: TokenBalance[] | undefined,
    isTokenBalanceError: boolean,
    isTokenBalanceLoading: boolean
 } => {
    const { data: balanceData, isError: isTokenBalanceError, isLoading: isTokenBalanceLoading } = useQuery<TokenBalance[]>({
        queryKey: [`token-balances`, chainId],
        queryFn: () => fetchBalances(address!, chainId!),
        enabled: !!address && !!chainId,
        retry: 3
    });

    return { balanceData, isTokenBalanceError, isTokenBalanceLoading };
}