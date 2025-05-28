import { TokenInfo } from "@/types"
import { getPoolAddress, getPoolState, calculatePairedTokenAmount } from "./pool-helper";
import { zeroAddress } from "viem";
import ERC20ABI from "@/config/abi/ERC20.json"
import { FEE_TIERS } from "@/config";
import { UNISWAP_V3_CONTRACTS } from "@/config/uniswap";
import QuoterV2ABI from "@/config/abi/QuoterV2.json";
import UniswapRouterABI from "@/config/abi/UniswapRouter.json";
import { callContract } from "./callContract";


export async function getFee(publicClient: any, token0: TokenInfo, token1: TokenInfo) {
  let fee = null;
  for (const tier of FEE_TIERS) {
    const poolAddress = await getPoolAddress(publicClient, token0, token1, tier.value);
    if (poolAddress) {
      fee = tier.value;
      break;
    }
  }
  return fee;
}

export async function fetchSwapQuote(
  publicClient: any,
  tokenIn: TokenInfo,
  tokenOut: TokenInfo,
  amountIn: bigint,
  fee: number
) {
  const { result } = await publicClient.simulateContract({
    address: UNISWAP_V3_CONTRACTS.quoterV2Address,
    abi: QuoterV2ABI,
    functionName: 'quoteExactInputSingle',
    args: [{
      tokenIn: tokenIn.address as `0x${string}`,
      tokenOut: tokenOut.address as `0x${string}`,
      fee: fee,
      amountIn: amountIn,
      sqrtPriceLimitX96: 0n,
    }]
  })
  return {
    amountOut: result[0],
    gas: result[3]
  }
}

export async function swap(publicClient: any, walletClient: any, tokenIn: TokenInfo, tokenOut: TokenInfo, amountIn: bigint, fee: number, account: `0x${string}`, slippage = 0.05) {
  const poolAddress = await getPoolAddress(publicClient, tokenIn, tokenOut, fee);
  if (!poolAddress) throw new Error('Pool not found');

  return await callContract(publicClient, walletClient, {
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
    }]
  })
}

export async function wrap(publicClient: any, walletClient: any, token: TokenInfo, amount: bigint) {
  return await callContract(publicClient, walletClient, {
    address: token.address as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'deposit',
    args: [],
    value: amount
  })
}

export async function unwrap(publicClient: any, walletClient: any, token: TokenInfo, amount: bigint) {
  return await callContract(publicClient, walletClient, {
    address: token.address as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'withdraw',
    args: [amount],
  })
}
