type BaseType = {
  _id: string;
  name: string;
  address: string;
  abi: any[];
};

export type TokenType = BaseType & {
  proxyAddress?: string;
  image: string;
  isLP?: boolean;
  decimals?: number;
};

export type FarmType = BaseType & {
  token1: string;
  token2: string;
  websiteName: string;
  link?: string;
  pid?: number;
  hideEarned?: boolean;
  showTotal?: boolean;
  blockCountdown?: string;
  blockCountdownTime?: string;
  blockCountdownText?: string;
  pendingRewardFnName?: string;
  autoPool?: boolean;
};
