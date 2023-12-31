import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';
import { loadProvider, loadNetwork, loadAccount, loadTokens, loadExchange, subscribeToEvents, loadAllOrders } from '../store/interactions.js';
import Navbar from './Navbar';
import Markets from './Markets';
import Balance from './Balance';
import Order from './Order';
import OrderBook from './OrderBook';
import PriceChart from './PriceChart';
import Trades from './Trades';
import Transactions from './Transactions';
import Alert from './Alert';

function App() {
	const dispatch = useDispatch();

	const loadBlockchainData = async () => {
		// Connect to the blockchain
		// await is added.
		const provider = await loadProvider(dispatch);
		// this if statement is added.
		if (!provider) {
			// Handle provider loading failure
			console.error('Failed to load provider');
			return;
		}
		const chainId = await loadNetwork(provider, dispatch);

		// Reload page when network changes.
		window.ethereum.on('chainChanged', () => {
			window.location.reload();
		});
		// Fetch account and balance from Metamask if they're changed.
		window.ethereum.on('accountsChanged', async () => {
			await loadAccount(provider, dispatch);
		});

		//Token smart contract
		const MT = config[chainId].MT.address;
		const mETH = config[chainId].mETH.address;
		// const mDAI = config[chainId].mDAI.address;
		await loadTokens(provider, [MT, mETH], dispatch);

		// Exchange contract
		const exchangeAddress = config[chainId].exchange.address;
		const exchange = await loadExchange(provider, exchangeAddress, dispatch);
		// Fetch all orders: open, filled, canceled.
		loadAllOrders(provider, exchange, dispatch);
		// Listen to events
		subscribeToEvents(exchange, dispatch);
	};
	useEffect(() => {
		loadBlockchainData();
	});
	return (
		<div className='App'>
			<div>
				<Navbar />

				<main className='exchange grid'>
					<section className='exchange__section--left grid'>
						<Markets />

						<Balance />

						<Order />
					</section>
					<section className='exchange__section--right grid'>
						<PriceChart />

						<Transactions />

						<Trades />

						<OrderBook />
					</section>
				</main>

				<Alert />
			</div>
		</div>
	);
}

export default App;
