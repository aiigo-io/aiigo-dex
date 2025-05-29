import { formatUnits } from "viem";
import { useProtocol } from "./useProtocol";
import { getAllowance } from "@/lib/token-helper";
import { TokenInfo } from "@/types";
import useSWR from "swr";

export function useTokenAllowances (token: TokenInfo, spender: `0x${string}`) {
  const { chainId, account, publicClient } = useProtocol();
  const isReady = token && account;
  const { data: tokenAllowance, isLoading, mutate } = useSWR(
    isReady ? ['token-balances', account, token.address, chainId] : null,
    {
      fetcher: async () => {
        return await getAllowance(publicClient, token, account as `0x${string}`, spender);
      },
      refreshInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
    } 
  );
  return {
    data: tokenAllowance,
    isLoading,
    refetch: mutate
  };
}