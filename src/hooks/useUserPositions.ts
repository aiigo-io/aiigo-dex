import { formatUnits } from "viem";
import { useProtocol } from "./useProtocol";
import useSWR from "swr";
import { getPositions } from "@/lib/pool-helper";
import { TokenInfo } from "@/types";
import { useTokens } from "./useTokens";

export function useUserPositions () {
  const { chainId, account, publicClient } = useProtocol();
  const tokens = useTokens();
  const tokenInfoMaps = tokens.reduce((acc, token) => {
    acc[token.address.toLowerCase()] = token;
    return acc;
  }, {} as Record<string, TokenInfo>);
  const isReady = account;
  const { data: positions, isLoading, mutate } = useSWR(
    isReady ? ['token-balances', chainId, account] : null,
    {
      fetcher: async () => {
        const positions = await getPositions(publicClient, account as `0x${string}`);
        return positions;
      },
      refreshInterval: 1000 * 60 * 5,
    } 
  );
  const positionInfos = positions?.map((position: any) => {
    return {
      ...position,
      token0Info: tokenInfoMaps[position.token0.toLowerCase()],
      token1Info: tokenInfoMaps[position.token1.toLowerCase()],
    }
  }).sort((a: any, b: any) => {
    return Number(b.nftId) - Number(a.nftId);
  });
  return {
    data: positionInfos || [],
    isLoading,
    refetch: mutate
  };
}