import Web3 from 'web3';

const { ethereum } = window as any;

const rpcUrl = 'https://rpc-mainnet.maticvigil.com';

export const getUserWeb3 = () => {
  if (ethereum) {
    return new Web3(ethereum);
  }
  return new Web3(rpcUrl);
};

export const getLocalWeb3 = () => new Web3(rpcUrl);
