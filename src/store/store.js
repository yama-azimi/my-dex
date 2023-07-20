import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// Import Reducers
import { provider, tokens, exchange } from './reducers.js';

const reducer = combineReducers({ provider, tokens, exchange });

const initialState = {
	// provider: {
	// 	connection: null, // Set the initial value to null or undefined
	// 	chainId: null, // Set the initial value to null or undefined
	// },
	// tokens: {},
	// exchange: {},
};
const middleware = [thunk];
const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)));

export default store;
