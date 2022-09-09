require('dotenv').config()

import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-typechain';
import 'hardhat-deploy';
require("@nomiclabs/hardhat-etherscan")
const { POLYGONSCAN_API_KEY } = process.env;
console.log({POLYGONSCAN_API_KEY})

// You have to export an object to set up your config
// This object can have the following optional entries:
// defaultNetwork, networks, solc, and paths.
// Go to https://buidler.dev/config/ to learn more
module.exports = {
  defaultNetwork: 'polygon',
  networks: {
    hardhat: {},

    polygon: {
      url: 'https://polygon-rpc.com'
    }
  },
  etherscan: {
    apiKey: POLYGONSCAN_API_KEY,
  },
  solidity: {
    compilers: [
      {
        version: '0.5.0',
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000000
          },
        },
      },
    ],
  },
};
