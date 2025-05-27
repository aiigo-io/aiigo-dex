import { fetchSwapQuote, getFee } from '@/lib/swap-helper';
import { useProtocol } from './useProtocol';
import useSWR from 'swr';
import { TokenInfo } from '@/types';

export function useSwapQuote(tokenIn: TokenInfo, tokenOut: TokenInfo, amountIn: bigint) {
  const { publicClient } = useProtocol();

  const isReady = tokenIn && tokenOut && amountIn;

  const { data, isLoading, error } = useSWR(
    isReady ? ['swap-quote', tokenIn, tokenOut, amountIn] : null,
    {
      fetcher: async () => {
        if (tokenIn.isNative || tokenOut.isNative) {
          return {
            amountOut: amountIn,
            gas: 0n
          };
        }
        const fee = await getFee(publicClient, tokenIn, tokenOut);
        if (!fee) return null;
        return await fetchSwapQuote(publicClient, tokenIn, tokenOut, amountIn, fee);
      },
      refreshInterval: 10000,
    }
  )
  return { data, isLoading, error };
}