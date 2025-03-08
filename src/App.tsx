
import { EthereumProvider } from './providers/EthereumProvider';
import { SolanaProvider } from './providers/SolanaProvider';

import { BitcoinWallet } from './component/BitcoinWallet';
import { EthereumWallet } from './component/EthereumWallet';
import { SolanaWallet } from './component/SolanaWallet';
import { useEffect, useState } from 'react';
import { Input } from 'antd';
import { useQuote } from './hooks/useQuote';

type QuoteParams = {
  token: string;
  address: string;
  chain: "ETH" | "SOL",
}
function App() {
  const [selectedEthToken, setSelectedEthToken] = useState<QuoteParams>();
  const [selectedSolToken, setSelectedSolToken] = useState<QuoteParams>();
  const [amount, setAmount] = useState(0);

  const { quoteData, isQuoteDataError, isQuoteDataLoading, error, refetchQuote } = useQuote(
    selectedEthToken, 
    selectedSolToken, 
    amount
  );

  // console.log(isQuoteDataError, error);
  // console.log(amount);
  // console.log(selectedEthToken, selectedSolToken);

  useEffect(() => {
    refetchQuote();
  }, [selectedEthToken, selectedSolToken, amount]);

  return (
    <div className='flex flex-col mx-auto my-20 w-fit items-center'>
      <div className='flex justify-center mx-auto my-20 w-fit'>
        <div className='mx-5'>
            <EthereumProvider>
              <EthereumWallet 
                onSelectToken={(value: QuoteParams) => setSelectedEthToken(value)} 
              />
            </EthereumProvider>
        </div>

        <BitcoinWallet />

        <div className='mx-5'>
          <SolanaProvider>
            <SolanaWallet 
              onSelectToken={(value: QuoteParams) => setSelectedSolToken(value)} />
          </SolanaProvider>
        </div>
      </div>

      <Input type="text" placeholder="Enter amount" className="w-[200px]" disabled={!selectedEthToken || !selectedSolToken} onChange={(e: any) => setAmount(e.target.value)} />
    </div>

  )
}

export default App
