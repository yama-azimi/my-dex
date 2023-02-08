require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.17',

  network: {
    localhost: {
      URL: 'http://127.0.0.1:8545/',
    },
  },
};
