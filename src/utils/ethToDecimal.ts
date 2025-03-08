import { formatUnits } from "viem/utils";

export const toDecimal = (balance: bigint) => formatUnits(balance, 18);