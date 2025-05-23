import { UNISWAP_V3_CONTRACTS } from "@/config"
import UniswapV3FactoryABI from "@/config/abi/UniswapV3Factory.json"
import { encodeSqrtRatioX96, nearestUsableTick, Pool, Position } from "@uniswap/v3-sdk"
import { CurrencyAmount, Token } from "@uniswap/sdk-core"
import JSBI from 'jsbi'
import NftPositionManagerABI from "@/config/abi/NftPositionManager.json"
import { TokenInfo } from "@/types"
import { FEE_TIERS } from "@/config"
import { zeroAddress } from "viem"
import UniswapV3PoolABI from "@/config/abi/Pool.json"


export interface MintParams {
  token0: TokenInfo
  token1: TokenInfo
  fee: number
  tickLower: number
  tickUpper: number
  amount0Desired: bigint
  amount1Desired: bigint
  amount0Min: bigint
  amount1Min: bigint
  recipient: `0x${string}`
  deadline: bigint
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

export async function createPoolIfNecessary(walletClient: any, token0: TokenInfo, token1: TokenInfo, fee: number, priceRatio = 1) {
  const [sorted0, sorted1] = token0.address.toLocaleLowerCase() < token1.address.toLocaleLowerCase() ? [token0, token1] : [token1, token0];
  const sqrtPriceX96 = encodeSqrtRatioX96(
    JSBI.BigInt(priceRatio * 1e6), // numerator
    JSBI.BigInt(1e6) // denominator
  ).toString()
  return await walletClient.writeContract({
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
  walletClient: any,
  params: MintParams
) {
  const [sorted0, sorted1] = params.token0.address.toLocaleLowerCase() < params.token1.address.toLocaleLowerCase() ? [params.token0, params.token1] : [params.token1, params.token0];
  const isSameOrder = sorted0.address.toLowerCase() === params.token0.address.toLowerCase()
  const args = {
    token0: sorted0.address as `0x${string}`,
    token1: sorted1.address as `0x${string}`,
    fee: params.fee,
    tickLower: params.tickLower,
    tickUpper: params.tickUpper,
    amount0Desired: isSameOrder ? params.amount0Desired : params.amount1Desired,
    amount1Desired: isSameOrder ? params.amount1Desired : params.amount0Desired,
    amount0Min: isSameOrder ? params.amount0Min : params.amount1Min,
    amount1Min: isSameOrder ? params.amount1Min : params.amount0Min,
    recipient: params.recipient,
    deadline: params.deadline
  }
  return await walletClient.writeContract({
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
