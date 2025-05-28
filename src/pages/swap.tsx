'use client'
import type { NextPage } from 'next';
import { Card } from '@radix-ui/themes';
import { useProtocol, useTokens } from '@/hooks';
import WAIGO_ABI from '@/config/abi/WAIGO.json';
import { TradeInput, NetworkTokenSelector, Button } from '@/components';
import { use, useState } from 'react';
import { TokenInfo } from '@/types';
import { parseUnits, formatUnits } from 'viem';
import { toast } from 'sonner';
import { ArrowUpDown } from 'lucide-react';
import {
  getFee,
  wrap,
  unwrap,
  swap,
} from '@/lib/swap-helper';
import { useTokenBalances, useTokenAllowances, useSwapQuote } from '@/hooks';
import { getAllowance, approveToken } from '@/lib/token-helper';
import { UNISWAP_V3_CONTRACTS } from '@/config/uniswap';

const Swap: NextPage = () => {
  const [isPending, setIsPending] = useState(false);
  const { account, publicClient, walletClient } = useProtocol();
  const _tokens = useTokens();

  const [amountFrom, setAmountFrom] = useState<string>('1');
  const { data: tokens, isLoading: isBalanceLoading, refetch: refetchBalance } = useTokenBalances(_tokens);

  const [selectedTokenFrom, setSelectedTokenFrom] = useState<TokenInfo>(tokens[1]);
  const [selectedTokenTo, setSelectedTokenTo] = useState<TokenInfo>(tokens[2]);

  const selectedTokenBalance = tokens.find((t: TokenInfo) => t.address === selectedTokenFrom.address && t.chainId === selectedTokenFrom.chainId)?.balance || 0n;
  const selectedTokenBalanceFormatted = tokens.find((t: TokenInfo) => t.address === selectedTokenFrom.address && t.chainId === selectedTokenFrom.chainId)?.balanceFormatted || '-';
  const dstTokenBalanceFormatted = tokens.find((t: TokenInfo) => t.address === selectedTokenTo.address && t.chainId === selectedTokenTo.chainId)?.balanceFormatted || '-';

  const { data: allowance, isLoading: isAllowanceLoading, refetch: refetchAllowance } = useTokenAllowances(selectedTokenFrom, UNISWAP_V3_CONTRACTS.swapRouter02 as `0x${string}`)
  const needApprove = allowance < parseUnits(amountFrom, selectedTokenFrom.decimals);

  const { data: swapQuote, isLoading: isSwapQuoteLoading } = useSwapQuote(selectedTokenFrom, selectedTokenTo, parseUnits(amountFrom, selectedTokenFrom.decimals));
  
  const isWrap = selectedTokenFrom.isNative && selectedTokenTo.isWrapped;
  const isUnwrap = selectedTokenFrom.isWrapped && selectedTokenTo.isNative;

  const buttonLabel = () => {
    if (isPending) return 'Processing...';
    if (isAllowanceLoading) return 'Checking allowance...';
    if (parseUnits(amountFrom, selectedTokenFrom.decimals) > selectedTokenBalance) {
      return `Insufficient ${selectedTokenFrom.symbol} balance`;
    }
    if (needApprove) return `Approve ${selectedTokenFrom.symbol}`;
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
    if (isPending || isAllowanceLoading) return true;
    if (!selectedTokenFrom || !selectedTokenTo) return true;
    if (selectedTokenFrom.address === selectedTokenTo.address) return true;
    if (amountFrom === '') return true;
    if (parseUnits(amountFrom, selectedTokenFrom.decimals) > selectedTokenBalance) return true;
    if (isNaN(Number(amountFrom)) || !parseUnits(amountFrom, selectedTokenFrom.decimals)) return true;
    return false;
  }

  const handleSelectedTokenFrom = (token: TokenInfo) => {
    setSelectedTokenFrom(token);
    if (token.isNative) {
      setSelectedTokenTo(tokens.find((t: TokenInfo) => t.isWrapped) as TokenInfo);
    }
  }

  const handleButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!account) return toast.error('Please connect your wallet');
    if (needApprove) {
      await approveToken(publicClient, walletClient, selectedTokenFrom, UNISWAP_V3_CONTRACTS.swapRouter02 as `0x${string}`, parseUnits((Number(amountFrom) * 2).toString(), selectedTokenFrom.decimals));
      return await refetchAllowance();
    }
    if (isWrap) {
      await handleWrap();
    } else if (isUnwrap) {
      await handleUnwrap();
    } else {
      await handleSwap();
    }
    await refetchBalance()
  }

  const handleSwap = async () => {
    const slippage = 0.05;
    const fee = await getFee(publicClient, selectedTokenFrom, selectedTokenTo);
    console.log(fee);
    if (!fee) return toast.error('No pool found');
    if (!account) return toast.error('Please connect your wallet');
    try {
      const amountIn = parseUnits(amountFrom, selectedTokenFrom.decimals);
      setIsPending(true);
      await swap(publicClient, walletClient, selectedTokenFrom, selectedTokenTo, amountIn, fee, account, slippage);
      setIsPending(false);
    } catch (error: any) {
      console.log(error)
      setIsPending(false);
    }
  }

  const handleWrap = async () => {
    const amount = parseUnits(amountFrom, selectedTokenTo.decimals);
    setIsPending(true);
    await wrap(publicClient, walletClient, selectedTokenTo, amount);
    setIsPending(false);
  }

  const handleUnwrap = async () => {
    const amount = parseUnits(amountFrom, selectedTokenFrom.decimals);
    setIsPending(true);
    await unwrap(publicClient, walletClient, selectedTokenFrom, amount);
    setIsPending(false);
  }

  return (
    <div className='flex justify-center pt-10 select-none'>
      <Card className='w-[500px]'>
        <h2 className='text-[32px] font-bold text-[#d1d1d1] mb-4'>SWAP</h2>
        <div className='flex flex-col gap-4'>
          <TradeInput
            type="number"
            label='You Pay'
            value={amountFrom}
            onChange={(e) => setAmountFrom(e.target.value)}
            bottomLabel={`Balance: ${selectedTokenBalanceFormatted}`}
          >
            <NetworkTokenSelector
              tokens={tokens}
              selectedToken={selectedTokenFrom}
              onSelect={handleSelectedTokenFrom} />
          </TradeInput>
          <div className='flex items-center justify-center'>
            <ArrowUpDown className='w-6 h-6 border border-gray-200 rounded-full p-1 cursor-pointer' onClick={() => {
              setSelectedTokenFrom(selectedTokenTo);
              setSelectedTokenTo(selectedTokenFrom);
            }} />
          </div>
          <TradeInput
            label='You Receive'
            value={swapQuote?.amountOut ? formatUnits(swapQuote.amountOut, selectedTokenTo.decimals) : '-'}
            readonly={true}
            isLoading={isSwapQuoteLoading}
            // onChange={(e) => setAmountFrom(e.target.value)}
            bottomLabel={`Balance: ${dstTokenBalanceFormatted}`}
          >
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