require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
require('@nomiclabs/hardhat-etherscan');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.17',

  network: {
    localhost: {
      URL: 'http://127.0.0.1:8545/',
    },
  },

  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: 'YOUR_ETHERSCAN_API_KEY',
  },
};
