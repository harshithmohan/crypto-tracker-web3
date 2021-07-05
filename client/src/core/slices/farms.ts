/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { findIndex } from 'lodash';

import merge from '../merge';
import type { FarmType } from '../types';

const initialState: Array<FarmType> = [];

export const farmSlice = createSlice({
  name: 'farms',
  initialState,
  reducers: {
    setDepositAmount(state, action: PayloadAction<{ _id: string, depositAmount: number }>) {
      const idx = findIndex(state, { _id: action.payload._id });
      state[idx].depositAmount = action.payload.depositAmount;
    },
    setFarms(state, action: PayloadAction<Array<FarmType>>) {
      merge(action.payload, state, '_id');
      return action.payload;
    },
    setPendingAmount(state, action: PayloadAction<{ _id: string, pendingAmount: number }>) {
      const idx = findIndex(state, { _id: action.payload._id });
      state[idx].pendingAmount = action.payload.pendingAmount;
    },
  },
});

export const {
  setDepositAmount, setFarms, setPendingAmount,
} = farmSlice.actions;

export default farmSlice.reducer;
