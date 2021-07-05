import { applyMiddleware, combineReducers, createStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';

import rootSaga from './sagas';
import farmReducer from './slices/farms';
import tokenReducer from './slices/tokens';

const rootReducer = combineReducers({
  farms: farmReducer,
  tokens: tokenReducer,
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(sagaMiddleware)));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

sagaMiddleware.run(rootSaga);

export default store;
