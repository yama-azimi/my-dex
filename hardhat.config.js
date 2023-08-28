require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
require('@nomiclabs/hardhat-etherscan');

const privateKeys = process.env.PRIVATE_KEYS || '';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: '0.8.17',

	networks: {
		localhost: {
			URL: 'http://127.0.0.1:8545/',
		},

		sepolia: {
			url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_SEPOLIA_API_KEY}`,
			accounts: privateKeys.split(','),
		},
		goerli: {
			url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_GOERLI_API_KEY}`,
			accounts: privateKeys.split(','),
		},
	},

	etherscan: {
		// Your API key for Etherscan
		// Obtain one at https://etherscan.io/
		apiKey: 'YOUR_ETHERSCAN_API_KEY',
	},
};
