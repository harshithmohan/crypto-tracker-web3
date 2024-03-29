import React, { useEffect, useState } from 'react';

import FarmList from './FarmList';
import TokenList from './TokenList';
import { useAppDispatch } from '../core/hooks';
import Events from '../core/events';
import { getWeb3 } from '../core/web3Helper';

function MainPage() {
  const dispatch = useAppDispatch();

  const [ftmBalance, setFtmBalance] = useState(0);

  const ftmWeb3 = getWeb3('fantom');

  ftmWeb3.eth.getBalance(process.env.REACT_APP_DEFAULT_ADDRESS)
    .then((balance) => setFtmBalance(parseFloat(ftmWeb3.utils.fromWei(balance))));

  useEffect(() => {
    dispatch({ type: Events.GET_TOKEN_DATA });
    dispatch({ type: Events.GET_FARM_DATA });

    const intervalId = setInterval(() => {
      dispatch({ type: Events.GET_TOKEN_DATA });
      dispatch({ type: Events.GET_FARM_DATA });
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-between w-full bg-gray-900 p-5 items-center text-white">
        <div className="flex text-3xl">
          Treasury Dashboard
        </div>
        <div className="flex flex-col">
          <div className="flex items-center">
            <img src="https://assets.spookyswap.finance/tokens/FTM.png" alt="ftm" className="w-5 h-5 mr-2" />
            {`Balance: ${ftmBalance.toFixed(4)}`}
          </div>
        </div>
      </div>
      <div className="flex py-10 w-full">
        <TokenList />
        <FarmList />
      </div>
    </div>
  );
}

export default MainPage;
