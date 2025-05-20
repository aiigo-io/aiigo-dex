import { TokenInfo } from "@/types";
import { useProtocol } from "./useProtocol";
import { getTokens } from "@/config/tokens";

export function useTokens(): TokenInfo[] {
  const { chainId } = useProtocol();
  return getTokens(chainId);
}