import React, { useEffect } from 'react';

import FarmList from './FarmList';
import TokenList from './TokenList';
import { useAppDispatch } from '../core/hooks';
import Events from '../core/events';

function MainPage() {
  const dispatch = useAppDispatch();

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
      <div className="flex justify-between w-full bg-gray-900 p-10 items-center">
        <div className="text-5xl text-white">Crypto Tracker</div>
        <div className="text-lg text-white">Total Actual Value: $1220</div>
      </div>
      <div className="flex mt-10 w-full">
        <TokenList />
        <FarmList />
      </div>
    </div>
  );
}

export default MainPage;
