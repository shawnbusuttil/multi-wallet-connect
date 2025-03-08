import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SolanaWallet } from '@/component/SolanaWallet';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Connection } from '@solana/web3.js';
import { useTokenList } from '@/hooks/useTokenList';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { SolanaProvider } from '@/providers/SolanaProvider';
import { EventEmitter } from "events";
import userEvent from '@testing-library/user-event';

const mockEventEmitter = new EventEmitter();

vi.mock(import("@solana/wallet-adapter-react"), async (importOriginal) => {
    const actual = await importOriginal()
    return {
      ...actual,
      useWallet: vi.fn()
    }
});

vi.mock(import("@solana/wallet-adapter-react-ui"), async (importOriginal) => {
    const actual = await importOriginal()
    return {
      ...actual,
      useWalletModal: vi.fn()
    }
});

vi.mock("@solana/web3.js", () => ({
    Connection: vi.fn(),
}));

vi.mock("@/hooks/useTokenList", () => ({
    useTokenList: vi.fn(),
}));

vi.mock("@/hooks/useTokenBalances", () => ({
    useTokenBalances: vi.fn(),
}));

const mockWallet = {
    wallet: {
        adapter: {
            connected: false,
            publicKey: { toString: () => "test-public-key" },
            icon: "mock-icon",
            on: mockEventEmitter.on.bind(mockEventEmitter),
            off: mockEventEmitter.off.bind(mockEventEmitter),
        },
    },
    connect: vi.fn().mockImplementation(async () => {
        return Promise.resolve().then(() => {
            mockWallet.wallet.adapter.connected = true;
            mockEventEmitter.emit("connect");
        });
    }),
    disconnect: vi.fn(),
} as any;

const mockUseWalletModal = {
    setVisible: vi.fn(),
    visible: false
};

const mockConnection = {
    getBalance: vi.fn(),
    onAccountChange: vi.fn(),
    removeAccountChangeListener: vi.fn(),
} as any;

const mockTokenListUndefined = () => {
    vi.mocked(useTokenList).mockReturnValue({ 
        tokenList: undefined, 
        isTokenListError: false, 
        isTokenListLoading: false 
    } as any);
}

const mockTokenBalancesUndefined = () => {
    vi.mocked(useTokenBalances).mockReturnValue({ 
        balanceData: undefined, 
        isTokenBalanceError: false, 
        isTokenBalanceLoading: false
    });
}

describe("Solana Wallet", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useWalletModal).mockReturnValue(mockUseWalletModal);

        vi.mocked(Connection).mockImplementationOnce(() => mockConnection);
        mockConnection.getBalance.mockResolvedValue(1000000000); // 1 SOL in lamports
    });

    it("renders the connector when not connected", () => {
        vi.mocked(useWallet).mockReturnValue({
            ...mockWallet,
            wallet: {
                adapter: { 
                    ...mockWallet.wallet.adapter, 
                    connected: false 
                },
            }
        } as any);
        mockTokenListUndefined();
        mockTokenBalancesUndefined();

        render(
            <SolanaProvider>
                <SolanaWallet />
            </SolanaProvider>
        );

        expect(screen.getByTestId("SOL-connect")).toBeDefined();
    });

    it("displays the public key and SOL balance after connecting", async () => {
        vi.mocked(useWallet).mockReturnValue({
            ...mockWallet,
            wallet: {
                adapter: { 
                    ...mockWallet.wallet.adapter, 
                    connected: true 
                },
            }
        } as any);

        mockTokenListUndefined();
        mockTokenBalancesUndefined();

        render(
            <SolanaProvider>
                <SolanaWallet />
            </SolanaProvider>
        );

        await waitFor(() => {
            expect(screen.getAllByTestId("public-key")[0].textContent).toEqual("test...-key");
            expect(screen.getAllByTestId("balance")[0].textContent).toEqual("1.0000 SOL");
        })
    });

    it("displays an error when token list fails to load", () => {
        vi.mocked(useWallet).mockReturnValue({
            ...mockWallet,
            wallet: {
                adapter: { 
                    ...mockWallet.wallet.adapter, 
                    connected: true 
                },
            }
        } as any);

        vi.mocked(useTokenList).mockReturnValue({ 
            tokenList: undefined, 
            isTokenListError: true, 
            isTokenListLoading: false, 
            tokenListError: { name: "error", message: "Error loading token list" } 
        });
        vi.mocked(useTokenBalances).mockReturnValue({ balanceData: [], isTokenBalanceError: false, isTokenBalanceLoading: false });

        render(
            <SolanaProvider>
                <SolanaWallet />
            </SolanaProvider>
        );

        expect(screen.getByText("Error loading token list")).toBeDefined();
    });

    it("displays the token list and balances", async () => {
        vi.mocked(useWallet).mockReturnValue({
            ...mockWallet,
            wallet: {
                adapter: { 
                    ...mockWallet.wallet.adapter, 
                    connected: true 
                },
            }
        } as any);

        vi.mocked(useTokenList).mockReturnValue({
            tokenList: [
                {
                    address: "0x0000000000000000000000000000000000000000",
                    symbol: "SOL",
                    coinKey: "SOL",
                    logoURI: "sol-logo.svg",
                    chainId: 1151111081099710,
                    name: "Solana",
                    decimals: 9,
                    priceUSD: "100",
                },
                {
                    address: "0x1111111111111111111111111111111111111111",
                    symbol: "USDC",
                    coinKey: "USDC",
                    logoURI: "usdc-logo.svg",
                    chainId: 1151111081099710,
                    name: "USD Coin",
                    decimals: 6,
                    priceUSD: "1",
                },
            ],
            isTokenListError: false,
            isTokenListLoading: false,
            tokenListError: null,
        });

        vi.mocked(useTokenBalances).mockReturnValue({
            balanceData: [
                {
                    contractAddress: "0x1111111111111111111111111111111111111111",
                    tokenBalance: "1", // 1 USDC
                },
            ],
            isTokenBalanceError: false,
            isTokenBalanceLoading: false,
        });

        render(
            <SolanaProvider>
                <SolanaWallet />
            </SolanaProvider>
        );

        await waitFor(() => {
            expect(screen.getByRole("combobox")).toBeDefined();
        });

        const tokenList = screen.getByRole("combobox");
        userEvent.click(tokenList);

        await waitFor(() => {
            const sol = screen.getByText("1.0000 SOL");
            expect(sol).toBeDefined();
            const usdc = screen.getByText("1.0000 USDC");
            expect(usdc).toBeDefined();
        });
    });
});