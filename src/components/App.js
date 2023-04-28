import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadProvider } from '../store/interactions.js';
import { loadNetwork } from '../store/interactions.js';
import { ethers } from 'ethers'; // We need ethers to connect to the blockchain.
import TOKEN_ABI from '../abis/Token.json';
import config from '../config.json';

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    console.log(accounts[0]);

    // Connect to the blockchain
    const provider = loadProvider(dispatch);
    const chainId = await loadNetwork(provider, dispatch);

    //Token smart contract
    const MT = new ethers.Contract(
      config[chainId].MT.address,
      TOKEN_ABI,
      provider
    );
    console.log(MT.address);
    const MTSymbol = MT.symbol();
    console.log(MTSymbol);
  };
  useEffect(() => {
    loadBlockchainData();
  });
  return (
    <div className='App'>
      <div>
        {/* Navbar */}

        <main className='exchange grid'>
          <section className='exchange__section--left grid'>
            {/* Markets */}

            {/* Balance */}

            {/* Order */}
          </section>
          <section className='exchange__section--right grid'>
            {/* PriceChart */}

            {/* Transactions */}

            {/* Trades */}

            {/* OrderBook */}
          </section>
        </main>

        {/* Alert */}
      </div>
    </div>
  );
}

export default App;
