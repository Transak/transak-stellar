import StellarLib from '../src/index';
import { describe, expect, test } from '@jest/globals';
import * as dotenv from 'dotenv';

dotenv.config();

// variables
const mainTimeout = 14000;

// testData
const testData = {
  accountId: process.env.MY_ACCOUNT_ID || '',
  privateKey: process.env.MY_PRIVATE_KEY || ' ',
  toWalletAddress: process.env.TOWALLETADDRESS || '',
  network: process.env.NETWORK || '',
  crypto: 'HBAR',
  amount: 0.005,
  decimals: 7,
  tokenId: '', // '0.0.48220530'
};

const keys = {
  sendTransactionResponse: [
    'amount',
    'date',
    'from',
    'gasCostCryptoCurrency',
    'network',
    'nonce',
    'to',
    'transactionHash',
    'transactionLink',
  ],
  getTransactionResponse: [
    // 'amount',
    'date',
    // 'from',
    'gasCostCryptoCurrency',
    'gasCostInCrypto',
    'gasLimit',
    'isPending',
    'isExecuted',
    'isSuccessful',
    'isFailed',
    'isInvalid',
    'network',
    'nonce',
    'transactionHash',
    'transactionLink',
  ],
};

const runtime = { transactionHash: '' };

describe('Stellar module', () => {
  

  test(
    'should getBalance',
    async function () {
      const { network, decimals, accountId, tokenId } = testData;

      const result = await StellarLib.getBalance(
        network,
        decimals,
        accountId,
        // tokenId, // token Id
      );

      console.log({ result });
      expect(typeof result).toBe('number');
    },
    mainTimeout,
  );

  test(
    'should isValidWalletAddress',
    async function () {
      const result = await StellarLib.isValidWalletAddress(testData.toWalletAddress);

      console.log({ result });
      expect(result).toBe(true);
    },
    mainTimeout * 3,
  );

  test(
    'should sendTransaction',
    async function () {
      const { toWalletAddress: to, network, amount, decimals, accountId, privateKey, tokenId } = testData;

      const result = await StellarLib.sendTransaction({
        to,
        amount,
        network,
        decimals,
        accountId,
        privateKey,
        tokenId,
      });

      console.log({ result });

      runtime.transactionHash = result.receipt.transactionHash;

      expect(Object.keys(result.receipt)).toEqual(expect.arrayContaining(keys.sendTransactionResponse));
    },
    mainTimeout * 3,
  );

  test(
    'should getTransaction',
    async function () {
      const { network } = testData;
      const { transactionHash: txnId } = runtime;

      const result = await StellarLib.getTransaction(txnId, network);
      console.log({ result });

      if (result) expect(Object.keys(result.receipt)).toEqual(expect.arrayContaining(keys.getTransactionResponse));
    },
    mainTimeout * 3,
  );
});
