import { UNISWAP_V3_CONTRACTS } from "@/config"
import UniswapV3FactoryABI from "@/config/abi/UniswapV3Factory.json"
import { encodeSqrtRatioX96, nearestUsableTick, Pool, Position } from "@uniswap/v3-sdk"
import { CurrencyAmount, Token } from "@uniswap/sdk-core"
import JSBI from 'jsbi'
import NftPositionManagerABI from "@/config/abi/NftPositionManager.json"
import { TokenInfo } from "@/types"
import { FEE_TIERS } from "@/config"
import { MAX_UINT128 } from "@/config/constants"
import { zeroAddress, encodeFunctionData } from "viem"
import UniswapV3PoolABI from "@/config/abi/Pool.json"
import { callContract } from "./callContract"


export interface MintParams {
  token0: TokenInfo
  token1: TokenInfo
  fee: number
  tickLower: number
  tickUpper: number
  amount0Desired: bigint
  amount1Desired: bigint
  recipient: `0x${string}`
  deadline: bigint,
  slippage: number
}

export async function getPoolAddress(publicClient: any, token0: TokenInfo, token1: TokenInfo, fee: number) {
  const [sorted0, sorted1] = token0.address.toLocaleLowerCase() < token1.address.toLocaleLowerCase() ? [token0, token1] : [token1, token0];
  const poolAddress = await publicClient.readContract({
    address: UNISWAP_V3_CONTRACTS.v3CoreFactoryAddress as `0x${string}`,
    abi: UniswapV3FactoryABI,
    functionName: 'getPool',
    args: [sorted0.address as `0x${string}`, sorted1.address as `0x${string}`, fee]
  })
  return poolAddress !== zeroAddress ? poolAddress : false;
}

export async function getPoolTick(publicClient: any, poolAddress: string) {
  const res = await publicClient.readContract({
    address: poolAddress as `0x${string}`,
    abi: UniswapV3PoolABI,
    functionName: 'slot0'
  })
  return res[1];
}

export async function createPoolIfNecessary(publicClient: any, walletClient: any, token0: TokenInfo, token1: TokenInfo, fee: number, priceRatio = 1) {
  const [sorted0, sorted1] = token0.address.toLocaleLowerCase() < token1.address.toLocaleLowerCase() ? [token0, token1] : [token1, token0];
  const sqrtPriceX96 = encodeSqrtRatioX96(
    JSBI.BigInt(priceRatio * 1e6), // numerator
    JSBI.BigInt(1e6) // denominator
  ).toString()
  return await callContract(publicClient, walletClient, {
    address: UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`,
    abi: NftPositionManagerABI,
    functionName: 'createAndInitializePoolIfNecessary',
    args: [
      sorted0.address as `0x${string}`,
      sorted1.address as `0x${string}`,
      fee,
      sqrtPriceX96
    ],
    value: 0n
  })
}

export async function getPoolState(publicClient: any, poolAddress: string) {
  const [slot0] = await Promise.all([
    publicClient.readContract({
      address: poolAddress as `0x${string}`,
      abi: UniswapV3PoolABI,
      functionName: 'slot0'
    })
  ])
  return {
    sqrtPriceX96: slot0[0],
    tick: slot0[1]
  }
}

export function getPriceRatioFromTick(tick: number): number {
  return 1.0001 ** tick;
}

export async function getRecommendedTickRange(publicClient: any, poolAddress: string, fee: number, tickRange = 5) {
  const tickSpacing = FEE_TIERS.find((tier) => tier.value === fee)?.tickSpacing as number;
  const { tick: currentTick, sqrtPriceX96 } = await getPoolState(publicClient, poolAddress)
  const centerTick = nearestUsableTick(currentTick, tickSpacing)
  const tickLower = centerTick - tickRange * tickSpacing
  const tickUpper = centerTick + tickRange * tickSpacing
  const priceRatio = getPriceRatioFromTick(currentTick)
  return { tickLower, tickUpper, tickSpacing, currentTick, priceRatio, sqrtPriceX96 }
}

export async function mintPosition(
  publicClient: any,
  walletClient: any,
  params: MintParams
) {
  const { amount0Min, amount1Min } = getAmountsMin({
    amount0: params.amount0Desired,
    amount1: params.amount1Desired,
    slippage: params.slippage,
  });
  const args = {
    token0: params.token0.address as `0x${string}`,
    token1: params.token1.address as `0x${string}`,
    fee: params.fee,
    tickLower: params.tickLower,
    tickUpper: params.tickUpper,
    amount0Desired: params.amount0Desired,
    amount1Desired: params.amount1Desired,
    amount0Min: 0n,
    amount1Min: 0n,
    recipient: params.recipient,
    deadline: params.deadline
  }
  return await callContract(publicClient, walletClient, {
    address: UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`,
    abi: NftPositionManagerABI,
    functionName: 'mint',
    args: [args]
  })
}



