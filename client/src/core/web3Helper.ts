import Web3 from 'web3';

const { ethereum } = window as any;

const rpcUrl = {
  matic: 'https://polygon-mainnet.g.alchemy.com/v2/2Zdz4VJKhHQHZ2jqDqZpKN348kxXW2de',
  ftm: 'https://rpc.ftm.tools',
} as { [key: string]: string };

export const getUserWeb3 = (chain: string) => {
  if (ethereum) {
    return new Web3(ethereum);
  }
  return new Web3(rpcUrl[chain]);
};

export const getLocalWeb3 = (chain: string) => new Web3(rpcUrl[chain]);
