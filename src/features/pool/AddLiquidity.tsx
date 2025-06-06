import { Card } from '@radix-ui/themes';
import { useProtocol, useTokens } from '@/hooks';
import React, { useState } from 'react';
import { TokenInfo } from '@/types';
import { Plus } from 'lucide-react';
import { NetworkTokenSelector, FieldItem, CheckSelector, Button, Input, TradeInput } from '@/components';
import { FEE_TIERS, TICK_STRATEGY } from '@/config';
import { parseUnits, formatUnits } from 'viem';
import { getAllowance, approveToken } from '@/lib/token-helper';
import {
  createPoolIfNecessary,
  getPoolAddress,
  calculatePairedTokenAmount,
  mintPosition,
  getAmountsMin
} from '@/lib/pool-helper';
import { UNISWAP_V3_CONTRACTS } from '@/config';
import { usePoolInfo, useTokenAllowances, useTokenBalances, useUserPositions } from '@/hooks';

const AddLiquidity: React.FC = () => {
  const { account, publicClient, walletClient } = useProtocol();
  const { refetch: refetchPositions } = useUserPositions();
  const tokens = useTokens();
  const { data: poolTokens, isLoading: isBalanceLoading } = useTokenBalances(tokens.filter(token => !token.isNative));
  const [tokenA, setTokenA] = useState<TokenInfo>(poolTokens[0]);
  const [tokenB, setTokenB] = useState<TokenInfo>(poolTokens[1]);
  const [amountA, setAmountA] = useState<string>('100');
  const [amountB, setAmountB] = useState<string>('100'  );
  const [tickRange, setTickRange] = useState(TICK_STRATEGY[1].value);

  const [feeTier, setFeeTier] = useState(FEE_TIERS[1].value);

  const { data: allowanceA, isLoading: isAllowanceALoading, refetch: refetchAllowanceA } = useTokenAllowances(tokenA, UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`);
  const { data: allowanceB, isLoading: isAllowanceBLoading, refetch: refetchAllowanceB } = useTokenAllowances(tokenB, UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`);

  const tokenABalance = poolTokens.find((token: TokenInfo) => token.address === tokenA.address)?.balance;
  const tokenBBalance = poolTokens.find((token: TokenInfo) => token.address === tokenB.address)?.balance;
  const tokenABalanceFormatted = poolTokens.find((token: TokenInfo) => token.address === tokenA.address)?.balanceFormatted;
  const tokenBBalanceFormatted = poolTokens.find((token: TokenInfo) => token.address === tokenB.address)?.balanceFormatted;

  const tokenANeedApprove = allowanceA !== undefined && allowanceA < parseUnits(amountA, tokenA.decimals);
  const tokenBNeedApprove = allowanceB !== undefined && allowanceB < parseUnits(amountB, tokenB.decimals);

  const {
    poolAddress,
    priceRatio,
    sqrtPriceX96,
    currentTick,
    tickLower,
    tickUpper,
    tickSpacing,
    isLoading: isPoolLoading,
    refetch: refetchPoolInfo,
  } = usePoolInfo(tokenA, tokenB, feeTier);

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>, token: 'A' | 'B') => {
    const value = e.target.value;
    const [token0, token1] = tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
    if (token === 'A') {
      setAmountA(value);
      const currentToken = token0.address.toLowerCase() === tokenA.address.toLowerCase() ? 'token0' : 'token1';
      const amountB = calculatePairedTokenAmount({
        token0,
        token1,
        fee: feeTier,
        sqrtPriceX96,
        tick: currentTick,
        tickLower,
        tickUpper,
        knownToken: currentToken,
        knownAmountRaw: parseUnits(value, tokenA.decimals)
      })
      // const amountB = Number(value) * priceRatio;
      setAmountB(formatUnits(BigInt(amountB), tokenB.decimals));
    } else {
      setAmountB(value);
      const currentToken = token0.address.toLowerCase() === tokenA.address.toLowerCase() ? 'token1' : 'token0';
      const amountA = calculatePairedTokenAmount({
        token0,
        token1,
        fee: feeTier,
        sqrtPriceX96,
        tick: currentTick,
        tickLower,
        tickUpper,
        knownToken: currentToken,
        knownAmountRaw: parseUnits(value, tokenB.decimals)
      })
      // const amountB = Number(value) * priceRatio;
      setAmountA(formatUnits(BigInt(amountA), tokenA.decimals));
    }
  }
  
  const handleButtonClick = async () => {
    const [token0, token1] = tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
    const [amount0, amount1] = token0.address.toLowerCase() === tokenA.address.toLowerCase() ? [amountA, amountB] : [amountB, amountA];
    const AMOUNT_0 = parseUnits(amount0, token0.decimals);
    const AMOUNT_1 = parseUnits(amount1, token1.decimals);
    if (tokenANeedApprove) {
      await approveToken(publicClient, walletClient, tokenA, UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`, parseUnits(amountA, tokenA.decimals) * 2n);
      await refetchAllowanceA();
      return
    };
    if (tokenBNeedApprove) {
      await approveToken(publicClient, walletClient, tokenB, UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`, parseUnits(amountB, tokenB.decimals) * 2n);
      await refetchAllowanceB();
      return
    };
    if (!poolAddress) {
      await createPoolIfNecessary(publicClient, walletClient, token0, token1, feeTier, 1);
      await refetchPoolInfo();
      return
    }

    const slippage = 0.05;

    await mintPosition(publicClient, walletClient, {
      token0: token0,
      token1: token1,
      fee: feeTier,
      tickLower,
      tickUpper,
      amount0Desired: AMOUNT_0,
      amount1Desired: AMOUNT_1,
      recipient: account as `0x${string}`,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 1000 * 60 * 5),
      slippage,
    })

    await refetchPositions()



  }

  const isLoading = isPoolLoading || isAllowanceALoading || isAllowanceBLoading || isBalanceLoading;

  const buttonDisabled = () => {
    if (isLoading) return true;
    if (!tokenA || !tokenB) return true;
    if (tokenA.address === tokenB.address) return true;
    if (!amountA || !amountB) return true;
    if (parseUnits(amountA, tokenA.decimals) > tokenABalance) return true;
    if (parseUnits(amountB, tokenB.decimals) > tokenBBalance) return true;
    return false;
  }

  const buttonLabel = () => {
    if (isLoading) return 'Loading...';
    if (!tokenA || !tokenB) return 'Select Token';
    if (tokenA.address === tokenB.address) return 'Select Different Token';
    if (!amountA || !amountB) return 'Enter Amount';
    
    if (parseUnits(amountA, tokenA.decimals) > tokenABalance) {
      return `Insufficient ${tokenA.symbol} balance`;
    }
    if (parseUnits(amountB, tokenB.decimals) > tokenBBalance) {
      return `Insufficient ${tokenB.symbol} balance`;
    }
    if (!poolAddress) return 'Create Pool';
    if (tokenANeedApprove) return `Approve ${tokenA.symbol}`;
    if (tokenBNeedApprove) return `Approve ${tokenB.symbol}`;
    return 'Add Liquidity';
  }

  return (
    <Card className='w-[500px]'>
      <h2 className='text-[32px] font-bold text-[#d1d1d1] mb-4'>Pool</h2>
      <div className='flex flex-col gap-4'>
        <FieldItem label='1. Select Token'>
          <div className='flex items-center gap-4'>
            <NetworkTokenSelector className='flex-1' tokens={poolTokens} selectedToken={tokenA} onSelect={setTokenA} />
            <Plus />
            <NetworkTokenSelector className='flex-1' tokens={poolTokens} selectedToken={tokenB} onSelect={setTokenB} />
          </div>
        </FieldItem>
        <FieldItem label='2. Select Fee Tier'>
          <CheckSelector options={FEE_TIERS} value={feeTier} onChange={setFeeTier} />
        </FieldItem>
        <FieldItem label='3. Select Tick Range'>
          <CheckSelector options={TICK_STRATEGY} value={tickRange} onChange={setTickRange} />
        </FieldItem>
        <FieldItem label='3. Select Amount'>
          <TradeInput
            type="number"
            label='Token A'
            value={amountA}
            onChange={(e) => onAmountChange(e, 'A')}
            bottomLabel={`Balance: ${tokenABalanceFormatted}`}
          >
            <NetworkTokenSelector tokens={tokens} disabled={true} selectedToken={tokenA} />
          </TradeInput>
          <TradeInput
            type="number"
            label='Token B'
            value={amountB}
            onChange={(e) => onAmountChange(e, 'B')}
            bottomLabel={`Balance: ${tokenBBalanceFormatted}`}
          >
            <NetworkTokenSelector tokens={tokens} disabled={true} selectedToken={tokenB} />
          </TradeInput>
          <p className='text-[12px] text-[#d1d1d1]'>{`1 ${tokenA.symbol} = ${priceRatio} ${tokenB.symbol}`}</p>
        </FieldItem>
        <Button
          className='mt-4 w-full cursor-pointer bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 text-white font-bold text-[16px] rounded-lg'
          onClick={handleButtonClick}
          size='lg'
          disabled={buttonDisabled()}
        >
          {buttonLabel()}
        </Button>
      </div>
    </Card>
  );
};

export default AddLiquidity;