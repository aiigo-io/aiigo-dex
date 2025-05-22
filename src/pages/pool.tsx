import type { NextPage } from 'next';
import { Card } from '@radix-ui/themes';
import { useProtocol, useTokens } from '@/hooks';
import { useState } from 'react';
import { TokenInfo } from '@/types';
import { Plus } from 'lucide-react';
import { NetworkTokenSelector, FieldItem, CheckSelector, Button } from '@/components';
import { FEE_TIERS } from '@/config';
import { parseUnits } from 'viem';
import { Token } from '@uniswap/sdk-core';
import { getPoolAddress, createPool, approveToken, initializePool, isPoolInitialized, getPoolTick, mint } from '@/lib/uniswap-helper';
import { zeroAddress } from 'viem';
import { UNISWAP_V3_CONTRACTS } from '@/config';

const Pool: NextPage = () => {
  const { account, publicClient, walletClient } = useProtocol();
  const tokens = useTokens();
  const [tokenA, setTokenA] = useState<TokenInfo>(tokens[0]);
  const [tokenB, setTokenB] = useState<TokenInfo>(tokens[2]);
  const [feeTier, setFeeTier] = useState(FEE_TIERS[1].value);
  
  const handleButtonClick = async () => {
    console.log(tokenA, tokenB, feeTier);
    const [token0, token1] = tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];

    const tickSpacing: number = FEE_TIERS.find((tier) => tier.value === feeTier)?.tickSpacing as number;
    const INITIAL_PRICE = 1;
    const AMOUNT_A = parseUnits('100', token0.decimals);
    const AMOUNT_B = parseUnits('100', token1.decimals);
    const SLIPPAGE = 0.5;

    const poolAddress = await getPoolAddress(publicClient, token0, token1, feeTier);

    if (poolAddress === zeroAddress) {
      console.log('Creating pool');
      const tx = await createPool(walletClient, token0, token1, feeTier);
    }

    console.log('poolAddress', poolAddress);

    await approveToken(walletClient, token0, UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`, AMOUNT_A);
    await approveToken(walletClient, token1, UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`, AMOUNT_B);

    const isInitialized = await isPoolInitialized(publicClient, poolAddress as `0x${string}`);
    if (!isInitialized) {
      console.log('Initializing pool');
      await initializePool(walletClient, poolAddress as `0x${string}`, token0, token1);
    }

    const tick = await getPoolTick(publicClient, poolAddress as `0x${string}`);
    console.log('tick', tick);
    const tickLower = Math.floor((tick - 600) / tickSpacing) * tickSpacing;
    const tickUpper = Math.floor((tick + 600) / tickSpacing) * tickSpacing;

    const tx = await mint(walletClient, token0, token1, feeTier, tickLower, tickUpper, AMOUNT_A, AMOUNT_B, account as `0x${string}`);
    console.log(tx);

    

    // const amount0 = await getAmount0(publicClient, poolAddress as `0x${string}`, tickLower, tickUpper);
    // const amount1 = await getAmount1(publicClient, poolAddress as `0x${string}`, tickLower, tickUpper);



    

    

  }

  return (
    <div className='flex justify-center pt-10 select-none'>
      <Card className='w-[500px]'>
        <h2 className='text-[32px] font-bold text-[#d1d1d1] mb-4'>Pool</h2>
        <div className='flex flex-col gap-4'>
          <FieldItem label='1. Select Token'>
            <div className='flex items-center gap-4'>
              <NetworkTokenSelector className='flex-1' tokens={tokens} selectedToken={tokenA} onSelect={setTokenA} />
              <Plus />
              <NetworkTokenSelector className='flex-1' tokens={tokens} selectedToken={tokenB} onSelect={setTokenB} />
            </div>
          </FieldItem>
          <FieldItem label='2. Select Fee Tier'>
            <CheckSelector options={FEE_TIERS} value={feeTier} onChange={setFeeTier} />
          </FieldItem>
          <Button
            className='w-full cursor-pointer bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 text-white font-bold text-[16px] rounded-lg'
            onClick={handleButtonClick}
          >
            Add Liquidity
          </Button>
        </div>
        {/* <Skeleton className='h-[300px] flex items-center justify-center'>
          <Loading />
        </Skeleton> */}
      </Card>
    </div>
  );
};

export default Pool;