import { useEffect, useState } from "react";
import { SiBitcoin } from "react-icons/si";
import { request, AddressPurpose } from "sats-connect";

import { Connector } from "@/component/Connector";

export const BitcoinWallet = () => {
    const [bitcoinAddress, setBitcoinAddress] = useState<string | undefined>(undefined);
    const [balance, setBalance] = useState<number | undefined>(undefined);

    const fetchBalance = async () => {
        try {
            const response = await request("getBalance", null);

            if (response.status === "success") {
                setBalance(parseFloat(response.result.confirmed));
              } else {
                console.error(response.error);
            }
        } catch (e) {
            console.error("ERROR", e)
        }
    }

    const connectBitcoin = async () => {
        try {
            const response = await request("wallet_connect", null);

            if (response.status === "success") {
                const paymentAddressItem = response.result.addresses.find((address) => 
                    address.purpose === AddressPurpose.Payment
                );

                setBitcoinAddress(paymentAddressItem?.publicKey);
            }
        } catch (err: any) {
            console.error(err)
        }
    };

    const disconnectBitcoin = async() => {
        try {
            const response = await request("wallet_disconnect", null);

            if (response.status === "success") {
                setBitcoinAddress(undefined);
                setBalance(undefined);
            }
        } catch (err: any) {
            alert(err.error.message);
        }
    }
    useEffect(() => {
        if (bitcoinAddress) {
            fetchBalance();
        }
    }, [bitcoinAddress]);

    return <Connector 
        balance={balance}
        unit="BTC"
        publicKey={bitcoinAddress}
        icon={<SiBitcoin className="text-white" />}
        iconColor="bg-orange-400"
        onConnect={connectBitcoin} 
        onDisconnect={disconnectBitcoin} 
        isConnected={!!bitcoinAddress}
    />
};