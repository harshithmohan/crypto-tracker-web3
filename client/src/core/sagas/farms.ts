/* eslint-disable @typescript-eslint/naming-convention */
import { all, call, put } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { filter, sortBy } from 'lodash';
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
    autoPool, chain,
  } = payload;

  const web3 = getUserWeb3(chain);
  const accounts = yield call(web3.eth.getAccounts);
  const myAddress = accounts[0] ?? defaultAddress;

  if (autoPool) {
    const weiShares = 'userInfo' in contract.methods
      ? (yield call(contract.methods.userInfo(myAddress).call)).shares
      : yield call(contract.methods.balanceOf(myAddress).call);

    const shares = parseFloat(web3.utils.fromWei(weiShares));

    const weiPricePerShare = 'getPricePerFullShare' in contract.methods
      ? yield call(contract.methods.getPricePerFullShare().call)
      : yield call(contract.methods.getRatio().call);
    const pricePerShare = parseFloat(web3.utils.fromWei(weiPricePerShare));

    const depositAmount = parseFloat((shares * pricePerShare).toFixed(6));

    yield put(setDepositAmount({ _id, depositAmount }));
  } else {
    let weiAmount1 = '0';

    if (pid !== undefined) {
      const temp = yield call(contract.methods.userInfo(pid, myAddress).call);
      weiAmount1 = temp?.amount ?? temp?.shares;
    } else {
      const temp = yield call(contract.methods.userInfo(myAddress).call);
      weiAmount1 = temp?.amount ?? temp?.shares;
    }

    const depositAmount = web3.utils.fromWei(weiAmount1, token1 === 'USDC' ? 'mwei' : 'ether');

    yield put(setDepositAmount({ _id, depositAmount: parseFloat(depositAmount) }));
  }

  if (token2 !== null) {
    const rewardFunction = contract.methods[pendingRewardFnName];

    let weiAmount2 = '0';

    if (pid !== undefined) {
      weiAmount2 = yield call(rewardFunction(pid, myAddress).call);
    } else {
      weiAmount2 = yield call(rewardFunction(myAddress).call);
    }

    const pendingAmount = web3.utils.fromWei(weiAmount2, token2 === 'USDC' ? 'mwei' : 'ether');

    yield put(setPendingAmount({ _id, pendingAmount: parseFloat(pendingAmount) }));
  }
}

function* getFarmData() {
  let farmData: FarmType[] = yield call(ApiCall, `${serverURL}/farms`);
  farmData = filter(farmData, (farm) => !farm.disabled);
  farmData = sortBy(farmData, (farm) => farm.name.toLowerCase());

  for (let i = 0; i < farmData.length; i += 1) {
    const token = farmData[i];
    const web3 = getLocalWeb3(token.chain);
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
