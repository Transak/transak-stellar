import { Network } from './types';

export const networks: Record<string, Network> = {
  main: {
    transactionLink: hash => `https://stellar.expert/explorer/public/tx/${hash}`,
    walletLink: address => `https://stellar.expert/explorer/public/account/${address}`,
    networkName: 'PUBLIC',
    serverUrl: 'https://horizon.stellar.org',
  },
  testnet: {
    transactionLink: hash => `https://stellar.expert/explorer/testnet/tx/${hash}`,
    walletLink: address => `https://stellar.expert/explorer/testnet/account/${address}`,
    networkName: 'TESTNET',
    serverUrl: 'https://horizon-testnet.stellar.org',
  },
};

module.exports = { networks };
