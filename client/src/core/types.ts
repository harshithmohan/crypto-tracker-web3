import type { Contract } from 'web3-eth-contract';
import type { AbiItem } from 'web3-utils';

type BaseType = {
  _id: string;
  name: string;
  address: string;
  abi: AbiItem[];
  contract?: Contract;
  disabled?: boolean;
  chain: string;
};

export type TokenType = BaseType & {
  image: string;
  image2?: string;
  price?: number;
  balance?: number;
  isLP?: boolean;
  decimals?: number;
  proxyAddress?: string;
  beefyLPName?: string;
  lpAddress?: string;
  priceInvert?: boolean;
};

export type FarmType = BaseType & {
  token1: string;
  token2: string;
  websiteName: string;
  link?: string;
  pid?: number;
  depositAmount?: number;
  pendingAmount?: number;
  showTotal?: boolean;
  pendingRewardFnName?: string;
  autoPool?: string;
  type: string;
};

export type DexScreenerPairType = {
  dexId: string;
  pair: {
    priceNative: string;
    priceUsd: string;
  }
};
