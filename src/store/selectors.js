import { createSelector } from 'reselect';
import { get, groupBy, reject, minBy, maxBy } from 'lodash';
import { ethers } from 'ethers';
import moment from 'moment';

const tokens = (state) => get(state, 'tokens.contracts');
const allOrders = (state) => get(state, 'exchange.allOrders.data', []);
const cancelledOrders = (state) => get(state, 'exchange.cancelledOrders.data', []);
const filledOrders = (state) => get(state, 'exchange.filledOrders.data', []);

const openOrders = (state) => {
	const all = allOrders(state);
	const filled = filledOrders(state);
	const cancelled = cancelledOrders(state);

	const openOrders = reject(all, (order) => {
		const orderFilled = filled.some((o) => o._id.toString() === order._id.toString());
		const orderCancelled = cancelled.some((o) => o._id.toString() === order._id.toString());
		return orderFilled || orderCancelled;
	});

	return openOrders;
};

const decorateOrder = (order, tokens) => {
	let token0Amount, token1Amount;

	// Reminder: MT shoudl be considered token0, mETH/mDAI should be considered token1
	if (order._tokenGive === tokens[0].address) {
		token0Amount = order._amountGive; //The amount of MT we're giving.
		token1Amount = order._amountGet; //The amount of mETH/mDAI we want.
	} else {
		token0Amount = order._amountGet; // The amount MT we want.
		token1Amount = order._amountGive; // The amount mETH/mDAI we're giving.
	}

	// Calculate token price and round it to 5 decimal places
	const precision = 100000;
	let tokenPrice = token1Amount / token0Amount;
	tokenPrice = Math.round(tokenPrice * precision) / precision;

	return {
		...order,
		_token0Amount: ethers.utils.formatUnits(token0Amount, 18),
		_token1Amount: ethers.utils.formatUnits(token1Amount, 18),
		_tokenPrice: tokenPrice,
		_formattedTimestamp: moment.unix(order._timestamp).format(), // A JavaScript library
	};
};

export const orderBookSelector = createSelector(openOrders, tokens, (orders, tokens) => {
	if (!tokens[0] || !tokens[1]) {
		return;
	}
	// Filter orders by selected tokens
	orders = orders.filter((o) => o._tokenGet === tokens[0].address || o._tokenGet === tokens[1].address);
	orders = orders.filter((o) => o._tokenGive === tokens[0].address || o._tokenGive === tokens[1].address);

	// Decorate orders
	orders = decorateOrderBookOrders(orders, tokens);

	// Group orders by order type
	orders = groupBy(orders, '_orderType');

	// Fetch buy orders
	const buyOrders = get(orders, 'buy', []);

	// Sort buy orders by token price (from highest price to lowest price)
	orders = {
		...orders,
		buyOrders: buyOrders.sort((a, b) => b._tokenPrice - a._tokenPrice),
	};
	// Fetch sell orders
	const sellOrders = get(orders, 'sell', []);

	// Sort sell orders by token price (from highest price to lowest price)
	orders = {
		...orders,
		sellOrders: sellOrders.sort((a, b) => b._tokenPrice - a._tokenPrice),
	};
	return orders;
});

const decorateOrderBookOrders = (orders, tokens) => {
	return orders.map((order) => {
		order = decorateOrder(order, tokens);
		order = decorateOrderBookOrder(order, tokens);
		return order;
	});
};

const GREEN = '#25CE8F';
const RED = '#F45353';

const decorateOrderBookOrder = (order, tokens) => {
	const orderType = order._tokenGive === tokens[1].address ? 'buy' : 'sell';

	return {
		...order,
		_orderType: orderType,
		_orderTypeClass: orderType === 'buy' ? GREEN : RED,
		_orderFillAction: orderType === 'buy' ? 'sell' : 'buy',
	};
};

export const priceChartSelector = createSelector(filledOrders, tokens, (orders, tokens) => {
	if (!tokens[0] || !tokens[1]) {
		return;
	}

	// Filter orders by selected token.
	orders = orders.filter((o) => o._tokenGet === tokens[0].address || o._tokenGet === tokens[1].address);
	orders = orders.filter((o) => o._tokenGive === tokens[0].address || o._tokenGive === tokens[1].address);

	// Sort orders by date ascending
	orders = orders.sort((a, b) => a._timestamp - b._timestamp);
	// Decorate orders
	orders = orders.map((o) => decorateOrder(o, tokens));

	// Get last two orders for final price & price change
	let secondLastOrder, lastOrder;
	[secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length);

	// Get last order price
	const lastPrice = get(lastOrder, '_tokenPrice', 0);

	// Get second last order price
	const secondLastPrice = get(secondLastOrder, '_tokenPrice', 0);

	return {
		lastPrice,
		lastPriceChange: lastPrice >= secondLastPrice ? '+' : '-',
		series: [
			{
				data: buildGraphData(orders),
			},
		],
	};
});

const buildGraphData = (orders) => {
	// Group orders by timestamp
	orders = groupBy(orders, (o) => moment.unix(o._timestamp).startOf('hour').format());

	const hours = Object.keys(orders);
	const graphData = hours.map((hour) => {
		// Fetch all orders from current hour
		const group = orders[hour];

		// Calulate price values: open, high, low, close
		const open = group[0];
		const high = maxBy(group, '_tokenPrice');
		const low = minBy(group, '_tokenPrice');
		const close = group[group.length - 1];

		return {
			x: new Date(hour),
			y: [open._tokenPrice, high._tokenPrice, low._tokenPrice, close._tokenPrice],
		};
	});
	return graphData;
};

export const filledOrderSelector = createSelector(filledOrders, tokens, (orders, tokens) => {
	if (!tokens[0] || !tokens[1]) {
		return;
	}

	// Filter orders by selected tokens
	orders = orders.filter((o) => o._tokenGet === tokens[0].address || o._tokenGet === tokens[1].address);
	orders = orders.filter((o) => o._tokenGive === tokens[0].address || o._tokenGive === tokens[1].address);

	// Step 1: Sort orders by time ascending
	orders = orders.sort((a, b) => a._timiestamp - b._timiestamp);
	// Step 2: Apply order colors (decorate order)

	// Decorate orders
	orders = decorateFilledOrders(orders, tokens);

	// Step 3: Sort orders by time descending for UI
	orders = orders.sort((a, b) => b._timiestamp - a._timiestamp);

	return orders;
});

const decorateFilledOrders = (orders, tokens) => {
	return orders.map((order) => {
		// Track previous order to compare history
		let previousOrder = orders[0];
		// decorate each individual order
		order = decorateOrder(order, tokens);
		order = decorateFilledOrder(order, previousOrder);
		previousOrder = order;
		return order;
	});
};

const decorateFilledOrder = (order, previousOrder) => {
	return { ...order, _tokenPriceClass: tokenPriceClass(order._tokenPrice, order._id, previousOrder) };
};

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
	// Show green price if only one order exists
	if (previousOrder._id === orderId) {
		return GREEN;
	}
	// Show green price if order price is higher than previous order price
	// Show red price if order price is lower than previous order price
	if (previousOrder._tokenPrice <= tokenPrice) {
		return GREEN;
	} else {
		return RED;
	}
};