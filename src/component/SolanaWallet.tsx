import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Connection } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { SiSolana } from "react-icons/si";
import { Select } from "antd";

import { useTokenList } from "@/hooks/useTokenList";
import { useTokenBalances } from "@/hooks/useTokenBalances";

import { Connector } from "./Connector";

import "@solana/wallet-adapter-react-ui/styles.css"
import { toSol } from "@/utils/toSol";
import { Token } from "@/types/token";
import { TokenBalance } from "@/types/balance";
import { QuoteParams } from "@/types/quoteParams";

const SOLANA_CHAIN_ID = 1151111081099710;

export const SolanaWallet = ({ onSelectToken }: { onSelectToken: (params: QuoteParams) => void }) => {
    const { wallet, connect, disconnect } = useWallet();
    const [solBalance, setSolBalance] = useState<number>(0);
    const [chainId, setChainId] = useState<number | undefined>(undefined);
    const [address, setAddress] = useState<string | undefined>();

    const { setVisible } = useWalletModal();
    
    const { tokenList, isTokenListError, isTokenListLoading, tokenListError } = useTokenList(chainId!);
    const { balanceData, isTokenBalanceError, isTokenBalanceLoading } = useTokenBalances(address!, chainId!);

    const handleConnect = async () => {
        if (!wallet?.adapter) {
            setVisible(true);
        }
    };

    useEffect(() => {
        if (!wallet?.adapter.connected) {
            setChainId(undefined);
            setAddress(undefined);
        } else {
            setChainId(SOLANA_CHAIN_ID);
            setAddress(wallet?.adapter.publicKey?.toString());
        }
    }, [wallet?.adapter.connected]);

    useEffect(() => {
        if (!wallet?.adapter) {
            return;
        } 
        
        if(!wallet.adapter.connected) {
            connect().then().catch(() => {
                alert(`Failed to connect Solana wallet.`);
            });
        }

        const connection = new Connection(`https://rpc.helius.xyz/?api-key=${import.meta.env.VITE_HELIUS_API_KEY}`);
        let subscriptionId: number;

        const updateBalance = async () => {
            const balanceInLamports = await connection.getBalance(wallet.adapter.publicKey!);
            setSolBalance(toSol(balanceInLamports));
        };

        wallet?.adapter.on("connect", async () => {
            await updateBalance();

            subscriptionId = connection.onAccountChange(wallet.adapter.publicKey!, accountInfo => {
                const newBalanceInLamports = accountInfo.lamports;
                setSolBalance(toSol(newBalanceInLamports));
            });             
        });

        return () => {
            if (subscriptionId) {
                connection.removeAccountChangeListener(subscriptionId);
            }

            wallet?.adapter.off("connect", updateBalance);
        };
    }, [wallet?.adapter, connect]);

    // we render the gas token item in isolation so we dont force the whole list (balances) to re render on solana balance changes
    const solBalanceItem = useMemo(() => {
        if (!tokenList) return;

        return {
            label: (
                <div className="flex gap-5 items-center">
                    {tokenList[0].logoURI && <img src={tokenList[0].logoURI} className="w-6 h-6" />}
                    <span>{`${Number(solBalance) > 0 ? Number(solBalance).toFixed(4) : ""} ${tokenList[0].symbol}`}</span>
                </div>
            ),
            value: tokenList[0].address
        }
    }, [solBalance, tokenList]);

    const tokenBalanceItems = useMemo(() => {
        if (!tokenList || !balanceData) {
            return undefined;
        }

        const balanceAddresses = new Map(
            balanceData?.map((balance: TokenBalance) => [
                balance.contractAddress.toLowerCase(),
                balance.tokenBalance
            ])
        );

        return tokenList.slice(1).map((token: Token) => {
            const balance = balanceAddresses.get(token.address.toLowerCase());

            return {
                label: (
                    <div className="flex gap-5 items-center">
                        {token.logoURI && <img src={token.logoURI} className="w-6 h-6" />}
                        <span>{`${Number(balance) > 0 ? Number(balance).toFixed(4) : ""} ${token.symbol}`}</span>
                    </div>
                ),
                value: token.address
            }
        });
    }, [tokenList, balanceData]);

    const isLoading = isTokenListLoading || isTokenBalanceLoading;
    const isError = isTokenListError || isTokenBalanceError;
    
    useEffect(() => {
        onSelectToken({
            token: tokenList?.[0].address,
            address,
            chain: "SOL"
        })
    }, [tokenList]);

    return (  
        <div className="flex flex-col gap-5 mt-[300px]">
            <Connector 
                balance={solBalance}
                publicKey={address}
                unit="SOL"
                icon={<SiSolana className="text-white text-[80px]" />} 
                iconColor="bg-purple-400" 
                onConnect={handleConnect} 
                onDisconnect={disconnect} 
                isConnected={wallet?.adapter.connected === true} 
                walletIcon={wallet?.adapter.icon} 
            />
            {chainId && solBalanceItem && tokenBalanceItems && 
                <Select className="w-full" defaultValue={solBalanceItem?.value} options={[solBalanceItem, ...tokenBalanceItems]}
                    onSelect={(value: string) => onSelectToken({
                        token: value,
                        address,
                        chain: "SOL"
                    })} />} 
            {isLoading && !isError && <p className="text-black text-center">Getting tokens...</p>}
            {isError && <p className="text-red-600 text-center">{tokenListError?.message}</p>}
        </div> 
    );
}
