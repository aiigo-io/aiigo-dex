import { formatUnits } from "viem";
import { useProtocol } from "./useProtocol";
import { getTokenBalance } from "@/lib/token-helper";
import { TokenInfo } from "@/types";
import useSWR from "swr";

export function useTokenBalances (tokens: TokenInfo[]) {
  const { account, publicClient } = useProtocol();
  const isReady = tokens.length && account;
  const { data: tokenWithBalances, isLoading, mutate } = useSWR(
    isReady ? ['token-balances', account, tokens.map((t) => t.address)] : null,
    {
      fetcher: async () => {
        const balances = await Promise.all(tokens.map((token) => {
          return getTokenBalance(publicClient, token, account as `0x${string}`);
        }));
        return tokens.map((token, idx) => {
          const formattedBalance = formatUnits(balances[idx], token.decimals);
          return {
            ...token,
            balance: balances[idx],
            balanceFormatted: Number(formattedBalance).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          }
        })
        
      },
      refreshInterval: 1000 * 60 * 5,
    } 
  );
  return {
    data: tokenWithBalances || tokens,
    isLoading,
    refetch: mutate
  };
}