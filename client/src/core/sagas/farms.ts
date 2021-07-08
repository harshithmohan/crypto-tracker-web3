/* eslint-disable @typescript-eslint/naming-convention */
import { all, call, put } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { filter } from 'lodash';
import dotenv from 'dotenv';

import { getLocalWeb3, getUserWeb3 } from '../web3Helper';
import Events from '../events';
import ApiCall from '../api';
import { setDepositAmount, setFarms, setPendingAmount } from '../slices/farms';
import type { FarmType } from '../types';

dotenv.config();

const defaultAddress = process.env.REACT_APP_DEFAULT_ADDRESS;
const serverURL = process.env.REACT_APP_SERVER_URL;

function* getFarmAmount(action: PayloadAction<FarmType>) {
  const { payload } = action;
  const {
    contract, _id, pid, token1,
    pendingRewardFnName, token2,
    autoPool,
  } = payload;

  const web3 = getUserWeb3();
  const accounts = yield call(web3.eth.getAccounts);
  const myAddress = accounts[0] ?? defaultAddress;

  if (autoPool) {
    const weiShares = (yield call(contract.methods.userInfo(myAddress).call)).shares;
    const shares = parseFloat(web3.utils.fromWei(weiShares));

    const weiPricePerShare = yield call(contract.methods.getPricePerFullShare().call);
    const pricePerShare = parseFloat(web3.utils.fromWei(weiPricePerShare));

    const price = (shares * pricePerShare).toFixed(6);

    yield put(setDepositAmount({ _id, depositAmount: parseFloat(price) }));
    return;
  }

  const rewardFunction = contract.methods[pendingRewardFnName];

  let weiAmount1 = '0';
  let weiAmount2 = '0';

  if (pid !== undefined) {
    weiAmount1 = (yield call(contract.methods.userInfo(pid, myAddress).call)).amount;
    weiAmount2 = yield call(rewardFunction(pid, myAddress).call);
  } else {
    weiAmount1 = (yield call(contract.methods.userInfo(myAddress).call)).amount;
    weiAmount2 = yield call(rewardFunction(myAddress).call);
  }

  const depositAmount = parseFloat(web3.utils.fromWei(weiAmount1, token1 === 'USDC' ? 'mwei' : 'ether')).toFixed(6);
  const pendingAmount = parseFloat(web3.utils.fromWei(weiAmount2, token2 === 'USDC' ? 'mwei' : 'ether')).toFixed(6);

  yield put(setDepositAmount({ _id, depositAmount: parseFloat(depositAmount) }));
  yield put(setPendingAmount({ _id, pendingAmount: parseFloat(pendingAmount) }));
}

function* getFarmData() {
  const web3 = getLocalWeb3();

  let farmData: FarmType[] = yield call(ApiCall, `${serverURL}/farms`);
  farmData = filter(farmData, (farm) => !farm.disabled);

  for (let i = 0; i < farmData.length; i += 1) {
    const token = farmData[i];
    farmData[i].contract = new web3.eth.Contract(token.abi, token.address);
  }

  yield put(setFarms(farmData));

  yield all(farmData.map(
    (farm) => call(getFarmAmount, { type: Events.GET_FARM_AMOUNT, payload: farm }),
  ));
}

export default {
  getFarmAmount,
  getFarmData,
};
