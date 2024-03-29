/* eslint-disable @typescript-eslint/naming-convention */
import {
  all, call, put, select,
} from 'redux-saga/effects';
import {
  filter, find, isUndefined, sortBy,
} from 'lodash';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AbiItem } from 'web3-utils';
import dotenv from 'dotenv';

import ApiCall from '../api';
import Events from '../events';
import {
  setBalance, setPrice, setTokens,
  setImage, setImage2,
} from '../slices/tokens';
import { getWeb3 } from '../web3Helper';
import type { TokenType, DexScreenerPairType } from '../types';
import type { RootState } from '../store';

dotenv.config();

const defaultAddress = process.env.REACT_APP_DEFAULT_ADDRESS;
const serverURL = process.env.REACT_APP_SERVER_URL;

const ERC20_ABI: AbiItem[] = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address',
      },
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
];
const LP_ABI: AbiItem[] = [{ inputs: [], stateMutability: 'nonpayable', type: 'constructor' }, {
  anonymous: false,
  inputs: [{
    indexed: true, internalType: 'address', name: 'owner', type: 'address',
  }, {
    indexed: true, internalType: 'address', name: 'spender', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'value', type: 'uint256',
  }],
  name: 'Approval',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: true, internalType: 'address', name: 'sender', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount0', type: 'uint256',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount1', type: 'uint256',
  }, {
    indexed: true, internalType: 'address', name: 'to', type: 'address',
  }],
  name: 'Burn',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: true, internalType: 'address', name: 'sender', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount0', type: 'uint256',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount1', type: 'uint256',
  }],
  name: 'Mint',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: true, internalType: 'address', name: 'sender', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount0In', type: 'uint256',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount1In', type: 'uint256',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount0Out', type: 'uint256',
  }, {
    indexed: false, internalType: 'uint256', name: 'amount1Out', type: 'uint256',
  }, {
    indexed: true, internalType: 'address', name: 'to', type: 'address',
  }],
  name: 'Swap',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: false, internalType: 'uint112', name: 'reserve0', type: 'uint112',
  }, {
    indexed: false, internalType: 'uint112', name: 'reserve1', type: 'uint112',
  }],
  name: 'Sync',
  type: 'event',
}, {
  anonymous: false,
  inputs: [{
    indexed: true, internalType: 'address', name: 'from', type: 'address',
  }, {
    indexed: true, internalType: 'address', name: 'to', type: 'address',
  }, {
    indexed: false, internalType: 'uint256', name: 'value', type: 'uint256',
  }],
  name: 'Transfer',
  type: 'event',
}, {
  inputs: [], name: 'DOMAIN_SEPARATOR', outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [], name: 'MINIMUM_LIQUIDITY', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [], name: 'PERMIT_TYPEHASH', outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [{ internalType: 'address', name: '', type: 'address' }, { internalType: 'address', name: '', type: 'address' }], name: 'allowance', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'approve', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'balanceOf', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [{ internalType: 'address', name: 'to', type: 'address' }], name: 'burn', outputs: [{ internalType: 'uint256', name: 'amount0', type: 'uint256' }, { internalType: 'uint256', name: 'amount1', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [], name: 'decimals', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [], name: 'factory', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [], name: 'getReserves', outputs: [{ internalType: 'uint112', name: '_reserve0', type: 'uint112' }, { internalType: 'uint112', name: '_reserve1', type: 'uint112' }, { internalType: 'uint32', name: '_blockTimestampLast', type: 'uint32' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [{ internalType: 'address', name: '_token0', type: 'address' }, { internalType: 'address', name: '_token1', type: 'address' }], name: 'initialize', outputs: [], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [], name: 'kLast', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [{ internalType: 'address', name: 'to', type: 'address' }], name: 'mint', outputs: [{ internalType: 'uint256', name: 'liquidity', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [], name: 'name', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'nonces', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [{ internalType: 'address', name: 'owner', type: 'address' }, { internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }, { internalType: 'uint8', name: 'v', type: 'uint8' }, { internalType: 'bytes32', name: 'r', type: 'bytes32' }, { internalType: 'bytes32', name: 's', type: 'bytes32' }], name: 'permit', outputs: [], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [], name: 'price0CumulativeLast', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [], name: 'price1CumulativeLast', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [{ internalType: 'address', name: 'to', type: 'address' }], name: 'skim', outputs: [], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [{ internalType: 'uint256', name: 'amount0Out', type: 'uint256' }, { internalType: 'uint256', name: 'amount1Out', type: 'uint256' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'bytes', name: 'data', type: 'bytes' }], name: 'swap', outputs: [], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [], name: 'symbol', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [], name: 'sync', outputs: [], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [], name: 'token0', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [], name: 'token1', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [], name: 'totalSupply', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
}, {
  inputs: [{ internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'transfer', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function',
}, {
  inputs: [{ internalType: 'address', name: 'from', type: 'address' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'transferFrom', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function',
}];

function* getTokenBalance(action: PayloadAction<TokenType>) {
  const { payload } = action;
  const {
    contract, _id, beefyLPName, chain,
    decimals,
  } = payload;

  if (beefyLPName) {
    yield put(setBalance({ _id, balance: 0 }));
    return;
  }

  const web3 = getWeb3(chain);
  const accounts = yield call(web3.eth.getAccounts);
  const myAddress = accounts[0] ?? defaultAddress;

  const weiBalance = yield call(contract.methods.balanceOf(myAddress).call);
  const balance = parseFloat(web3.utils.fromWei(weiBalance, (decimals === 6) ? 'mwei' : 'ether'));

  yield put(setBalance({ _id, balance }));
}

function* getTokenPrice(action: PayloadAction<TokenType>) {
  const { payload } = action;
  const {
    _id, lpAddress, chain,
    priceInvert,
  } = payload;

  const data: DexScreenerPairType = yield call(ApiCall, `https://api.dexscreener.io/latest/dex/pairs/${chain}/${lpAddress}`);

  const price = priceInvert ? 1 / Number(data.pair.priceUsd) : Number(data.pair.priceUsd);

  yield put(setPrice({ _id, price }));
}

function* getLPTokenPrice(action: PayloadAction<TokenType>) {
  const { payload } = action;
  const {
    name, address, _id,
    contract, chain,
  } = payload;

  const web3 = getWeb3(chain);

  let price = 0;

  const tokens = yield select((state: RootState) => state.tokens);

  const lpTokens = name.split('-');
  const lpToken1: TokenType = find(tokens, { name: lpTokens[0], chain });
  const lpToken2: TokenType = find(tokens, { name: lpTokens[1], chain });

  if (isUndefined(lpToken1) || isUndefined(lpToken2)) return;

  yield put(setImage({ _id, image: lpToken1.image }));
  yield put(setImage2({ _id, image: lpToken2.image }));

  const lpToken1WeiBalance = yield call(lpToken1.contract.methods.balanceOf(address).call);
  const lpToken2WeiBalance = yield call(lpToken2.contract.methods.balanceOf(address).call);

  const lpToken1Balance = parseFloat(web3.utils.fromWei(lpToken1WeiBalance, (lpToken1.decimals === 6) ? 'mwei' : 'ether'));
  const lpToken2Balance = parseFloat(web3.utils.fromWei(lpToken2WeiBalance, (lpToken2.decimals === 6) ? 'mwei' : 'ether'));

  const totalValue = (lpToken1Balance * lpToken1.price) + (lpToken2Balance * lpToken2.price);

  const totalSupply = parseFloat(
    web3.utils.fromWei(yield call(contract.methods.totalSupply().call)),
  );

  price = totalValue / totalSupply;

  yield put(setPrice({ _id, price }));
}

function* getTokenData() {
  let tokenData: TokenType[] = yield call(ApiCall, `${serverURL}/tokens`);
  tokenData = filter(tokenData, (token) => !token.disabled);
  tokenData = sortBy(tokenData, (token) => token.name.toLowerCase());

  for (let i = 0; i < tokenData.length; i += 1) {
    const token = tokenData[i];
    const web3 = getWeb3(token.chain);
    tokenData[i].contract = new web3.eth.Contract(token.isLP ? LP_ABI : ERC20_ABI, token.address);
  }

  yield put(setTokens(tokenData));

  yield all(tokenData.map(
    (token) => call(getTokenBalance, { type: Events.GET_TOKEN_BALANCE, payload: token }),
  ));

  const normalTokens = filter(tokenData, (token) => (!token.isLP && !token.beefyLPName));
  const lpTokens = filter(tokenData, (token) => token.isLP);
  const beefyLPTokens = filter(tokenData, (token) => !isUndefined(token.beefyLPName));

  yield all(normalTokens.map(
    (token) => call(getTokenPrice, { type: Events.GET_TOKEN_PRICE, payload: token }),
  ));

  yield all(lpTokens.map(
    (token) => call(getLPTokenPrice, { type: Events.GET_LP_TOKEN_PRICE, payload: token }),
  ));

  if (beefyLPTokens.length > 0) {
    const prices = yield call(ApiCall, 'https://api.beefy.finance/lps');
    for (let i = 0; i < beefyLPTokens.length; i += 1) {
      const { _id, beefyLPName } = beefyLPTokens[i];
      const price = prices[beefyLPName];
      yield put(setPrice({ _id, price }));
    }
  }
}

export default {
  getLPTokenPrice,
  getTokenBalance,
  getTokenData,
  getTokenPrice,
};
