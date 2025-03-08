import { toDecimal } from "@/utils/ethToDecimal";
import { useMemo } from "react";
import { useAccount, useBalance, useBlockNumber } from "wagmi";

export const useEthereumBalance = () => {
    const { address, chainId } = useAccount();

    useBlockNumber({ watch: true });
    const { data: ethBalance } = useBalance({
        address,
        chainId
    });

    const balanceOfEth = useMemo(() => {
        if (!ethBalance) return undefined;
        return toDecimal(ethBalance.value);
    }, [ethBalance]);

    return balanceOfEth;
}