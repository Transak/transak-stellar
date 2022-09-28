import axios from 'axios';
import { networks } from './config';
import { toDecimal, toCrypto } from './utils';
import StellarSdk from 'stellar-sdk';
import {
  Network,
  GetTransactionResult,
  SendTransactionResult,
  SendTransactionParams,
  getfeeStatsResult,
} from './types'; //

/**
 * Get the network config
 * @param network
 * @returns
 */
const getNetwork = (network: string) => (network === 'main' ? networks[network] : networks.testnet) as Network;

/**
 * Validate the wallet address
 * @param address
 * @returns
 */
const isValidWalletAddress = (address: string) => {
  return StellarSdk.StrKey.isValidEd25519PublicKey(address) as boolean;
};

/**
 * Gets the transaction link
 * @param txId
 * @param network
 * @returns
 */
const getTransactionLink = (txId: string, network: string) => getNetwork(network).transactionLink(txId) as string;

/**
 * get wallet link for the given address
 * @param walletAddress
 * @param network
 * @returns
 */
const getWalletLink = (walletAddress: string, network: string) =>
  getNetwork(network).walletLink(walletAddress) as string;

/**
 * create a client instance
 * @param network
 * @returns
 */
async function getClient(network: string): Promise<any> {
  const config = getNetwork(network);

  const server = new StellarSdk.Server(config.serverUrl);

  return server;
}

/**
 * Gets fee stats of last transacions from Horizen server
 * @param network
 * @returns
 */
async function getFeeStats(network: string): Promise<getfeeStatsResult> {
  const config = getNetwork(network);
  const server = new StellarSdk.Server(config.serverUrl);

  const fee = await server.feeStats();

  return {
    feeCryptoCurrency: 'XLM',
    baseFee: Number(toDecimal(fee.last_ledger_base_fee, 7)),
    lowFeeCharged: Number(toDecimal(fee.fee_charged.p10, 7)),
    standardFeeCharged: Number(toDecimal(fee.fee_charged.p50, 7)),
    fastFeeCharged: Number(toDecimal(fee.fee_charged.p99, 7)),
    maxFeeCharged: Number(toDecimal(fee.max_fee.max, 7)),
  };
}

/**
 * Get the balance of the transak wallet address
 * @param network
 * @param accountId
 * @param assetCode - optional assetCode ( if not provided, it will return the balance of native asset)
 * @param assetIssuer - optional assetIssuer ( if not provided, it will return the balance of native asset)
 * @returns
 */
async function getBalance(
  network: string,
  accountId: string,
  assetCode?: string,
  assetIssuer?: string,
): Promise<number> {
  const server = await getClient(network);

  const account = await server.loadAccount(accountId);

  const selectedAsset = account.balances.find(function (asset: any) {
    if (assetCode && assetIssuer && assetCode !== 'XLM') {
      return asset.asset_code === assetCode && asset.asset_issuer === assetIssuer;
    }

    return asset.asset_type === 'native';
  });

  // return balance
  return Number(selectedAsset.balance);
}

/**
 * Get the transaction details by transaction id
 * @param txnId
 * @param network
 * @returns
 */
async function getTransaction(txnId: string, network: string): Promise<GetTransactionResult | null> {
  try {
    const { serverUrl } = getNetwork(network);

    const response = await axios({
      method: 'get',
      url: `${serverUrl}/transactions/${txnId}`,
      headers: {
        accept: 'application/json',
      },
    });

    const transactionData = response.data;

    return {
      transactionData,
      receipt: {
        date: transactionData.created_at || null,
        gasCostCryptoCurrency: 'XLM',
        gasCostInCrypto: Number(toDecimal(transactionData.fee_charged, 7)),
        gasLimit: Number(toDecimal(transactionData.max_fee, 7)),
        isPending: false,
        isExecuted: true,
        isSuccessful: !!transactionData.successful,
        isFailed: !transactionData.successful,
        isInvalid: !transactionData.successful,
        network,
        nonce: 0,
        transactionHash: transactionData.hash,
        transactionLink: getTransactionLink(transactionData.hash, network),
      },
    };
  } catch (error) {
    console.log('error: ', error);
    return null;
  }
}

/**
 * Send the transaction to the Hedera network
 * @param param0
 * @returns
 */
async function sendTransaction({
  to,
  amount,
  network,
  privateKey,
  assetCode,
  assetIssuer,
  fee, // in XLM
}: SendTransactionParams): Promise<SendTransactionResult> {
  const server = await getClient(network);
  const config = getNetwork(network);

  // 1. get Keys from private key
  const sourceKeys = StellarSdk.Keypair.fromSecret(privateKey);

  // 2. get Transak Account from sourceKeys
  const sourceAccount = await server.loadAccount(sourceKeys.publicKey());

  // if assetCode is present set the Asset or XLM is transacted.
  const asset = assetCode && assetIssuer ? new StellarSdk.Asset(assetCode, assetIssuer) : StellarSdk.Asset.native();

  // if fee is not send use base fee for transaction
  const transactionFee = fee ? toCrypto(fee,7) : StellarSdk.BASE_FEE;
  // Start building the transaction.
  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: transactionFee,
    networkPassphrase: StellarSdk.Networks[config.networkName], // PUBLIC ,TESTNET
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: to,
        asset: asset,
        amount: amount.toString(),
      }),
    )
    .addMemo(StellarSdk.Memo.text('Transaction by Transak'))
    .setTimeout(180) // Wait a maximum of three minutes for the transaction
    .build();

  // Sign the transaction to prove you are actually the person sending it.
  transaction.sign(sourceKeys);

  // And finally, send it off to Stellar!
  const transactionData = await server.submitTransaction(transaction);

  return {
    transactionData,
    receipt: {
      amount,
      date: transactionData.created_at || null,
      from: sourceKeys.publicKey(),
      gasCostCryptoCurrency: 'XLM',
      gasCostInCrypto: Number(toDecimal(transactionData.fee_charged, 7)),
      gasLimit: Number(toDecimal(transactionData.max_fee, 7)),
      network,
      nonce: 0,
      to,
      transactionHash: transactionData.hash,
      transactionLink: getTransactionLink(transactionData.hash, network),
    },
  };
}

export = {
  getTransactionLink,
  getWalletLink,
  getTransaction,
  isValidWalletAddress,
  sendTransaction,
  getBalance,
  getFeeStats,
};
