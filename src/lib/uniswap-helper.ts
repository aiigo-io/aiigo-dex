import { UNISWAP_V3_CONTRACTS } from "@/config"
import { Token } from "@uniswap/sdk-core"
import UniswapV3FactoryABI from "@/config/abi/UniswapV3Factory.json"
import ERC20ABI from "@/config/abi/ERC20.json"
import UniswapV3PoolABI from "@/config/abi/Pool.json"
import { encodeSqrtRatioX96 } from "@uniswap/v3-sdk"
import { parseUnits } from "viem"
import JSBI from 'jsbi'
import NftPositionManagerABI from "@/config/abi/NftPositionManager.json"
import UniswapRouterABI from "@/config/abi/UniswapRouter.json"
import { TokenInfo } from "@/types"
import { FEE_TIERS } from "@/config"
import { zeroAddress } from "viem"

export async function getPoolAddress(publicClient: any, token0: TokenInfo, token1: TokenInfo, fee: number) {
  return await publicClient.readContract({
    address: UNISWAP_V3_CONTRACTS.v3CoreFactoryAddress as `0x${string}`,
    abi: UniswapV3FactoryABI,
    functionName: 'getPool',
    args: [token0.address as `0x${string}`, token1.address as `0x${string}`, fee]
  })
}

export async function createPool(walletClient: any, token0: TokenInfo, token1: TokenInfo, fee: number) {
  return await walletClient.writeContract({
    address: UNISWAP_V3_CONTRACTS.v3CoreFactoryAddress as `0x${string}`,
    abi: UniswapV3FactoryABI,
    functionName: 'createPool',
    args: [token0.address as `0x${string}`, token1.address as `0x${string}`, fee]
  })
}

export async function approveToken(walletClient: any, token: TokenInfo, spender: string, amount: bigint) {
  return await walletClient.writeContract({
    address: token.address as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'approve',
    args: [spender, amount]
  })
}

export async function isPoolInitialized(publicClient: any, poolAddress: string) {
  const res = await publicClient.readContract({
    address: poolAddress as `0x${string}`,
    abi: UniswapV3PoolABI,
    functionName: 'slot0'
  })
  return res[0] !== 0n;
}

export async function initializePool(walletClient: any, poolAddress: string, token0: TokenInfo, token1: TokenInfo) {
  const sqrtPriceX96 = encodeSqrtRatioX96(
    JSBI.BigInt(parseUnits('1', token1.decimals).toString()),
    JSBI.BigInt(parseUnits('1', token0.decimals).toString()),
  )
  return await walletClient.writeContract({
    address: poolAddress as `0x${string}`,
    abi: UniswapV3PoolABI,
    functionName: 'initialize',
    args: [sqrtPriceX96]
  })
}

export async function getPoolTick(publicClient: any, poolAddress: string) {
  const res = await publicClient.readContract({
    address: poolAddress as `0x${string}`,
    abi: UniswapV3PoolABI,
    functionName: 'slot0'
  })
  return res[1];
}

export async function mint(walletClient: any, token0: TokenInfo, token1: TokenInfo, fee: number, tickLower: number, tickUpper: number, amount0: bigint, amount1: bigint, account: `0x${string}`) {
  console.log([
    token0.address as `0x${string}`,
    token1.address as `0x${string}`,
    fee,
    tickLower,
    tickUpper,
    amount0,
    amount1,
    account,
    BigInt(Math.floor(Date.now() / 1000) + 600), // deadline
  ])
  return await walletClient.writeContract({
    address: UNISWAP_V3_CONTRACTS.nonfungibleTokenPositionManagerAddress as `0x${string}`,
    abi: NftPositionManagerABI,
    functionName: 'mint',
    args: [{
      token0: token0.address as `0x${string}`,
      token1: token1.address as `0x${string}`, 
      fee,
      tickLower,
      tickUpper,
      amount0Desired: amount0,
      amount1Desired: amount1,
      amount0Min: 0n,
      amount1Min: 0n,
      recipient: account,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 600)
    }]
  })
}

export async function getFee(publicClient: any, token0: TokenInfo, token1: TokenInfo) {
  let fee = null;
  for (const tier of FEE_TIERS) {
    const poolAddress = await getPoolAddress(publicClient, token0, token1, tier.value);
    if (poolAddress !== zeroAddress) {
      fee = tier.value;
      break;
    }
  }
  return fee;
}

export async function swapSim(publicClient: any, tokenIn: TokenInfo, tokenOut: TokenInfo, amountIn: bigint, fee: number, account: `0x${string}`) {
  console.log(tokenIn, tokenOut, amountIn, fee, account);
  await publicClient.simulateContract({
    address: UNISWAP_V3_CONTRACTS.swapRouter02 as `0x${string}`,
    abi: UniswapRouterABI,
    functionName: 'exactInputSingle',
    args: [{
      tokenIn: tokenIn.address as `0x${string}`,
      tokenOut: tokenOut.address as `0x${string}`,
      fee: fee,
      recipient: account,
      amountIn: amountIn,
      amountOutMinimum: 0n,
      sqrtPriceLimitX96: 0n,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 600),
    }]
  })
  // return await publicClient.writeContract({
  //   address: UNISWAP_V3_CONTRACTS.swapRouter02 as `0x${string}`,
  //   abi: UniswapRouterABI,
  //   functionName: 'exactInputSingle',
  //   args: [{
  //     tokenIn: tokenIn.address as `0x${string}`,
  //     tokenOut: tokenOut.address as `0x${string}`,
  //     fee: fee,
  //     recipient: account,
  //     amountIn: amountIn,
  //     amountOutMinimum: 0n,
  //     sqrtPriceLimitX96: 0n,
  //     deadline: BigInt(Math.floor(Date.now() / 1000) + 600),
  //   }]
  // })
}

export async function swap(walletClient: any, tokenIn: TokenInfo, tokenOut: TokenInfo, amountIn: bigint, fee: number, account: `0x${string}`) {
  console.log(tokenIn, tokenOut, amountIn, fee, account);
  return await walletClient.writeContract({
    address: UNISWAP_V3_CONTRACTS.swapRouter02 as `0x${string}`,
    abi: UniswapRouterABI,
    functionName: 'exactInputSingle',
    args: [{
      tokenIn: tokenIn.address as `0x${string}`,
      tokenOut: tokenOut.address as `0x${string}`,
      fee: fee,
      recipient: account,
      amountIn: amountIn,
      amountOutMinimum: 0n,
      sqrtPriceLimitX96: 0n,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 600),
    }]
  })
}

export async function getAllowance(publicClient: any, token: TokenInfo, account: `0x${string}`, spender: string) {
  return await publicClient.readContract({
    address: token.address as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [account, spender]
  })
}