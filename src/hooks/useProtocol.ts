import { atom, useAtom } from 'jotai';
import { DEFAULT_CHAIN_ID } from '@/config/chains';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';

const chainIdAtom = atom(DEFAULT_CHAIN_ID);

export function useProtocol() {
  const [chainId, setChainId] = useAtom(chainIdAtom);
  const { address: account } = useAccount();
  const { data: walletClient } = useWalletClient({chainId});
  const publicClient = usePublicClient({chainId});

  return {
    account,
    chainId, setChainId,
    walletClient,
    publicClient,
  };
}
