type BaseType = {
  _id: string;
  name: string;
  address: string;
  abi: any[];
  disabled: boolean;
};

export type TokenType = BaseType & {
  proxyAddress?: string;
  image: string;
  isLP?: boolean;
  decimals?: number;
  beefyLPName?: string;
};

export type FarmType = BaseType & {
  token1: string;
  token2: string;
  websiteName: string;
  link?: string;
  pid?: number;
  showTotal?: boolean;
  blockCountdown?: string;
  blockCountdownTime?: string;
  blockCountdownText?: string;
  pendingRewardFnName?: string;
  autoPool?: boolean;
};
