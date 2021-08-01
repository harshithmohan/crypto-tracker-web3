import React, { useEffect, useState } from 'react';

import FarmList from './FarmList';
import TokenList from './TokenList';
import { useAppDispatch } from '../core/hooks';
import Events from '../core/events';
import { getUserWeb3 } from '../core/web3Helper';

function MainPage() {
  const dispatch = useAppDispatch();

  const [maticBalance, setMaticBalance] = useState(0);

  const web3 = getUserWeb3();

  web3.eth.getBalance(web3.eth.getAccounts[0] ?? process.env.REACT_APP_DEFAULT_ADDRESS)
    .then((balance) => setMaticBalance(parseFloat(web3.utils.fromWei(balance))));

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
          Crypto Tracker
        </div>
        <div className="flex">
          <img src="https://polycat.finance/images/tokens/wmatic.svg" alt="matic" className="w-5 mr-2" />
          {`Balance: ${maticBalance.toFixed(4)}`}
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
