import { TokenInfo } from "@/types"
import { getPoolAddress, getPoolState, calculatePairedTokenAmount } from "./pool-helper";
import { zeroAddress } from "viem";
import { FEE_TIERS } from "@/config";
import { UNISWAP_V3_CONTRACTS } from "@/config/uniswap";
import UniswapRouterABI from "@/config/abi/UniswapRouter.json";


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

export async function swap(publicClient: any, walletClient: any, tokenIn: TokenInfo, tokenOut: TokenInfo, amountIn: bigint, fee: number, account: `0x${string}`, slippage = 0.05) {
  const poolAddress = await getPoolAddress(publicClient, tokenIn, tokenOut, fee);
  if (!poolAddress) throw new Error('Pool not found');

  const { tick, sqrtPriceX96 } = await getPoolState(publicClient, poolAddress);
  
  // Calculate expected output amount
  const expectedOutput = calculatePairedTokenAmount({
    token0: tokenIn,
    token1: tokenOut,
    fee,
    sqrtPriceX96,
    tick,
    tickLower: tick - 100,
    tickUpper: tick + 100,
    knownToken: 'token0',
    knownAmountRaw: amountIn
  });

  // Calculate minimum output with slippage
  const amountOutMin = BigInt(expectedOutput) * BigInt(Math.floor((1 - slippage) * 1e6)) / BigInt(1e6);

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
      amountOutMinimum: amountOutMin,
      sqrtPriceLimitX96: 0n,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 600),
    }]
  })
}
