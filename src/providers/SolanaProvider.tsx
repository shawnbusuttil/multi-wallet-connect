import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const solWallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
];
  
const network = `https://api.${WalletAdapterNetwork.Mainnet}.solana.com`;
  
const queryClient = new QueryClient();

export const SolanaProvider = ({ children }: { children: React.ReactNode }) => (
    <ConnectionProvider endpoint={network}>
        <WalletProvider wallets={solWallets} autoConnect={false}>
            <WalletModalProvider>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </WalletModalProvider>
        </WalletProvider>
    </ConnectionProvider>
);