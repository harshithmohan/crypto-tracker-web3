/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import { find } from 'lodash';
import commaNumber from 'comma-number';

import { useAppSelector } from '../core/hooks';
import type { FarmType } from '../core/types';

function FarmList() {
  const farms = useAppSelector((state) => state.farms);
  const tokens = useAppSelector((state) => state.tokens);

  const renderItem = (farm: FarmType) => {
    const {
      depositAmount, name, websiteName,
      pendingAmount, showTotal, link,
      token1, token2, _id,
    } = farm;

    const token1Data = find(tokens, { name: token1 });
    const token2Data = find(tokens, { name: token2 });

    const token1Price = (token1Data?.price ?? 0) * depositAmount;
    const token2Price = (token2Data?.price ?? 0) * pendingAmount;

    const token1Image = token1Data?.image;
    const token1Image2 = token1Data?.image2;
    const token2Image = token2Data?.image;

    return (
      <div className="flex py-6 items-center" key={_id}>
        <div className="flex flex-col ml-2 justify-center items-center w-1/3">
          <div className="font-semibold text-xs">{websiteName}</div>
          <a href={link ?? '#'} target="_blank" rel="noreferrer">
            <div className="font-bold">{name}</div>
          </a>
        </div>

        <div className="flex w-3/5 justify-center items-center">
          <div className="flex w-1/12 justify-center items-center">
            {token1Image2 ? (
              <React.Fragment>
                <img src={token1Image} alt={token1} className="w-8 h-8" />
                <img src={token1Image2} alt={token1} className="w-8 h-8" />
              </React.Fragment>
            ) : (
              <img src={token1Image} alt={token1} className="w-10 h-10" />
            )}
          </div>
          <div className="flex flex-col justify-center items-center w-2/5">
            <div className="font-semibold text-xs">
              {showTotal ? 'Total:' : 'Deposited:'}
            </div>
            {token1Price !== 0 ? (
              <React.Fragment>
                <div className="font-bold">{`$${commaNumber((token1Price).toFixed(2))}`}</div>
                <div className="text-xs">
                  {commaNumber((depositAmount ?? 0).toFixed(6))}
                </div>
              </React.Fragment>
            ) : (
              '-'
            )}
          </div>
        </div>

        <div className="flex w-1/3 justify-center items-center">
          {token2 && (
            <React.Fragment>
              <img src={token2Image} alt={token2} className="w-10 h-10" />
              <div className="flex flex-col justify-center items-center w-3/5">
                <div className="font-semibold text-xs">Earned:</div>
                {token2Price !== 0 ? (
                  <React.Fragment>
                    <div className="font-bold">{`$${commaNumber((token2Price).toFixed(2))}`}</div>
                    <div className="text-xs">
                      {commaNumber((pendingAmount ?? 0).toFixed(6))}
                    </div>
                  </React.Fragment>
                ) : (
                  '-'
                )}
              </div>
            </React.Fragment>
          )}
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
