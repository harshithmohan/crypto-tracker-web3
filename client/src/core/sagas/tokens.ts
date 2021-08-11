/* eslint-disable @typescript-eslint/naming-convention */
import {
  all, call, delay, put, select,
} from 'redux-saga/effects';
import {
  filter, find, isUndefined, sortBy,
} from 'lodash';
import type { PayloadAction } from '@reduxjs/toolkit';
import dotenv from 'dotenv';

import ApiCall from '../api';
import Events from '../events';
import { setBalance, setPrice, setTokens } from '../slices/tokens';
import { getLocalWeb3, getUserWeb3 } from '../web3Helper';
import type { TokenType } from '../types';
import type { RootState } from '../store';

dotenv.config();

const defaultAddress = process.env.REACT_APP_DEFAULT_ADDRESS;
const serverURL = process.env.REACT_APP_SERVER_URL;

function* getTokenBalance(action: PayloadAction<TokenType>) {
  const { payload } = action;
  const {
    name, contract, _id, beefyLPName,
  } = payload;

  if (beefyLPName) {
    yield put(setBalance({ _id, balance: 0 }));
    return;
  }

  const web3 = getUserWeb3();
  const accounts = yield call(web3.eth.getAccounts);
  const myAddress = accounts[0] ?? defaultAddress;

  const weiBalance = yield call(contract.methods.balanceOf(myAddress).call);
  const balance = parseFloat(web3.utils.fromWei(weiBalance, name === 'USDC' ? 'mwei' : 'ether'));

  yield put(setBalance({ _id, balance }));
}

function* getTokenPrice(action: PayloadAction<TokenType>) {
  const { payload } = action;
  const {
    name, address, _id,
  } = payload;
  let price = 0;

  if (name === 'USDC') {
    price = 1;
  } else {
    const decimals = payload.decimals ?? 18;

    const baseUrl = 'https://polygon.api.0x.org/swap/v1/price?';
    const options = `sellToken=USDC&buyToken=${address}&buyAmount=${'100'.padEnd(decimals, '0')}`;

    const response = yield call(ApiCall, baseUrl + options);

    price = parseFloat(parseFloat(response.price).toFixed(4));
  }

  yield put(setPrice({ _id, price }));
}

function* getLPTokenPrice(action: PayloadAction<TokenType>) {
  const { payload } = action;
  const {
    name, address, _id,
    contract,
  } = payload;

  const web3 = getLocalWeb3();

  let price = 0;

  const tokens = yield select((state: RootState) => state.tokens);

  const lpTokens = name.split('-');
  const lpToken1: TokenType = find(tokens, { name: lpTokens[0] });
  const lpToken2: TokenType = find(tokens, { name: lpTokens[1] });

  if (isUndefined(lpToken1) || isUndefined(lpToken2)) return;

  const lpToken1WeiBalance = yield call(lpToken1.contract.methods.balanceOf(address).call);
  const lpToken2WeiBalance = yield call(lpToken2.contract.methods.balanceOf(address).call);

  const lpToken1Balance = parseFloat(web3.utils.fromWei(lpToken1WeiBalance, ['USDC', 'USDT'].includes(lpToken1.name) ? 'mwei' : 'ether'));
  const lpToken2Balance = parseFloat(web3.utils.fromWei(lpToken2WeiBalance, ['USDC', 'USDT'].includes(lpToken2.name) ? 'mwei' : 'ether'));

  const totalValue = (lpToken1Balance * lpToken1.price) + (lpToken2Balance * lpToken2.price);

  const totalSupply = parseFloat(
    web3.utils.fromWei(yield call(contract.methods.totalSupply().call)),
  );

  price = totalValue / totalSupply;

  yield put(setPrice({ _id, price }));
}

function* getTokenData() {
  const web3 = getLocalWeb3();

  let tokenData: TokenType[] = yield call(ApiCall, `${serverURL}/tokens`);
  tokenData = filter(tokenData, (token) => !token.disabled);
  tokenData = sortBy(tokenData, (token) => token.name.toLowerCase());

  for (let i = 0; i < tokenData.length; i += 1) {
    const token = tokenData[i];
    tokenData[i].contract = new web3.eth.Contract(token.abi, token.address);
  }

  yield put(setTokens(tokenData));

  yield all(tokenData.map(
    (token) => call(getTokenBalance, { type: Events.GET_TOKEN_BALANCE, payload: token }),
  ));

  const normalTokens = filter(tokenData, (token) => (!token.isLP && !token.beefyLPName));
  const lpTokens = filter(tokenData, (token) => token.isLP);
  const beefyLPTokens = filter(tokenData, (token) => !isUndefined(token.beefyLPName));

  yield all(normalTokens.slice(10).map(
    (token) => call(getTokenPrice, { type: Events.GET_TOKEN_PRICE, payload: token }),
  ));

  yield all(normalTokens.slice(0, 10).map(
    (token) => call(getTokenPrice, { type: Events.GET_TOKEN_PRICE, payload: token }),
  ));

  yield delay(100);

  yield all(normalTokens.slice(10).map(
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
