import { useProtocol } from "./useProtocol";
import { TokenInfo } from "@/types";
import useSWR from "swr";

export function useTokenBalances (tokens: TokenInfo[]) {
  const { account } = useProtocol();
  const isReady = tokens.length && account;
  const { data: tokenWithBalances } = useSWR(
    isReady ? ['token-balances', account, tokens.map((t) => t.address)] : null,
    {
      fetcher: async () => {
        const balances = await Promise.all(tokens.map((token) => {
          // return getTokenBalance(token.address);
          return {
            ...token,
            balance: 0,
          };
        }));
        return balances;
      },
      refreshInterval: 1000 * 60 * 5,
    } 
  );
}