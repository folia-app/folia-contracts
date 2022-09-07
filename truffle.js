require('dotenv').config()

// const HDWalletProvider = require('truffle-hdwallet-provider')
const HDWalletProvider = require("@truffle/hdwallet-provider")


module.exports = {
  compilers: {
    solc: {
      version: "0.5.0",
      parser: "solcjs",
      settings: {
        optimizer: {
          enabled: true,
          runs: 2000000
        }
      }
    }
  },
  networks: {
    develop: {
      provider() {
        return new HDWalletProvider(
          process.env.TRUFFLE_MNEMONIC,
          'http://localhost:9545/'
        )
      },
      host: 'localhost',
      port: 7545,
      network_id: 5777
    },
    ganache: {
      provider() {
        return new HDWalletProvider(
          process.env.GANACHE_MNEMONIC,
          'http://127.0.0.1:7545',
          0,
          10
        )
      },
      host: '127.0.0.1',
      port: 7545,
      network_id: 5777,
      // gas: 10000000,
      // gasPrice: 1000000000
    },
    mainnet: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://mainnet.infura.io/v3/' + process.env.INFURA_API_KEY,
          // using wallet at index 0 ----------------------------------------------------------------------------------------v
          0,
          10
        )
      },
      network_id: 1,
      gasPrice: 80000000000, // 80 GWEI
       gas: 5000000,
       skipDryRun: true
    },
    kovan: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://kovan.infura.io/v3/' + process.env.INFURA_API_KEY,
          // using wallet at index 0 ----------------------------------------------------------------------------------------v
          0,
          10
        )
      },
      network_id: 42
      // gas: 5561260
    },
    rinkeby: {
      skipDryRun: true,
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://rinkeby.infura.io/v3/' + process.env.INFURA_API_KEY,
          0,
          10
        )
      },
      network_id: 4,
      // gas: 4700000,
      gasPrice: 10000000000 // 10 GWEI
    },
    ropsten: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://ropsten.infura.io/v3/' + process.env.INFURA_API_KEY
        )
      },
      network_id: 2
      // gas: 4700000
    },
    sokol: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://sokol.poa.network'
        )
      },
      gasPrice: 1000000000, // 1 GWEI
      network_id: 77
    },
    poa: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://core.poa.network'
        )
      },
      gasPrice: 1000000000, // 1 GWEI
      network_id: 99
    },
    mumbai: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://matic-mumbai.chainstacklabs.com'
        )
      },
      gasPrice: 1000000000, // 1 GWEI
      network_id: 80001
    },
    polygon: {
      provider() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          'https://polygon-rpc.com'
        )
      },
      gasPrice: 100000000000, // 100 GWEI
      gas: 3000000,
      network_id: 137
    }
  }
}
