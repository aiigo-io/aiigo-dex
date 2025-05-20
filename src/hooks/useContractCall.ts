import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from "sonner";
import { useState } from 'react';

export function useContractCall() {
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });
  
  if (isLoading) {
    toast.dismiss();
    toast.loading('Processing...');
  }
  if (isSuccess) {
    toast.dismiss();
    toast.success('Transaction successful', {
      duration: 3000
    });
  }
  if (error) {
    toast.dismiss();
    toast.error('Transaction failed', {
      duration: 10_000
    });
  }
  return {
    hash,
    error,
    isPending,
    writeContract
  }
}