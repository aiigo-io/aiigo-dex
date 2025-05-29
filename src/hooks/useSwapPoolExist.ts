import { fetchSwapQuote, getFee } from '@/lib/swap-helper';
import { useProtocol } from './useProtocol';
import useSWR from 'swr';
import { TokenInfo } from '@/types';
import { useTokens } from './useTokens'

export function useSwapPoolExist(tokenIn: TokenInfo, tokenOut: TokenInfo) {
  const { chainId, publicClient } = useProtocol();

  const tokens = useTokens();
  const wrappedToken = tokens.find(t => t.isWrapped);
  const isReady = tokenIn && tokenOut;

  const { data, isLoading, error } = useSWR(
    isReady ? ['swap-quote', tokenIn, tokenOut, chainId] : null,
    {
      fetcher: async () => {
        if (!tokenIn.isWrapped && tokenOut.isNative) return false;
        if (tokenIn.isWrapped !== tokenOut.isWrapped && tokenIn.isNative !== tokenOut.isNative) return true;
        if (tokenIn.isNative) {
          tokenIn = wrappedToken as TokenInfo;
        }
        const fee = await getFee(publicClient, tokenIn, tokenOut);
        return fee ? true : false;
      },
      refreshInterval: 10000,
    }
  )
  return { data, isLoading, error };
}