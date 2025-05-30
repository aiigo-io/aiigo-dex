import { fetchSwapQuote, getFee, getFees } from '@/lib/swap-helper';
import { useProtocol } from './useProtocol';
import useSWR from 'swr';
import { TokenInfo } from '@/types';

export function useSwapQuote(tokenIn: TokenInfo, tokenOut: TokenInfo, amountIn: bigint) {
  const { chainId, publicClient } = useProtocol();

  const isReady = tokenIn && tokenOut && amountIn;

  const { data, isLoading, error } = useSWR(
    isReady ? ['swap-quote', tokenIn, tokenOut, amountIn, chainId] : null,
    {
      fetcher: async () => {
        if (tokenIn.isNative !== tokenOut.isNative && tokenIn.isWrapped !== tokenOut.isWrapped) {
          return {
            amountOut: amountIn,
            gas: 0n
          };
        }
        const fees = await getFees(publicClient, tokenIn, tokenOut);
        const result = await Promise.allSettled(fees.map(async (fee) => {
          return fetchSwapQuote(publicClient, tokenIn, tokenOut, amountIn, fee);
        }));
        const successQuotes = result.filter(item => item.status === 'fulfilled');
        if (successQuotes.length === 0) return null;
        const bestQuote = successQuotes.sort((a, b) => {
          return Number(b.value.amountOut) - Number(a.value.amountOut);
        })[0];
        console.log(`${tokenIn.symbol}_${tokenOut.symbol}`, bestQuote.value)
        return bestQuote.value;
      },
      refreshInterval: 10000,
    }
  )
  return { data, isLoading, error };
}