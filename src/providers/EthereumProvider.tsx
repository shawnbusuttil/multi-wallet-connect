import React, { createContext } from "react";

import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { base, mainnet, polygon, sepolia } from "wagmi/chains";

const config = getDefaultConfig({
    appName: "Multi Wallet-Connect",
    projectId: "4bc9739b0c67453754e8a9e71a346c38",
    chains: [
        base,
        mainnet, 
        polygon, 
        sepolia
    ]
});

const queryClient = new QueryClient();

export const EthereumProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}







