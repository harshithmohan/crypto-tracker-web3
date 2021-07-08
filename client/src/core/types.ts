import type { Contract } from 'web3-eth-contract';
import type { AbiItem } from 'web3-utils';

type BaseType = {
  _id: string;
  name: string;
  address: string;
  abi: AbiItem[];
  contract?: Contract;
  disabled?: boolean;
};

export type TokenType = BaseType & {
  image: string;
  price?: number;
  balance?: number;
  isLP?: boolean;
  decimals?: number;
  proxyAddress?: string;
};

export type FarmType = BaseType & {
  token1: string;
  token2: string;
  websiteName: string;
  link?: string;
  pid?: number;
  depositAmount?: number;
  pendingAmount?: number;
  hideEarned?: boolean;
  showTotal?: boolean;
  blockCountdown?: string;
  blockCountdownTime?: string;
  blockCountdownText?: string;
  pendingRewardFnName?: string;
  autoPool?: string;
};
