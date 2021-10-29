type BaseType = {
  _id: string;
  name: string;
  address: string;
  abi: any[];
  disabled: boolean;
  chain: string;
};

export type TokenType = BaseType & {
  proxyAddress?: string;
  image: string;
  isLP?: boolean;
  decimals?: number;
  beefyLPName?: string;
  lpAddress?: string;
};

export type FarmType = BaseType & {
  token1: string;
  token2: string;
  websiteName: string;
  link?: string;
  pid?: number;
  showTotal?: boolean;
  pendingRewardFnName?: string;
  autoPool?: boolean;
};
