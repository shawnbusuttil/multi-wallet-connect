import { useMemo } from "react";
import { Select } from "antd";
import { SiEthereum } from "react-icons/si";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit"

import { useLastConnectedChain } from "@/hooks/useLastConnectedChain";

import { Connector } from "./Connector";

import '@rainbow-me/rainbowkit/styles.css';
import { useEthereumBalance } from "@/hooks/useEthereumBalance";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useTokenList } from "@/hooks/useTokenList";
import { TokenBalance } from "@/types/balance";
import { Token } from "@/types/token";
import { QuoteParams } from "@/types/quoteParams";

export const EthereumWallet = ({ onSelectToken } : { onSelectToken: (params: QuoteParams) => void }) => {
    const { connector, address, chainId } = useAccount();

    // metamask resets to the Ethereum mainnet on reload so we store the last connected chain
    useLastConnectedChain();

    const balanceOfEth = useEthereumBalance();

    const { tokenList, isTokenListError, isTokenListLoading, tokenListError } = useTokenList(chainId!);
    const { balanceData, isTokenBalanceError, isTokenBalanceLoading } = useTokenBalances(address!, chainId!);

    // we render the gas token item in isolation so we dont force the whole list (balances) to re render on solana balance changes
    const ethBalanceItem = useMemo(() => {
        if (!tokenList) return;

        return {
            label: (
                <div className="flex gap-5 items-center">
                    {tokenList[0].logoURI && <img src={tokenList[0].logoURI} className="w-6 h-6" />}
                    <span>{`${Number(balanceOfEth) > 0 ? Number(balanceOfEth).toFixed(4) : ""} ${tokenList[0].symbol}`}</span>
                </div>
            ),
            value: tokenList[0].address
        }
    }, [balanceOfEth, tokenList]);

    const tokenBalanceItems = useMemo(() => {
        if (!tokenList || !balanceData) {
            return undefined;
        }

        // using a map allows for faster lookups (constant time complexity)
        const balanceAddresses = new Map(
            balanceData?.map((balance: TokenBalance) => [
                balance.contractAddress.toLowerCase(),
                balance.tokenBalance
            ])
        );

        return tokenList.slice(1).map((token: Token) => {
            const hexBalance = balanceAddresses.get(token.address.toLowerCase()) || "0";

            const balance = formatUnits(
                BigInt(hexBalance),
                token.decimals
            );

            return {
                label: (
                    <div className="flex gap-5 items-center">
                        <img src={token.logoURI} className="w-6 h-6" />
                        <span>{`${Number(balance) > 0 ? Number(balance).toFixed(4) : ""} ${token.symbol}`}</span>
                    </div>
                ),
                value: token.address
            }
        });

    }, [tokenList, balanceData]);


    const isLoading = isTokenListLoading || isTokenBalanceLoading;
    const isError = isTokenListError || isTokenBalanceError;

    return (
        <div className="flex flex-col gap-5 mt-[300px]">
            <ConnectButton.Custom>
                {({
                    account,
                    chain,
                    mounted,
                    openAccountModal,
                    openConnectModal,
                }) => {
                    const isConnected = mounted && !!account && !!chain;

                    return (
                        <Connector 
                            publicKey={account?.address}
                            balance={Number(balanceOfEth) || 0}
                            unit={tokenList?.[0].coinKey || "ETH"}
                            icon={<SiEthereum className=" text-white" />}
                            iconColor="bg-indigo-400"
                            onConnect={openConnectModal} 
                            onDisconnect={openAccountModal} 
                            isConnected={isConnected} 
                            walletIcon={connector?.icon}
                        />
                    );
                }}
            </ConnectButton.Custom>
            {chainId && ethBalanceItem && tokenBalanceItems && <Select data-testid="token-list" className="w-full" defaultValue={ethBalanceItem?.value} options={[ethBalanceItem, ...tokenBalanceItems]} 
                onSelect={(value: string) => onSelectToken({
                    token: value,
                    address,
                    chain: tokenList?.[0].coinKey || "ETH"
                })} />}
            {isLoading && <p className="text-black text-center">Getting tokens...</p>}
            {isError && <p className="text-red-600 text-center">{tokenListError?.message}</p>}
        </div>
    );
};