import { useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";

export const useLastConnectedChain = () => {
    const { chainId } = useAccount();
    const { switchChain } = useSwitchChain();    

    useEffect(() => {
        const lastConnectedChainId = localStorage.getItem("lastConnectedChainId");

        if (lastConnectedChainId && chainId !== Number(lastConnectedChainId)) {
            switchChain({ chainId: Number(lastConnectedChainId) });
        }
    }, []);

    useEffect(() => {
        if (chainId) {
          localStorage.setItem("lastConnectedChainId", chainId.toString());
        }
    }, [chainId]);
}