import { trimAddress } from "@/utils/trimAddress";
import React from "react";
import { TbPlug, TbPlugOff } from "react-icons/tb";

type Props = {
    publicKey?: string;
    balance?: number;
    unit?: string;
    isConnected: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
    icon?: React.ReactNode;
    iconColor?: string;
    walletIcon?: string;
}

export const Connector = ({
    publicKey,
    balance, 
    unit,
    icon,
    iconColor,
    isConnected,
    onConnect, 
    onDisconnect,
    walletIcon
}: Props) => {

    return (
        <div className="flex flex-col items-center gap-5">
            <div className={`w-[200px] h-[200px] relative flex items-center justify-center`}>
                <div className={`w-full h-full text-[100px] flex items-center justify-center rounded-full p-6 ${iconColor} ${!isConnected && 'grayscale'}`}>{icon}</div>
                {isConnected && <button data-testid={`${unit}-disconnect`} onClick={onDisconnect} className="absolute flex items-center justify-center right-0 top-[70%] w-14 h-14 rounded-[100px] text-[28px] p-2">
                    {walletIcon ? <img src={walletIcon} /> : <TbPlugOff />}
                </button>}
                {!isConnected && <button data-testid={`${unit}-connect`} onClick={isConnected ? onDisconnect : onConnect} className="absolute flex items-center justify-center right-0 top-[70%] w-14 h-14 rounded-[100px] text-[28px] p-2">
                    {isConnected ? walletIcon ? <img src={walletIcon} /> : <TbPlugOff /> : <TbPlug />}
                </button>}
            </div>

            {publicKey !== undefined && balance !== undefined &&  (
                <div className="flex gap-1 text-black text-sm md:text-lg">
                    <span data-testid="public-key">
                        {trimAddress(publicKey)}
                    </span>
                    <span>-</span>
                    <span data-testid="balance">
                        {`${balance > 0 ? balance.toFixed(4) : balance} ${unit}`}
                    </span>
                </div>
            )} 
        </div>
    );
}