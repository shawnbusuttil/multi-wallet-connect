import { useQuery } from "@tanstack/react-query";

import { fetchTokens } from "@/api/fetchTokens";
import { Token } from "@/types/token";

export const useTokenList = (chainId: number): {
    tokenList: Token[] | undefined,
    isTokenListError: boolean,
    isTokenListLoading: boolean,
    tokenListError: Error | null
 } => {
    const { data: tokenList, isError: isTokenListError, error: tokenListError, isLoading: isTokenListLoading } = useQuery<Token[]>({
        queryKey: [`token-list`, chainId],
        queryFn: () => fetchTokens(chainId!),
        enabled: !!chainId,
        // we set a long stale time for this as tokens aren't updated so frequently
        staleTime: 300000,
        retry: 3
    });

    return { tokenList, isTokenListError, tokenListError, isTokenListLoading };
}