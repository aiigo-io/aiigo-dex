import type { NextPage } from 'next';
import { Card } from '@radix-ui/themes';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Loading } from '@/components/ui/loading';
const Pool: NextPage = () => {
  const { account } = useProtocol();
  const tokens = useTokens();

  return (
    <div className='flex justify-center pt-10 select-none'>
      <Card className='w-[500px]'>
        <h2 className='text-[32px] font-bold text-[#d1d1d1] mb-4'>Pool</h2>
        <Skeleton className='h-[300px] flex items-center justify-center'>
          <Loading />
        </Skeleton>
      </Card>
    </div>
  );
};

export default Pool;