import ERC20ABI from "@/config/abi/ERC20.json"
import { TokenInfo } from "@/types"
import { callContract } from "./callContract"
import { Abi } from "viem"

export async function approveToken(
  publicClient: any,
  walletClient: any,
  token: TokenInfo,
  spenderAddress: string,
  amount: bigint,
) {
  return await callContract(
    publicClient,
    walletClient,
    {
      address: token.address as `0x${string}`,
      abi: ERC20ABI as Abi,
      functionName: "approve",
      args: [spenderAddress as `0x${string}`, amount],
    }
  )
}

export async function getAllowance(publicClient: any, token: TokenInfo, account: `0x${string}`, spender: string) {
  return await publicClient.readContract({
    address: token.address as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [account, spender]
  })
}

export async function getTokenBalance(publicClient: any, token: TokenInfo, account: `0x${string}`) {
  if (token.isNative) {
    return await publicClient.getBalance({
      address: account,
    })
  }
  return await publicClient.readContract({
    address: token.address as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [account]
  })
}
