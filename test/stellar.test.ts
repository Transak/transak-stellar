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
  amount: 1,
  decimals: 7,
  assetCode: 'USDC', // undefined
  assetIssuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', // undefined
  assetCode2: 'TRSKUSDC',
  assetIssuer2: 'GAB75DMUXBY4V6ET633ZYG3MR5A7XICFXVGCX5LB7RM7ILGOD6PAIWMP',
  memo: 'test memo',
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
    'date',
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
  getfeeStatsResponse: [
    'feeCryptoCurrency',
    'baseFee',
    'lowFeeCharged',
    'standardFeeCharged',
    'fastFeeCharged',
    'maxFeeCharged',
  ],
};

const runtime = { transactionHash: '' };

describe('Stellar module', () => {
  test(
    'should getBalance',
    async function () {
      const { network, accountId, assetCode, assetIssuer } = testData;

      const result = await StellarLib.getBalance(network, accountId, assetCode, assetIssuer);

      console.log({ result });
      expect(typeof result).toBe('number');
    },
    mainTimeout,
  );

  test(
    'should get isTokenTrusted',
    async function () {
      const { network, toWalletAddress:accountId, assetCode2, assetIssuer2 } = testData;

      const result = await StellarLib.isTokenTrusted(
        network,
        accountId,
        assetCode2,
        assetIssuer2,
      );

      console.log({ result });
      expect(typeof result).toBe('boolean');
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
    'should getfeeStats',
    async function () {
      const result = await StellarLib.getFeeStats(testData.network);

      console.log({ result });
      expect(Object.keys(result)).toEqual(expect.arrayContaining(keys.getfeeStatsResponse));
    },
    mainTimeout * 3,
  );

  test(
    'should sendTransaction XLM',
    async function () {
      const { toWalletAddress: to, network, amount, privateKey, memo } = testData;

      const result = await StellarLib.sendTransaction({
        to,
        amount,
        network,
        privateKey,
        memo,
      });

      console.log({ result });

      runtime.transactionHash = result.receipt.transactionHash;

      expect(Object.keys(result.receipt)).toEqual(expect.arrayContaining(keys.sendTransactionResponse));
    },
    mainTimeout * 3,
  );

  test(
    'should sendTransaction Asset USDC',
    async function () {
      const {
        toWalletAddress: to,
        network,
        amount,
        privateKey,
        assetCode2: assetCode,
        assetIssuer2: assetIssuer,
      } = testData;

      const result = await StellarLib.sendTransaction({
        to,
        amount,
        network,
        privateKey,
        assetCode,
        assetIssuer,
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
