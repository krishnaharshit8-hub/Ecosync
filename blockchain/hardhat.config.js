require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config({ path: '../.env' });

module.exports = {
  solidity: '0.8.19',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545'
    },
    mumbai: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80001,
      gasPrice: 35000000000, // 35 gwei
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || ''
    }
  }
};
