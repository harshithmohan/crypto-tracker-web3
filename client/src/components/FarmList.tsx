/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import { find } from 'lodash';

import { useAppSelector } from '../core/hooks';
import type { FarmType } from '../core/types';

function FarmList() {
  const farms = useAppSelector((state) => state.farms);
  const tokens = useAppSelector((state) => state.tokens);

  const renderItem = (farm: FarmType) => {
    const {
      depositAmount, name, websiteName,
      pendingAmount, hideEarned, showTotal, link,
      blockCountdownTime, blockCountdownText,
      token1, token2, _id,
    } = farm;

    if (depositAmount === 0 && (hideEarned || pendingAmount === 0)) return (null);

    const token1Data = find(tokens, { name: token1 });
    const token2Data = find(tokens, { name: token2 });

    const token1Price = (token1Data?.price ?? 0) * depositAmount;
    const token2Price = (token2Data?.price ?? 0) * pendingAmount;

    const token1Image = token1Data?.image;
    const token2Image = token2Data?.image;

    return (
      <div className="flex py-6 items-center" key={_id}>
        <div className="flex flex-col ml-2 justify-center items-center w-1/3">
          <div className="font-semibold text-xs">{websiteName}</div>
          <a href={link ?? '#'} target="_blank" rel="noreferrer">
            <div className="font-bold">{name}</div>
          </a>
          {blockCountdownTime && (
            <div className="text-xs">{blockCountdownText + blockCountdownTime}</div>
          )}
        </div>

        <div className="flex w-1/3 justify-center items-center">
          <img src={token1Image} alt={token1} className="w-10 h-10" />
          <div className="flex flex-col ml-2 justify-center items-center w-3/5">
            <div className="font-semibold text-xs">
              {showTotal ? 'Total:' : 'Deposited:'}
            </div>
            <div className="font-bold">{depositAmount}</div>
            {token1Price && (
              <React.Fragment>
                <div className="text-xs">
                  {`~$${(token1Price).toFixed(4)}`}
                </div>
                <div className="text-xs">
                  {`(~₹${(token1Price * 75).toFixed(2)})`}
                </div>
              </React.Fragment>
            )}
          </div>
        </div>

        <div className="flex w-1/3 justify-center items-center">
          <img src={token2Image} alt={token2} className="w-10 h-10" />
          <div className="flex flex-col ml-2 justify-center items-center w-3/5">
            <div className="font-semibold text-xs">Earned:</div>
            <div className="font-bold">
              {
                hideEarned
                  ? 'NA'
                  : pendingAmount
              }
            </div>
            {(!hideEarned || token2Price !== 0) && (
              <React.Fragment>
                <div className="text-xs">
                  {`~$${(token2Price).toFixed(4)}`}
                </div>
                <div className="text-xs">
                  {`(~₹${(token2Price * 75).toFixed(2)})`}
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-center w-2/3">
      <div className="bg-gray-900 rounded-lg flex flex-col text-white w-5/6">
        {farms.map((farm) => renderItem(farm))}
      </div>
    </div>
  );
}

export default FarmList;
