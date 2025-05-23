import type { NextPage } from 'next';
import { Card } from '@radix-ui/themes';
import { useProtocol, useTokens } from '@/hooks';
import { useState, useEffect } from 'react';
import { TokenInfo } from '@/types';
import { Plus } from 'lucide-react';
import { NetworkTokenSelector, FieldItem, CheckSelector, Button, Input } from '@/components';
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
import { usePoolInfo } from '@/hooks/usePoolInfo';

const Pool: NextPage = () => {
  const { account, publicClient, walletClient } = useProtocol();
  const tokens = useTokens();
  const poolTokens = tokens.filter(token => !token.isNative);
  const [tokenA, setTokenA] = useState<TokenInfo>(poolTokens[0]);
  const [tokenB, setTokenB] = useState<TokenInfo>(poolTokens[1]);
  const [amountA, setAmountA] = useState<string>('100');
  const [amountB, setAmountB] = useState<string>('100'  );
  const [tickRange, setTickRange] = useState(TICK_STRATEGY[1].value);

  const [feeTier, setFeeTier] = useState(FEE_TIERS[1].value);

  const {
    poolAddress,
    priceRatio,
    sqrtPriceX96,
    currentTick,
    tickLower,
    tickUpper,
    tickSpacing,
    isLoading
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

    let poolAddress = await getPoolAddress(publicClient, token0, token1, feeTier);

    if (!poolAddress) {
      poolAddress = await createPoolIfNecessary(walletClient, token0, token1, feeTier, 1);
      return
    }


    const allowance0 = await getAllowance(publicClient, token0, account as `0x${string}`, UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`);
    if (allowance0 < AMOUNT_0) {
      await approveToken(walletClient, token0, UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`, AMOUNT_0);
    }
    const allowance1 = await getAllowance(publicClient, token1, account as `0x${string}`, UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`);
    if (allowance1 < AMOUNT_1) {
      await approveToken(walletClient, token1, UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`, AMOUNT_1);
    }

    const slippage = 0.05;
    const { amount0Min, amount1Min } = getAmountsMin({
      amount0: AMOUNT_0,
      amount1: AMOUNT_1,
      slippage,
    });



    const tx = await mintPosition(walletClient, {
      token0: token0,
      token1: token1,
      fee: feeTier,
      tickLower,
      tickUpper,
      amount0Desired: AMOUNT_0,
      amount1Desired: AMOUNT_1,
      amount0Min,
      amount1Min,
      recipient: account as `0x${string}`,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 1000 * 60 * 5),
    })

  }

  return (
    <div className='flex justify-center pt-10 select-none'>
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
            <div className='flex items-center gap-4'>
              <Input className='flex-1' value={amountA} onChange={(e) => onAmountChange(e, 'A')} />
              <Plus />
              <Input className='flex-1' value={amountB} onChange={(e) => onAmountChange(e, 'B')} />
            </div>
            <p className='text-[12px] text-[#d1d1d1]'>{`1 ${tokenA.symbol} = ${priceRatio} ${tokenB.symbol}`}</p>
          </FieldItem>
          <Button
            className='w-full cursor-pointer bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 text-white font-bold text-[16px] rounded-lg'
            onClick={handleButtonClick}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Add Liquidity'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Pool;