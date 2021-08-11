import Web3 from 'web3';

const { ethereum } = window as any;

const rpcUrl = 'https://polygon-mainnet.g.alchemy.com/v2/2Zdz4VJKhHQHZ2jqDqZpKN348kxXW2de';

export const getUserWeb3 = () => {
  if (ethereum) {
    return new Web3(ethereum);
  }
  return new Web3(rpcUrl);
};

export const getLocalWeb3 = () => new Web3(rpcUrl);
