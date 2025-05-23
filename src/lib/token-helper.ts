import ERC20ABI from "@/config/abi/ERC20.json"
import { TokenInfo } from "@/types"

export async function approveToken(
  walletClient: any,
  token: TokenInfo,
  spenderAddress: string,
  amount: bigint
) {
  return await walletClient.writeContract({
    address: token.address as `0x${string}`,
    abi: ERC20ABI,
    functionName: "approve",
    args: [spenderAddress as `0x${string}`, amount],
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
