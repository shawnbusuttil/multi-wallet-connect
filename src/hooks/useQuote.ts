import { QueryObserverResult, RefetchOptions, useQuery } from "@tanstack/react-query";
import { fetchQuote } from "@/api/fetchQuote";
import { QuoteParams } from "@/types/quoteParams";

export const useQuote = (from: QuoteParams, to: QuoteParams, amount: number): {
    quoteData: any[] | undefined,
    isQuoteDataError: boolean,
    isQuoteDataLoading: boolean,
    error: Error,
    refetchQuote: (options?: RefetchOptions) => Promise<QueryObserverResult<any[], Error>>
 } => {
    const { data: quoteData, isError: isQuoteDataError, isLoading: isQuoteDataLoading, error, refetch: refetchQuote } = useQuery<any[]>({
        queryKey: [`quote`, from, to],
        queryFn: () => fetchQuote(from, to, amount),
        enabled: !!from && !!to && amount > 0,
        retry: 3,
        gcTime: 0
    });

    return { quoteData, isQuoteDataError, error, isQuoteDataLoading, refetchQuote };
}