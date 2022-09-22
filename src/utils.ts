import * as ethers from 'ethers';

// returns string
export const toDecimal = (amount: string, decimals: number) => ethers.utils.formatUnits(amount, decimals);
// returns ethers.BigNumber
export const toCrypto = (amount: string, decimals: number) => ethers.utils.parseUnits(amount, decimals);
