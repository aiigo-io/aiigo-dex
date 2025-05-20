import type { NextPage } from 'next';
import { Card } from '@radix-ui/themes';
import { Button } from '@/components/ui/button';
import { useProtocol, useTokens } from '@/hooks';
// import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import WAIGO_ABI from '@/config/abi/WAIGO.json';
import TradeInput from '@/components/common/TradeInput';
import NetworkTokenSelector from '@/components/common/NetworkTokenSelector';
import { useState } from 'react';
import { TokenInfo } from '@/types';
import { parseUnits } from 'viem';
import { useContractCall } from '@/hooks/useContractCall';
import { toast } from 'sonner';
import { ArrowUpDown } from 'lucide-react';

const Swap: NextPage = () => {
  const { account } = useProtocol();
  const tokens = useTokens();

  const [amountFrom, setAmountFrom] = useState<string>('');

  const [selectedTokenFrom, setSelectedTokenFrom] = useState<TokenInfo>(tokens[0]);
  const [selectedTokenTo, setSelectedTokenTo] = useState<TokenInfo>(tokens[1]);

  const buttonLabel = () => {
    if (isPending) return 'Processing...';
    if (selectedTokenFrom.address === selectedTokenTo.address) {
      return 'Select Different Token';
    }
    if (amountFrom === '') {
      return 'Enter Amount';
    }
    if (isNaN(Number(amountFrom)) || !parseUnits(amountFrom, selectedTokenFrom.decimals)) {
      return 'Enter Valid Amount';
    }
    if (selectedTokenFrom.isNative && selectedTokenTo.isWrapped) {
      return 'Wrap';
    }
    if (selectedTokenFrom.isWrapped && selectedTokenTo.isNative) {
      return 'Unwrap';
    }
    return 'Swap';
  }

  const buttonDisabled = () => {
    if (isPending) return true;
    if (!selectedTokenFrom || !selectedTokenTo) return true;
    if (selectedTokenFrom.address === selectedTokenTo.address) return true;
    if (amountFrom === '') return true;
    if (isNaN(Number(amountFrom)) || !parseUnits(amountFrom, selectedTokenFrom.decimals)) return true;
    return false;
  }
  
  // const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isPending, writeContract } = useContractCall();

  const isWrap = selectedTokenFrom.isNative && selectedTokenTo.isWrapped;
  const isUnwrap = selectedTokenFrom.isWrapped && selectedTokenTo.isNative;

  const handleButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!account) return toast.error('Please connect your wallet');
    if (isWrap) {
      handleWrap();
    }
    if (isUnwrap) {
      handleUnwrap();
    }
    try {
      
    } catch (error) {
      console.error(error);
    }
  }

  const handleWrap = async () => {
    writeContract({
      address: selectedTokenTo.address as `0x${string}`,
      abi: WAIGO_ABI.abi,
      functionName: 'deposit',
      value: parseUnits(amountFrom, selectedTokenFrom.decimals),
    });
  }

  const handleUnwrap = async () => {
    writeContract({
      address: selectedTokenFrom.address as `0x${string}`,
      abi: WAIGO_ABI.abi,
      functionName: 'withdraw',
      args: [parseUnits(amountFrom, selectedTokenFrom.decimals)],
    });
  }

  return (
    <div className='flex justify-center pt-10 select-none'>
      <Card className='w-[500px]'>
        <h2 className='text-[32px] font-bold text-[#d1d1d1] mb-4'>SWAP</h2>
        <div className='flex flex-col gap-4'>
          <TradeInput label='You Pay' value={amountFrom} onChange={(e) => setAmountFrom(e.target.value)}>
            <NetworkTokenSelector tokens={tokens} selectedToken={selectedTokenFrom} onSelect={setSelectedTokenFrom} />
          </TradeInput>
          <div className='flex items-center justify-center'>
            <ArrowUpDown className='w-6 h-6 border border-gray-200 rounded-full p-1 cursor-pointer' onClick={() => {
              setSelectedTokenFrom(selectedTokenTo);
              setSelectedTokenTo(selectedTokenFrom);
            }} />
          </div>
          <TradeInput label='You Receive' value={amountFrom} readonly={true} onChange={(e) => setAmountFrom(e.target.value)}>
            <NetworkTokenSelector tokens={tokens} selectedToken={selectedTokenTo} onSelect={setSelectedTokenTo} />
          </TradeInput>
          <Button
            className='w-full cursor-pointer bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 text-white font-bold text-[16px] rounded-lg'
            onClick={handleButtonClick}
            disabled={buttonDisabled()}
          >
            {buttonLabel()}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Swap;