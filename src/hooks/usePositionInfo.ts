import { usePoolInfo } from "./usePoolInfo";
import { Position, Pool} from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import { TokenInfo } from "@/types";
import JSBI from 'jsbi';
import { DEFAULT_CHAIN_ID } from "@/config/chains";

export function usePositionInfo(token0: TokenInfo, token1: TokenInfo, fee: number, liquidity: bigint, lowerTick: number, upperTick: number) {
  const { sqrtPriceX96, currentTick } = usePoolInfo(token0, token1, fee);
  if (!currentTick && currentTick !== 0) return null;
  const pool = new Pool(
    new Token(token0.chainId, token0.address, token0.decimals),
    new Token(token1.chainId, token1.address, token1.decimals),
    fee,
    JSBI.BigInt(sqrtPriceX96.toString()),
    JSBI.BigInt(liquidity.toString()),
    currentTick
  );
  const position = new Position({
    pool,
    liquidity: JSBI.BigInt(liquidity.toString()),
    tickLower: lowerTick,
    tickUpper: upperTick
  });
  return position;
}