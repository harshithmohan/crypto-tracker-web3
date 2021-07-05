/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { findIndex } from 'lodash';
import type { Contract } from 'web3-eth-contract';

import merge from '../merge';
import type { TokenType } from '../types';

const initialState: Array<TokenType> = [];

export const tokenSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setBalance(state, action: PayloadAction<{ _id: string, balance: number }>) {
      const idx = findIndex(state, { _id: action.payload._id });
      state[idx].balance = action.payload.balance;
    },
    setContract(state, action: PayloadAction<{ _id: string, contract: Contract }>) {
      const idx = findIndex(state, { _id: action.payload._id });
      state[idx].contract = action.payload.contract;
    },
    setPrice(state, action: PayloadAction<{ _id: string, price: number }>) {
      const idx = findIndex(state, { _id: action.payload._id });
      state[idx].price = action.payload.price;
    },
    setTokens(state, action: PayloadAction<Array<TokenType>>) {
      merge(action.payload, state, '_id');
      return action.payload;
    },
  },
});

export const {
  setBalance, setContract, setTokens, setPrice,
} = tokenSlice.actions;

export default tokenSlice.reducer;
