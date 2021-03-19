import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-typechain';
import 'hardhat-deploy';
import "@nomiclabs/hardhat-etherscan";

// You have to export an object to set up your config
// This object can have the following optional entries:
// defaultNetwork, networks, solc, and paths.
// Go to https://buidler.dev/config/ to learn more
const config: HardhatUserConfig = {
  networks: {
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/e5b8088fe4df4a69a4b5f35c2561bbe0',
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "QCNRXK7D434BB6DQSFMAGFSNNDY5EMTXE6"
  },
  solidity: {
    compilers: [
      {
        version: '0.6.8',
        settings: {
          optimizer: {
            enabled: false,
          },
        },
      },
    ],
  },
};

export default config;
