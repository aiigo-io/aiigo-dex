import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CurrencyAmount, Token } from '@uniswap/sdk-core';
import { zeroAddress } from "viem";
import JSBI from 'jsbi';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, padRight = 4, padLeft = 6) {
  if (!address) return undefined;
  return address.slice(0, padLeft) + '...' + address.slice(address.length - padRight, address.length);
}

export function balanceFormat (balances: bigint, decimals = 18, significant = 6) {
  const _token = new Token(1, zeroAddress, decimals, `-`, `-`)
  return CurrencyAmount.fromRawAmount(_token, JSBI.BigInt(balances.toString())).toSignificant(significant)
}