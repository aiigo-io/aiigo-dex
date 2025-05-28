import { useProtocol } from "./useProtocol";
import useSWR from "swr";
import { UNISWAP_V3_CONTRACTS } from "@/config";
import NftPositionManagerABI from "@/config/abi/NftPositionManager.json"
import { MAX_UINT128 } from "@/config/constants";

export function useUnclaimedFee (tokenId: bigint) {
  const { chainId, account, publicClient } = useProtocol();
  const isReady = chainId && account && tokenId;
  const { data: fee, isLoading, mutate } = useSWR(
    isReady ? ['unclaimed-fee', chainId, account, tokenId] : null,
    {
      fetcher: async () => {
        try {
          const res = await publicClient?.simulateContract({
            address: UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`,
            abi: NftPositionManagerABI,
            functionName: 'collect',
            account,
            args: [{ tokenId, recipient: account, amount0Max: MAX_UINT128, amount1Max: MAX_UINT128 }]
          })
          return res?.result;
        } catch (e) {
          return [0n, 0n];
        }
      },
      refreshInterval: 1000 * 5 * 60,
    }
  )
  return {
    data: fee || [0n, 0n],
    isLoading,
    refetch: mutate
  }
}