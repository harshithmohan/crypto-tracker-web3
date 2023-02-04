import React from 'react';
import { orderBy } from 'lodash';
import commaNumber from 'comma-number';

import { useAppSelector } from '../core/hooks';

import type { TokenType } from '../core/types';

const logoMap = {
  fantom: 'https://assets.spookyswap.finance/tokens/FTM.png',
  matic: 'https://polycat.finance/images/tokens/wmatic.svg',
  cronos: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTIiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA1MiA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI1Ljg0IDEuOTA3MzVlLTA2TC0xLjUyNTg4ZS0wNSAxNC45MlY0NC43NUwyNS44NCA1OS42Nkw1MS42NiA0NC43NVYxNC45MkwyNS44NCAxLjkwNzM1ZS0wNlpNNDQuMDEgNDAuMzNMMjUuODQgNTAuODJMNy42NTk5OSA0MC4zM1YxOS4zM0wyNS44NCA4Ljg0TDQ0LjAxIDE5LjMzVjQwLjMzWiIgZmlsbD0iIzAwMkQ3NCIvPgo8cGF0aCBzdHlsZT0ibWl4LWJsZW5kLW1vZGU6bXVsdGlwbHkiIGQ9Ik0yNS44NCA1OS42Nkw1MS42NiA0NC43NVYxNC45MkwyNS44NCAxLjkwNzM1ZS0wNlY4Ljg0OTk5TDQ0LjAxIDE5LjM0VjQwLjM0TDI1Ljg0IDUwLjgyVjU5LjY2WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyKSIvPgo8cGF0aCBzdHlsZT0ibWl4LWJsZW5kLW1vZGU6bXVsdGlwbHkiIGQ9Ik0yNS44MiAwTDAgMTQuOTFMMCA0NC43NEwyNS44MiA1OS42NlY1MC44MUw3LjY0OTk5IDQwLjMyVjE5LjMyTDI1LjgyIDguODRWMFoiIGZpbGw9InVybCgjcGFpbnQxX2xpbmVhcikiLz4KPHBhdGggZD0iTTM3Ljg5IDM2LjhMMjUuODMgNDMuNzZMMTMuNzYgMzYuOFYyMi44N0wyNS44MyAxNS45TDM3Ljg5IDIyLjg3TDMyLjg3IDI1Ljc3TDI1LjgzIDIxLjdMMTguNzkgMjUuNzdWMzMuODlMMjUuODMgMzcuOTZMMzIuODcgMzMuODlMMzcuODkgMzYuOFoiIGZpbGw9IiMwMDJENzQiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhciIgeDE9IjM4Ljc1IiB5MT0iNTkuNjYiIHgyPSIzOC43NSIgeTI9IjI5LjgzIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwMDJENzQiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDAyRDc0IiBzdG9wLW9wYWNpdHk9IjAiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDFfbGluZWFyIiB4MT0iMTIuOTEiIHkxPSIwIiB4Mj0iMTIuOTEiIHkyPSIyOS44MyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMDAyRDc0Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwMkQ3NCIgc3RvcC1vcGFjaXR5PSIwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==',
} as { [key: string]: string };

function TokenList() {
  const tokens = useAppSelector((state) => state.tokens);

  const sortedTokens = orderBy(tokens, (token) => token.balance, 'desc');

  const renderItem = (token: TokenType) => {
    const {
      name, price, balance, address,
      isLP, image, beefyLPName, image2,
    } = token;

    if ((isLP || beefyLPName) && balance === 0) {
      return (null);
    }

    const totalPrice = (price ?? 0) * (balance ?? 0);

    const swapLink = `https://app.1inch.io/#/137/swap/${address}/USDC`;

    return (
      <div className="flex py-4 items-center text-sm" key={token._id}>
        <div className="flex w-1/4 justify-center">
          <a href={swapLink ?? '#'} target="_blank" rel="noreferrer" className="flex flex-col items-center">
            {isLP ? (
              <div className="flex">
                <img src={image} alt={name} className="w-8 h-8" />
                <img src={image2} alt={name} className="w-8 h-8" />
              </div>
            ) : (
              <img src={image} alt={name} className="w-10 h-10" />
            )}
            <div className="flex justify-center items-center font-bold text-xs text-center">
              {name}
              {/* <img src={logoMap[chain]} alt={chain} className="w-4 h-4 ml-2" /> */}
            </div>
          </a>
        </div>

        <div className="flex flex-col w-1/4 justify-center items-center font-bold">
          {`$${commaNumber((price ?? 0).toFixed(2))}`}
        </div>

        <div className="flex flex-col w-1/3 justify-center items-center font-bold">
          {commaNumber((balance ?? 0).toFixed(4))}
        </div>

        <div className="flex flex-col w-1/3 justify-center items-center font-bold">
          {`$${commaNumber((totalPrice).toFixed(2))}`}
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-end w-1/3">
      <div className="bg-gray-900 rounded-lg flex flex-col text-white w-5/6">
        <div className="flex pt-4 items-center font-bold">
          <div className="flex w-1/4 justify-center">Token</div>
          <div className="flex flex-col w-1/4 justify-center items-center">Price</div>
          <div className="flex flex-col w-1/3 justify-center items-center">Balance</div>
          <div className="flex flex-col w-1/3 justify-center items-center">Value</div>
        </div>
        {sortedTokens.map((token) => renderItem(token))}
      </div>
    </div>
  );
}

export default TokenList;
