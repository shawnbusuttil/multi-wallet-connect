import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EthereumWallet } from '@/component/EthereumWallet';
import { useAccount } from 'wagmi';
import { useEthereumBalance } from '@/hooks/useEthereumBalance';
import { useTokenList } from '@/hooks/useTokenList';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { EthereumProvider } from '@/providers/EthereumProvider';
import { ConnectButton } from '@rainbow-me/rainbowkit';

vi.mock("wagmi", async () => {
    const actual = await vi.importActual<typeof import("wagmi")>("wagmi");
    return {
        ...actual,
        useAccount: vi.fn()
    };
});

vi.mock("@rainbow-me/rainbowkit", async (importOriginal) => {
    const actual: {} = await importOriginal();
    return {
        ...actual,
        ConnectButton: {
            Custom: vi.fn(({ children }) => (
                <>
                    {children({
                        account: undefined,
                        chain: undefined,
                        mounted: false,
                        openConnectModal: vi.fn(),
                        openAccountModal: vi.fn()
                    })}
                </>
            ))
        }
    };
});

vi.mock("@/hooks/useEthereumBalance", () => ({
    useEthereumBalance: vi.fn(),
}));

vi.mock("@/hooks/useTokenList", () => ({
    useTokenList: vi.fn(),
}));

vi.mock("@/hooks/useTokenBalances", () => ({
    useTokenBalances: vi.fn(),
}));

const mockAccountUndefined = () => {
    vi.mocked(useAccount).mockReturnValue({
        connector: undefined,
        address: undefined,
        chainId: undefined
    } as any);
};

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

describe("EthereumWallet", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(cleanup);

    it("renders the connector", () => {
        mockAccountUndefined();
        vi.mocked(useEthereumBalance).mockReturnValue("0");
        mockTokenListUndefined();
        mockTokenBalancesUndefined();

        render(
            <EthereumProvider>
                <EthereumWallet />
            </EthereumProvider>
        );

        expect(screen.getByTestId("ETH-connect")).toBeDefined();
    });

    it("displays the public keyand eth balance after connecting wallet", async () => {
        vi.mocked(ConnectButton.Custom).mockImplementationOnce(({ children }: any) => (
            <>
                {children({
                    account: { address: 'test-public-key' },
                    chain: { id: 1 },
                    mounted: true,
                    openConnectModal: vi.fn(),
                    openAccountModal: vi.fn()
                })}
            </>
        ));

        vi.mocked(useEthereumBalance).mockReturnValue("0.05");
        
        render(
            <EthereumProvider>
                <EthereumWallet />
            </EthereumProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("public-key").textContent).toEqual("test...-key");
            expect(screen.getByTestId("balance").textContent).toEqual("0.0500 ETH");
        });
    });

    it("displays an error when token list fails to load", () => {
        mockAccountUndefined();
        vi.mocked(useEthereumBalance).mockReturnValue("0");
        vi.mocked(useTokenList).mockReturnValue({ 
            tokenList: undefined, 
            isTokenListError: true, 
            isTokenListLoading: false, 
            tokenListError: { name: "error", message: "Error loading token list" } 
        });
        vi.mocked(useTokenBalances).mockReturnValue({ balanceData: [], isTokenBalanceError: false, isTokenBalanceLoading: false });

        render(
            <EthereumProvider>
                <EthereumWallet />
            </EthereumProvider>
        );

        expect(screen.getByText("Error loading token list")).toBeDefined();
    });

    it("displays the token list and balances", async () => {
        vi.mocked(useAccount).mockReturnValue({
            address: "0x-publickey",
            chainId: 1
        } as any);

        vi.mocked(useEthereumBalance).mockReturnValue("0.05");
        vi.mocked(useTokenList).mockReturnValue({
            tokenList: [
                { 
                    address: "0x0000000000000000000000000000000000000000", 
                    symbol: "ETH", 
                    coinKey: "ETH", 
                    logoURI: "eth-logo.svg",
                    chainId: 1,
                    name: "Ethereum",
                    decimals: 18,
                    priceUSD: "3000"
                },
                { 
                    address: "0x1111111111111111111111111111111111111111", 
                    symbol: "USDT", 
                    coinKey: "USDT", 
                    logoURI: "usdt-logo.svg",
                    chainId: 1,
                    name: "USD Tether",
                    decimals: 18,
                    priceUSD: "1"
                }
            ], 
            isTokenListError: false, 
            isTokenListLoading: false,
            tokenListError: null
        });

        vi.mocked(useTokenBalances).mockReturnValue({
            balanceData: [
                { 
                    contractAddress: "0x1111111111111111111111111111111111111111",
                    tokenBalance: "1000000000000000000"
                }
            ],
            isTokenBalanceError: false,
            isTokenBalanceLoading: false
        });

        render(
            <EthereumProvider>
                <EthereumWallet />
            </EthereumProvider>
        );

        await waitFor(() => {
            expect(screen.getByRole("combobox")).toBeDefined();
        });

        const tokenList = screen.getByRole("combobox");
        userEvent.click(tokenList);

        screen.debug();
        await waitFor(() => {
            const eth = screen.getAllByText("0.0500 ETH");
            expect(eth).toBeDefined();
            const usdt = screen.getByText("1.0000 USDT");
            expect(usdt).toBeDefined();
        });
    });
});
