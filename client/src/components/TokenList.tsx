import React from 'react';
import { useAppSelector } from '../core/hooks';

import type { TokenType } from '../core/types';

const logoMap = {
  ftm: 'https://assets.spookyswap.finance/tokens/FTM.png',
  matic: 'https://polycat.finance/images/tokens/wmatic.svg',
} as { [key: string]: string };

function TokenList() {
  const tokens = useAppSelector((state) => state.tokens);

  const renderItem = (token: TokenType) => {
    const {
      name, price, balance, address,
      isLP, image, beefyLPName, chain,
    } = token;

    if ((isLP || beefyLPName) && balance === 0) {
      return (null);
    }

    const totalPrice = (price ?? 0) * (balance ?? 0);

    const swapLink = `https://app.1inch.io/#/137/swap/${address}/USDC`;

    return (
      <div className="flex py-6 items-center" key={token._id}>
        <div className="flex w-1/3 justify-center">
          <a href={swapLink ?? '#'} target="_blank" rel="noreferrer" className="flex flex-col items-center">
            <img src={image} alt={name} className="w-10 h-10" />
            <div className="flex justify-center items-center font-bold">
              {name}
              <img src={logoMap[chain]} alt={chain} className="w-4 h-4 ml-2" />
            </div>
          </a>
        </div>

        <div className="flex flex-col w-1/3 justify-center items-center font-bold">
          {`$${price ?? 0}`}
        </div>

        <div className="flex flex-col w-1/3 justify-center items-center">
          <div className="font-bold">{`$${(totalPrice).toFixed(2)}`}</div>
          <div className="text-xs">{(balance ?? 0).toFixed(6)}</div>
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
