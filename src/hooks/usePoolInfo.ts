import { useProtocol } from "./useProtocol";
import useSWR from 'swr';
import { TokenInfo } from "@/types";
import { getPoolAddress, getRecommendedTickRange } from "@/lib/pool-helper";

export function usePoolInfo(tokenA: TokenInfo, tokenB: TokenInfo, fee: number, tickRange = 15) {
  const { publicClient } = useProtocol();
  const [token0, token1] = tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
  const { data: poolAddress, isLoading } = useSWR(
    token0 && token1 && fee && publicClient ? [token0, token1, fee, publicClient] : null,
    {
      fetcher: async () => {
        const poolAddress = await getPoolAddress(publicClient, token0, token1, fee);
        return poolAddress;
      },
      refreshInterval: 60 * 1000,
    }
  );

  const { data: recommendedTickRange, isLoading: isRecommendedTickRangeLoading } = useSWR(
    poolAddress && fee && tickRange && publicClient ? [poolAddress, fee, tickRange, publicClient] : null,
    {
      fetcher: async () => {
        const recommendedTickRange = await getRecommendedTickRange(publicClient, poolAddress, fee, tickRange);
        return recommendedTickRange;
      },
      refreshInterval: 60 * 1000,
    }
  );

  const priceRatio = recommendedTickRange?.priceRatio || 1;
  const isToken0First = token0.address.toLowerCase() === tokenA.address.toLowerCase();
  const finalPriceRatio = isToken0First ? priceRatio : 1 / priceRatio;

  return {
    ...(recommendedTickRange || {}),
    poolAddress,
    priceRatio: finalPriceRatio,
    isLoading: isLoading || isRecommendedTickRangeLoading
  };
}