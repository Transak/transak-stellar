// import { TransactionResponse, TransactionRecord, TransactionReceipt } from '@hashgraph/sdk';


export type Network = {
  networkName: string;
  transactionLink: (arg0: string) => string;
  walletLink: (arg0: string) => string;
  serverUrl: string;
};

export type GetTransactionResult = {
  transactionData: any;
  receipt: {
    // amount: number;
    date: Date | null;
    // from: string;
    gasCostCryptoCurrency: string;
    gasCostInCrypto: number;
    gasLimit: number;
    isPending: boolean;
    isExecuted: boolean;
    isSuccessful: boolean;
    isFailed: boolean;
    isInvalid: boolean;
    network: string;
    nonce: number;
    transactionHash: string;
    transactionLink: string;
  };
};

export type SendTransactionParams = {
  to: string; // to wallet address
  amount: number;
  network: string;
  decimals: number;
  accountId: string; 
  privateKey: string;
  tokenId?: string;
};

export type SendTransactionResult = {
  transactionData: any;
  receipt: {
    amount: number;
    date: Date;
    from: string;
    gasCostCryptoCurrency: string;
    gasCostInCrypto: number;
    gasLimit: number;
   
    network: string;
    nonce: number;
    to: string;
    transactionHash: string;
    transactionLink: string;
  };
};
