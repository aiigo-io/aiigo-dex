import { Address, PublicClient, WalletClient, WriteContractParameters } from 'viem';
import { toast } from "sonner";
import { EXPLORER_URL } from '@/config/constants';
import { ContractInfo } from '@/types';

export async function callContract(
  publicClient: PublicClient,
  walletClient: WalletClient,
  contractInfo: ContractInfo,
) {
  try {
    const txHash = await walletClient.writeContract(contractInfo as WriteContractParameters);
    toast.info('Transaction sent', {
      duration: 10000,
      style: {
        backgroundColor: '#FFB62E',
        color: '#fff',
        border: '1px solid #333'
      },
      action: {
        label: 'View on explorer',
        onClick: () => window.open(`${EXPLORER_URL}/tx/${txHash}`, '_blank')
      }
    });
    const transaction = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    if (transaction && transaction.status != 'success') {
      toast.error('Transaction failed', {
        style: {
          backgroundColor: '#EE3C4D',
          color: '#fff',
          border: '1px solid #333'
        },
        action: {
          label: 'View on explorer',
          onClick: () => window.open(`${EXPLORER_URL}/tx/${txHash}`, '_blank')
        }
      });
      return;
    }
    toast.success('Transaction completed', {
      style: {
        backgroundColor: '#2DCE89',
        color: '#fff',
        border: '1px solid #333'
      },
      action: {
        label: 'View on explorer',
        onClick: () => window.open(`${EXPLORER_URL}/tx/${txHash}`, '_blank')
      }
    });
  } catch (e) {
    toast.error((e as Error).message, {
      style: {
        backgroundColor: '#EE3C4D',
        color: '#fff',
        border: '1px solid #333'
      },
    });
  }
}