export function calculatePairedTokenAmount({
  token0,
  token1,
  fee,
  sqrtPriceX96,
  tick,
  tickLower,
  tickUpper,
  knownToken,
  knownAmountRaw,
}: {
  token0: TokenInfo
  token1: TokenInfo
  fee: number
  sqrtPriceX96: bigint
  tick: number
  tickLower: number
  tickUpper: number
  knownToken: 'token0' | 'token1'
  knownAmountRaw: bigint | string
}) {
  const Token0 = new Token(token0.chainId, token0.address, token0.decimals, token0.symbol, token0.name)
  const Token1 = new Token(token1.chainId, token1.address, token1.decimals, token1.symbol, token1.name)
  const pool = new Pool(Token0, Token1, fee, JSBI.BigInt(sqrtPriceX96.toString()), JSBI.BigInt(1), tick)

  if (knownToken === 'token0') {
    const position = Position.fromAmount0({
      pool,
      tickLower,
      tickUpper,
      amount0: JSBI.BigInt(knownAmountRaw.toString()),
      useFullPrecision: true,
    })
    return position.amount1.quotient.toString()
  } else {
    const position = Position.fromAmount1({
      pool,
      tickLower,
      tickUpper,
      amount1: JSBI.BigInt(knownAmountRaw.toString()),
    })
    return position.amount0.quotient.toString()
  }
}

export function getAmountsMin({
  amount0,
  amount1,
  slippage,
}: {
  amount0: bigint | string
  amount1: bigint | string
  slippage: number
}): {
  amount0Min: bigint
  amount1Min: bigint
} {
  const a0 = BigInt(amount0.toString())
  const a1 = BigInt(amount1.toString())

  const slippageFactor = 1 - slippage
  const amount0Min = BigInt(a0 * BigInt(Math.floor(slippageFactor * 1e6)) / BigInt(1e6))
  const amount1Min = BigInt(a1 * BigInt(Math.floor(slippageFactor * 1e6)) / BigInt(1e6))

  return {
    amount0Min,
    amount1Min,
  }
}

export async function getPositions(publicClient: any, account: string) {
  const positionCount = await publicClient.readContract({
    address: UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`,
    abi: NftPositionManagerABI,
    functionName: 'balanceOf',
    args: [account]
  })

  const nftIds = await Promise.all(Array.from({ length: Number(positionCount) }).map(async (_, i) => {
    return publicClient.readContract({
      address: UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`,
      abi: NftPositionManagerABI,
      functionName: 'tokenOfOwnerByIndex',
      args: [account, BigInt(i)]
    })
  }))

  const positions = await Promise.all(nftIds.map(async (nftId: bigint) => {
    return publicClient.readContract({
      address: UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`,
      abi: NftPositionManagerABI,
      functionName: 'positions',
      args: [nftId]
    })
  }))

  return positions.map((position: any, idx: number) => {
    return {
      nftId: nftIds[idx],
      token0: position[2],
      token1: position[3],
      fee: position[4],
      tickLower: position[5],
      tickUpper: position[6],
      liquidity: position[7],
      token0FeeGrowth: position[8],
      token1FeeGrowth: position[9],
      tokensOwed0: position[10],
      tokensOwed1: position[11],
    }
  });
}

export async function claimV3Fee(publicClient: any, walletClient: any, tokenId: bigint, account: string) {
  return await callContract(
    publicClient,
    walletClient,
    {
      address: UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`,
      abi: NftPositionManagerABI,
      functionName: 'collect',
      args: [{ tokenId, recipient: account, amount0Max: MAX_UINT128, amount1Max: MAX_UINT128 }]
    }
  )
}

export async function withdrawPosition(publicClient: any, walletClient: any, tokenId: bigint, account: string, autoBurn = false) {
  const position = await publicClient.readContract({
    address: UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`,
    abi: NftPositionManagerABI,
    functionName: 'positions',
    args: [tokenId],
  });
  const liquidity: bigint = position[7];
  console.log(liquidity);
  if (liquidity > 0n) {
    await callContract(
      publicClient,
      walletClient,
      {
        address: UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`,
        abi: NftPositionManagerABI,
        functionName: 'decreaseLiquidity',
        args: [{
          tokenId,
          liquidity,
          amount0Min: 0n,
          amount1Min: 0n,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 60),
        }],
      }
    );
  }
  await callContract(
    publicClient,
    walletClient,
    {
      address: UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`,
      abi: NftPositionManagerABI,
      functionName: 'collect',
      args: [{
        tokenId,
        recipient: account,
        amount0Max: MAX_UINT128,
        amount1Max: MAX_UINT128,
      }],
    }
  );
  if (autoBurn) {
    await callContract(
      publicClient,
      walletClient,
      {
        address: UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`,
        abi: NftPositionManagerABI,
        functionName: 'burn',
        args: [tokenId],
      }
    );
  }
}