import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { BitcoinWallet } from "@/component/BitcoinWallet";
import { AddressPurpose, AddressType, request } from "sats-connect";

const mockConnect = () => {
    // mock wallet_connect response
    vi.mocked(request).mockResolvedValueOnce({
        status: "success",
        result: {
            addresses: [
                { 
                    publicKey: "test-public-key", 
                    purpose: AddressPurpose.Payment,
                    address: "test-address",
                    addressType: AddressType.p2pkh
                }
            ],
            walletType: "software",
            id: "0"
        }
    });

    // mock getBalance response
    vi.mocked(request).mockResolvedValueOnce({
        status: "success",
        result: {
            confirmed: "0.05",
            total: "0.05",
            unconfirmed: "0"
        }
    });
}

vi.mock("sats-connect", async (importOriginal) => {
    const actual: {} = await importOriginal();
    return {
        ...actual,
        request: vi.fn()
    };
});

describe("BitcoinWallet", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(cleanup);

    it("renders the connector component with initial props", () => {
        render(<BitcoinWallet />);
        
        const connectButton = screen.getByTestId("BTC-connect");
        expect(connectButton).toBeDefined();
    });

    it("connects and displays the bitcoin address and balance", async () => {
        mockConnect();
        render(<BitcoinWallet />);
        
        const connectButton = screen.getByTestId("BTC-connect");
        fireEvent.click(connectButton);

        await waitFor(() => {
            expect(screen.getByTestId("public-key")).toBeDefined();
            expect(screen.getByTestId("balance")).toBeDefined();
        });
    });
});