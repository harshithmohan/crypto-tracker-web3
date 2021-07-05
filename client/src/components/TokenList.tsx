import React from 'react';
import { useAppSelector } from '../core/hooks';

import type { TokenType } from '../core/types';

function TokenList() {
  const tokens = useAppSelector((state) => state.tokens);

  const renderItem = (token: TokenType) => {
    const {
      name, price, balance,
      isLP, image,
    } = token;

    if (isLP && balance === 0) {
      return (null);
    }

    const totalPrice = (price ?? 0) * (balance ?? 0);

    return (
      <div className="flex py-6 items-center" key={token._id}>
        <div className="flex w-1/3 items-center justify-center">
          <img src={image} alt={name} className="w-10 h-10" />
          <div className="flex justify-center w-1/2 font-bold">{name}</div>
        </div>

        <div className="flex flex-col w-1/3 justify-center items-center">
          <div className="font-bold">{`$${price ?? 0}`}</div>
          <div className="text-xs">{`~₹${((price ?? 0) * 75).toFixed(2)}`}</div>
        </div>

        <div className="flex flex-col w-1/3 justify-center items-center">
          <div className="font-bold">{balance ?? 0}</div>
          <div className="text-xs">{`~$${(totalPrice).toFixed(4)} (~₹${(totalPrice * 75).toFixed(2)})`}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-end w-1/3">
      <div className="bg-gray-900 rounded-lg flex flex-col text-white w-5/6">
        {tokens.map((token) => renderItem(token))}
      </div>
    </div>
  );
}

export default TokenList;