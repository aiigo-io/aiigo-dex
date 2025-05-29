import { atom, useAtom } from 'jotai';
import { DEFAULT_CHAIN_ID } from '@/config/chains';
import { useAccount, useWalletClient, usePublicClient, useChainId, useSwitchChain } from 'wagmi';


export function useProtocol() {
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain()
  const { address: account, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return {
    isConnected: !!account,
    unSupportedChain: !chain,
    account,
    chainId,
    chains, switchChain,
    walletClient,
    publicClient,
  };
}
