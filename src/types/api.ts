export type Account = {
    account: {
        data: {
            parsed: {
                info: {
                    mint: string;
                    owner: string;
                    tokenAmount: {
                        amount: string;
                        decimals: number;
                        uiAmount: number;
                        uiAmountString: string;
                    }
                }
                type: string;
            }
        }
    }
}