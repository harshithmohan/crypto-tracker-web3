import { all, takeEvery } from 'redux-saga/effects';

import Events from '../events';
import SagaFarm from './farms';
import SagaToken from './tokens';

export default function* rootSaga() {
  yield all([
    takeEvery(Events.GET_FARM_AMOUNT, SagaFarm.getFarmAmount),
    takeEvery(Events.GET_FARM_DATA, SagaFarm.getFarmData),
    takeEvery(Events.GET_LP_TOKEN_PRICE, SagaToken.getLPTokenPrice),
    takeEvery(Events.GET_TOKEN_BALANCE, SagaToken.getTokenBalance),
    takeEvery(Events.GET_TOKEN_DATA, SagaToken.getTokenData),
    takeEvery(Events.GET_TOKEN_PRICE, SagaToken.getTokenPrice),
  ]);
}
