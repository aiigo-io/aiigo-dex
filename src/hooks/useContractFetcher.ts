import { useAccount } from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useProtocol } from "./useProtocol";
import { toast } from "sonner";


export function useContractFetcher() {
  const { account } = useProtocol();
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  return {
    hash,
    error,
    isPending,
  }
}