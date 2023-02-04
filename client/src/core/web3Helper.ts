import Web3 from 'web3';

const rpcUrl = {
  matic: 'https://polygon-mainnet.g.alchemy.com/v2/2Zdz4VJKhHQHZ2jqDqZpKN348kxXW2de',
  fantom: 'https://rpc.ftm.tools',
  cronos: 'https://cronos-rpc.elk.finance',
} as { [key: string]: string };

export const getWeb3 = (chain: string) => new Web3(rpcUrl[chain]);
