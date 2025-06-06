import React, { useState } from 'react';
import { useProtocol } from '@/hooks';
import { TokenPair } from './TokenPair';
import { Token } from './Token';
import { Card } from '@radix-ui/themes';
import { Badge, Button } from '@/components';
import { GetFeeTier } from '@/config';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { usePoolInfo, usePositionInfo, useUnclaimedFee } from '@/hooks';
import { CurrencyAmount, Token as TokenEntity } from '@uniswap/sdk-core';
import JSBI from 'jsbi';
import { balanceFormat } from '@/lib/utils';
import { claimV3Fee, withdrawPosition } from '@/lib/pool-helper'

export const PositionItem: React.FC<{
  position: any,
  refetch?: () => void
}> = ({ position, refetch }) => {
  const { account, chainId, walletClient, publicClient } = useProtocol();
  const [showDetail, setShowDetail] = useState(false);
  const  { currentTick, poolAddress, isLoading: isPoolInfoLoading } = usePoolInfo(position.token0Info, position.token1Info, position.fee)
  const isInRange = (currentTick >= position.tickLower && currentTick <= position.tickUpper) || isPoolInfoLoading;
  const positionInfo = usePositionInfo(
    position.token0Info,
    position.token1Info,
    position.fee,
    position.liquidity,
    position.tickLower,
    position.tickUpper
  )

  const { data: fees, isLoading: isFeeLoading, refetch: refetchFee } = useUnclaimedFee(position.nftId);
  const token0Fees = balanceFormat(fees?.[0], position.token0Info.decimals)
  const token1Fees = balanceFormat(fees?.[1], position.token1Info.decimals)

  const pairToken = new TokenEntity(chainId, position.token0, position.token0Info.decimals, `${position.token0Info.symbol}-${position.token1Info.symbol}`, `${position.token0Info.symbol}-${position.token1Info.symbol}`)
  const pairAmount = CurrencyAmount.fromRawAmount(pairToken, JSBI.BigInt(position.liquidity.toString())).toSignificant(6)

  const claimFee = async () => {
    await claimV3Fee(publicClient, walletClient, position.nftId, account as `0x${string}`)
    await refetchFee()
  }

  const withdraw = async () => {
    await withdrawPosition(publicClient, walletClient, position.nftId, account as `0x${string}`, true)
    refetch && refetch()
  }

  return (
    <Card>
      <div className='flex items-center gap-2 justify-between' onClick={() => setShowDetail(!showDetail)}>
        <div className='flex items-center gap-2'>
          <TokenPair token0={position.token0Info} token1={position.token1Info} />
          <span className='text-[14px] font-bold text-white'>{position.token0Info.symbol} / {position.token1Info.symbol}</span>
          <Badge className='!pl-0 !py-0 gap-2' variant='secondary'>
            <Badge className="rounded-r-none">NFT ID: </Badge>
            {position.nftId.toString()}
          </Badge>
          <Badge variant='secondary'>{`${GetFeeTier(position.fee)} Fee`}</Badge>
          <Badge variant={isInRange ? 'green' : 'red'}>{isInRange ? 'In Range' : 'Out of Range'}</Badge>
        </div>
        <div className='flex items-center gap-2 cursor-pointer'>
          { showDetail ? <ChevronUp size={18} /> : <ChevronDown size={18} /> }
        </div>
      </div>
      {
        showDetail && (
          <div className='mt-2 pt-2'>
            <Card>
              <div className='flex flex gap-3'>
                <Token token={position.token0Info} showAddress={true} />
                <Token token={position.token1Info} showAddress={true} />
                <TokenPair token0={position.token0Info} size={16} token1={position.token1Info} address={poolAddress} />
              </div>
              <div className='flex justify-between mt-3 gap-4'>
                <div className='flex-1 flex flex-col gap-3 p-4 rounded-[14px] border border-white/10 relative'>
                  <Button
                    size='sm'
                    className="absolute top-3 right-4 cursor-pointer"
                    variant='destructive'
                    onClick={() => withdraw()}
                  >Withdraw</Button>
                  <p className='text-white/50 font-bold text-[14px]'>Your Liquidity</p>
                  <p className='text-white text-[12px] font-bold mg-2'>{`${pairAmount} ${position.token0Info.symbol}-${position.token1Info.symbol}`}</p>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center justify-between'>
                      <Token token={position.token0Info} showSymbol={true} />
                      <span className='text-white text-[12px] font-bold'>{positionInfo?.amount0.toSignificant(6) || '-' }</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <Token token={position.token1Info} showSymbol={true} />
                      <span className='text-white text-[12px] font-bold'>{positionInfo?.amount1.toSignificant(6) || '-' }</span>
                    </div>
                  </div>
                </div>
                <div className='flex-1 p-4 rounded-[14px] border flex flex-col justify-between relative'>
                  {
                    (fees?.[0] || fees?.[1]) ? (<Button
                      size='sm'
                      className="absolute top-3 right-4 cursor-pointer"
                      variant='destructive'
                      onClick={() => claimFee()}
                    >Claim</Button>) : null
                  }
                  <p className='text-white font-bold text-[14px] mb-2'>Unclaimed Fee</p>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center justify-between'>
                      <Token token={position.token0Info} showSymbol={true} />
                      <div>
                        <span className='text-white text-[12px] font-bold'>{token0Fees}</span>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <Token token={position.token1Info} showSymbol={true} />
                      <span className='text-white text-[12px] font-bold'>{token1Fees}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )
      }
    </Card>
    
  )
}