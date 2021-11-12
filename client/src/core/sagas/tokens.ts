/* eslint-disable @typescript-eslint/naming-convention */
import {
  all, call, put, select,
} from 'redux-saga/effects';
import {
  filter, find, isUndefined, sortBy,
} from 'lodash';
import type { PayloadAction } from '@reduxjs/toolkit';
import dotenv from 'dotenv';
import type { AbiItem } from 'web3-utils';

import ApiCall from '../api';
import Events from '../events';
import { setBalance, setPrice, setTokens } from '../slices/tokens';
import { getLocalWeb3, getUserWeb3 } from '../web3Helper';
import type { TokenType } from '../types';
import type { RootState } from '../store';

dotenv.config();

const defaultAddress = process.env.REACT_APP_DEFAULT_ADDRESS;
const serverURL = process.env.REACT_APP_SERVER_URL;

const lpABI = {
  matic: [{ inputs: [], stateMutability: 'nonpayable', type: 'constructor' }, {
    anonymous: false,
    inputs: [{
      indexed: true, internalType: 'address', name: 'owner', type: 'address',
    }, {
      indexed: true, internalType: 'address', name: 'spender', type: 'address',
    }, {
      indexed: false, internalType: 'uint256', name: 'value', type: 'uint256',
    }],
    name: 'Approval',
    type: 'event',
  }, {
    anonymous: false,
    inputs: [{
      indexed: true, internalType: 'address', name: 'sender', type: 'address',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount0', type: 'uint256',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount1', type: 'uint256',
    }, {
      indexed: true, internalType: 'address', name: 'to', type: 'address',
    }],
    name: 'Burn',
    type: 'event',
  }, {
    anonymous: false,
    inputs: [{
      indexed: true, internalType: 'address', name: 'sender', type: 'address',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount0', type: 'uint256',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount1', type: 'uint256',
    }],
    name: 'Mint',
    type: 'event',
  }, {
    anonymous: false,
    inputs: [{
      indexed: true, internalType: 'address', name: 'sender', type: 'address',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount0In', type: 'uint256',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount1In', type: 'uint256',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount0Out', type: 'uint256',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount1Out', type: 'uint256',
    }, {
      indexed: true, internalType: 'address', name: 'to', type: 'address',
    }],
    name: 'Swap',
    type: 'event',
  }, {
    anonymous: false,
    inputs: [{
      indexed: false, internalType: 'uint112', name: 'reserve0', type: 'uint112',
    }, {
      indexed: false, internalType: 'uint112', name: 'reserve1', type: 'uint112',
    }],
    name: 'Sync',
    type: 'event',
  }, {
    anonymous: false,
    inputs: [{
      indexed: true, internalType: 'address', name: 'from', type: 'address',
    }, {
      indexed: true, internalType: 'address', name: 'to', type: 'address',
    }, {
      indexed: false, internalType: 'uint256', name: 'value', type: 'uint256',
    }],
    name: 'Transfer',
    type: 'event',
  }, {
    inputs: [], name: 'DOMAIN_SEPARATOR', outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [], name: 'MINIMUM_LIQUIDITY', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [], name: 'PERMIT_TYPEHASH', outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [{ internalType: 'address', name: '', type: 'address' }, { internalType: 'address', name: '', type: 'address' }], name: 'allowance', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'approve', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function',
  }, {
    inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'balanceOf', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [{ internalType: 'address', name: 'to', type: 'address' }], name: 'burn', outputs: [{ internalType: 'uint256', name: 'amount0', type: 'uint256' }, { internalType: 'uint256', name: 'amount1', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function',
  }, {
    inputs: [], name: 'decimals', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [], name: 'factory', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [], name: 'getReserves', outputs: [{ internalType: 'uint112', name: '_reserve0', type: 'uint112' }, { internalType: 'uint112', name: '_reserve1', type: 'uint112' }, { internalType: 'uint32', name: '_blockTimestampLast', type: 'uint32' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [{ internalType: 'address', name: '_token0', type: 'address' }, { internalType: 'address', name: '_token1', type: 'address' }], name: 'initialize', outputs: [], stateMutability: 'nonpayable', type: 'function',
  }, {
    inputs: [], name: 'kLast', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [{ internalType: 'address', name: 'to', type: 'address' }], name: 'mint', outputs: [{ internalType: 'uint256', name: 'liquidity', type: 'uint256' }], stateMutability: 'nonpayable', type: 'function',
  }, {
    inputs: [], name: 'name', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'nonces', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }, { internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }, { internalType: 'uint8', name: 'v', type: 'uint8' }, { internalType: 'bytes32', name: 'r', type: 'bytes32' }, { internalType: 'bytes32', name: 's', type: 'bytes32' }], name: 'permit', outputs: [], stateMutability: 'nonpayable', type: 'function',
  }, {
    inputs: [], name: 'price0CumulativeLast', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [], name: 'price1CumulativeLast', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [{ internalType: 'address', name: 'to', type: 'address' }], name: 'skim', outputs: [], stateMutability: 'nonpayable', type: 'function',
  }, {
    inputs: [{ internalType: 'uint256', name: 'amount0Out', type: 'uint256' }, { internalType: 'uint256', name: 'amount1Out', type: 'uint256' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'bytes', name: 'data', type: 'bytes' }], name: 'swap', outputs: [], stateMutability: 'nonpayable', type: 'function',
  }, {
    inputs: [], name: 'symbol', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [], name: 'sync', outputs: [], stateMutability: 'nonpayable', type: 'function',
  }, {
    inputs: [], name: 'token0', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [], name: 'token1', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [], name: 'totalSupply', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [{ internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'transfer', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function',
  }, {
    inputs: [{ internalType: 'address', name: 'from', type: 'address' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'transferFrom', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function',
  }],
  ftm: [{
    inputs: [], payable: false, stateMutability: 'nonpayable', type: 'constructor',
  }, {
    anonymous: false,
    inputs: [{
      indexed: true, internalType: 'address', name: 'owner', type: 'address',
    }, {
      indexed: true, internalType: 'address', name: 'spender', type: 'address',
    }, {
      indexed: false, internalType: 'uint256', name: 'value', type: 'uint256',
    }],
    name: 'Approval',
    type: 'event',
  }, {
    anonymous: false,
    inputs: [{
      indexed: true, internalType: 'address', name: 'sender', type: 'address',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount0', type: 'uint256',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount1', type: 'uint256',
    }, {
      indexed: true, internalType: 'address', name: 'to', type: 'address',
    }],
    name: 'Burn',
    type: 'event',
  }, {
    anonymous: false,
    inputs: [{
      indexed: true, internalType: 'address', name: 'sender', type: 'address',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount0', type: 'uint256',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount1', type: 'uint256',
    }],
    name: 'Mint',
    type: 'event',
  }, {
    anonymous: false,
    inputs: [{
      indexed: true, internalType: 'address', name: 'sender', type: 'address',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount0In', type: 'uint256',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount1In', type: 'uint256',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount0Out', type: 'uint256',
    }, {
      indexed: false, internalType: 'uint256', name: 'amount1Out', type: 'uint256',
    }, {
      indexed: true, internalType: 'address', name: 'to', type: 'address',
    }],
    name: 'Swap',
    type: 'event',
  }, {
    anonymous: false,
    inputs: [{
      indexed: false, internalType: 'uint112', name: 'reserve0', type: 'uint112',
    }, {
      indexed: false, internalType: 'uint112', name: 'reserve1', type: 'uint112',
    }],
    name: 'Sync',
    type: 'event',
  }, {
    anonymous: false,
    inputs: [{
      indexed: true, internalType: 'address', name: 'from', type: 'address',
    }, {
      indexed: true, internalType: 'address', name: 'to', type: 'address',
    }, {
      indexed: false, internalType: 'uint256', name: 'value', type: 'uint256',
    }],
    name: 'Transfer',
    type: 'event',
  }, {
    constant: true, inputs: [], name: 'DOMAIN_SEPARATOR', outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: true, inputs: [], name: 'MINIMUM_LIQUIDITY', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: true, inputs: [], name: 'PERMIT_TYPEHASH', outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: true, inputs: [{ internalType: 'address', name: '', type: 'address' }, { internalType: 'address', name: '', type: 'address' }], name: 'allowance', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: false, inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'approve', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: true, inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'balanceOf', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: false, inputs: [{ internalType: 'address', name: 'to', type: 'address' }], name: 'burn', outputs: [{ internalType: 'uint256', name: 'amount0', type: 'uint256' }, { internalType: 'uint256', name: 'amount1', type: 'uint256' }], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: true, inputs: [], name: 'decimals', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: true, inputs: [], name: 'factory', outputs: [{ internalType: 'address', name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: true, inputs: [], name: 'getReserves', outputs: [{ internalType: 'uint112', name: '_reserve0', type: 'uint112' }, { internalType: 'uint112', name: '_reserve1', type: 'uint112' }, { internalType: 'uint32', name: '_blockTimestampLast', type: 'uint32' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: false, inputs: [{ internalType: 'address', name: '_token0', type: 'address' }, { internalType: 'address', name: '_token1', type: 'address' }], name: 'initialize', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: true, inputs: [], name: 'kLast', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: false, inputs: [{ internalType: 'address', name: 'to', type: 'address' }], name: 'mint', outputs: [{ internalType: 'uint256', name: 'liquidity', type: 'uint256' }], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: true, inputs: [], name: 'name', outputs: [{ internalType: 'string', name: '', type: 'string' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: true, inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'nonces', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: false, inputs: [{ internalType: 'address', name: 'owner', type: 'address' }, { internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }, { internalType: 'uint256', name: 'deadline', type: 'uint256' }, { internalType: 'uint8', name: 'v', type: 'uint8' }, { internalType: 'bytes32', name: 'r', type: 'bytes32' }, { internalType: 'bytes32', name: 's', type: 'bytes32' }], name: 'permit', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: true, inputs: [], name: 'price0CumulativeLast', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: true, inputs: [], name: 'price1CumulativeLast', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: false, inputs: [{ internalType: 'address', name: 'to', type: 'address' }], name: 'skim', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: false, inputs: [{ internalType: 'uint256', name: 'amount0Out', type: 'uint256' }, { internalType: 'uint256', name: 'amount1Out', type: 'uint256' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'bytes', name: 'data', type: 'bytes' }], name: 'swap', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: true, inputs: [], name: 'symbol', outputs: [{ internalType: 'string', name: '', type: 'string' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: false, inputs: [], name: 'sync', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: true, inputs: [], name: 'token0', outputs: [{ internalType: 'address', name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: true, inputs: [], name: 'token1', outputs: [{ internalType: 'address', name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: true, inputs: [], name: 'totalSupply', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: false, inputs: [{ internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'transfer', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: false, inputs: [{ internalType: 'address', name: 'from', type: 'address' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }], name: 'transferFrom', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function',
  }],
  cronos: [{
    type: 'constructor', stateMutability: 'nonpayable', payable: false, inputs: [],
  }, {
    type: 'event',
    name: 'Approval',
    inputs: [{
      type: 'address', name: 'owner', internalType: 'address', indexed: true,
    }, {
      type: 'address', name: 'spender', internalType: 'address', indexed: true,
    }, {
      type: 'uint256', name: 'value', internalType: 'uint256', indexed: false,
    }],
    anonymous: false,
  }, {
    type: 'event',
    name: 'Burn',
    inputs: [{
      type: 'address', name: 'sender', internalType: 'address', indexed: true,
    }, {
      type: 'uint256', name: 'amount0', internalType: 'uint256', indexed: false,
    }, {
      type: 'uint256', name: 'amount1', internalType: 'uint256', indexed: false,
    }, {
      type: 'address', name: 'to', internalType: 'address', indexed: true,
    }],
    anonymous: false,
  }, {
    type: 'event',
    name: 'Mint',
    inputs: [{
      type: 'address', name: 'sender', internalType: 'address', indexed: true,
    }, {
      type: 'uint256', name: 'amount0', internalType: 'uint256', indexed: false,
    }, {
      type: 'uint256', name: 'amount1', internalType: 'uint256', indexed: false,
    }],
    anonymous: false,
  }, {
    type: 'event',
    name: 'Swap',
    inputs: [{
      type: 'address', name: 'sender', internalType: 'address', indexed: true,
    }, {
      type: 'uint256', name: 'amount0In', internalType: 'uint256', indexed: false,
    }, {
      type: 'uint256', name: 'amount1In', internalType: 'uint256', indexed: false,
    }, {
      type: 'uint256', name: 'amount0Out', internalType: 'uint256', indexed: false,
    }, {
      type: 'uint256', name: 'amount1Out', internalType: 'uint256', indexed: false,
    }, {
      type: 'address', name: 'to', internalType: 'address', indexed: true,
    }],
    anonymous: false,
  }, {
    type: 'event',
    name: 'Sync',
    inputs: [{
      type: 'uint112', name: 'reserve0', internalType: 'uint112', indexed: false,
    }, {
      type: 'uint112', name: 'reserve1', internalType: 'uint112', indexed: false,
    }],
    anonymous: false,
  }, {
    type: 'event',
    name: 'Transfer',
    inputs: [{
      type: 'address', name: 'from', internalType: 'address', indexed: true,
    }, {
      type: 'address', name: 'to', internalType: 'address', indexed: true,
    }, {
      type: 'uint256', name: 'value', internalType: 'uint256', indexed: false,
    }],
    anonymous: false,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'bytes32', name: '', internalType: 'bytes32' }], name: 'DOMAIN_SEPARATOR', inputs: [], constant: true,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }], name: 'MINIMUM_LIQUIDITY', inputs: [], constant: true,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'bytes32', name: '', internalType: 'bytes32' }], name: 'PERMIT_TYPEHASH', inputs: [], constant: true,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }], name: 'allowance', inputs: [{ type: 'address', name: '', internalType: 'address' }, { type: 'address', name: '', internalType: 'address' }], constant: true,
  }, {
    type: 'function', stateMutability: 'nonpayable', payable: false, outputs: [{ type: 'bool', name: '', internalType: 'bool' }], name: 'approve', inputs: [{ type: 'address', name: 'spender', internalType: 'address' }, { type: 'uint256', name: 'value', internalType: 'uint256' }], constant: false,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }], name: 'balanceOf', inputs: [{ type: 'address', name: '', internalType: 'address' }], constant: true,
  }, {
    type: 'function', stateMutability: 'nonpayable', payable: false, outputs: [{ type: 'uint256', name: 'amount0', internalType: 'uint256' }, { type: 'uint256', name: 'amount1', internalType: 'uint256' }], name: 'burn', inputs: [{ type: 'address', name: 'to', internalType: 'address' }], constant: false,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'uint8', name: '', internalType: 'uint8' }], name: 'decimals', inputs: [], constant: true,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'address', name: '', internalType: 'address' }], name: 'factory', inputs: [], constant: true,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'uint112', name: '_reserve0', internalType: 'uint112' }, { type: 'uint112', name: '_reserve1', internalType: 'uint112' }, { type: 'uint32', name: '_blockTimestampLast', internalType: 'uint32' }], name: 'getReserves', inputs: [], constant: true,
  }, {
    type: 'function', stateMutability: 'nonpayable', payable: false, outputs: [], name: 'initialize', inputs: [{ type: 'address', name: '_token0', internalType: 'address' }, { type: 'address', name: '_token1', internalType: 'address' }], constant: false,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }], name: 'kLast', inputs: [], constant: true,
  }, {
    type: 'function', stateMutability: 'nonpayable', payable: false, outputs: [{ type: 'uint256', name: 'liquidity', internalType: 'uint256' }], name: 'mint', inputs: [{ type: 'address', name: 'to', internalType: 'address' }], constant: false,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'string', name: '', internalType: 'string' }], name: 'name', inputs: [], constant: true,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }], name: 'nonces', inputs: [{ type: 'address', name: '', internalType: 'address' }], constant: true,
  }, {
    type: 'function', stateMutability: 'nonpayable', payable: false, outputs: [], name: 'permit', inputs: [{ type: 'address', name: 'owner', internalType: 'address' }, { type: 'address', name: 'spender', internalType: 'address' }, { type: 'uint256', name: 'value', internalType: 'uint256' }, { type: 'uint256', name: 'deadline', internalType: 'uint256' }, { type: 'uint8', name: 'v', internalType: 'uint8' }, { type: 'bytes32', name: 'r', internalType: 'bytes32' }, { type: 'bytes32', name: 's', internalType: 'bytes32' }], constant: false,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }], name: 'price0CumulativeLast', inputs: [], constant: true,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }], name: 'price1CumulativeLast', inputs: [], constant: true,
  }, {
    type: 'function', stateMutability: 'nonpayable', payable: false, outputs: [], name: 'skim', inputs: [{ type: 'address', name: 'to', internalType: 'address' }], constant: false,
  }, {
    type: 'function', stateMutability: 'nonpayable', payable: false, outputs: [], name: 'swap', inputs: [{ type: 'uint256', name: 'amount0Out', internalType: 'uint256' }, { type: 'uint256', name: 'amount1Out', internalType: 'uint256' }, { type: 'address', name: 'to', internalType: 'address' }, { type: 'bytes', name: 'data', internalType: 'bytes' }], constant: false,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'string', name: '', internalType: 'string' }], name: 'symbol', inputs: [], constant: true,
  }, {
    type: 'function', stateMutability: 'nonpayable', payable: false, outputs: [], name: 'sync', inputs: [], constant: false,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'address', name: '', internalType: 'address' }], name: 'token0', inputs: [], constant: true,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'address', name: '', internalType: 'address' }], name: 'token1', inputs: [], constant: true,
  }, {
    type: 'function', stateMutability: 'view', payable: false, outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }], name: 'totalSupply', inputs: [], constant: true,
  }, {
    type: 'function', stateMutability: 'nonpayable', payable: false, outputs: [{ type: 'bool', name: '', internalType: 'bool' }], name: 'transfer', inputs: [{ type: 'address', name: 'to', internalType: 'address' }, { type: 'uint256', name: 'value', internalType: 'uint256' }], constant: false,
  }, {
    type: 'function', stateMutability: 'nonpayable', payable: false, outputs: [{ type: 'bool', name: '', internalType: 'bool' }], name: 'transferFrom', inputs: [{ type: 'address', name: 'from', internalType: 'address' }, { type: 'address', name: 'to', internalType: 'address' }, { type: 'uint256', name: 'value', internalType: 'uint256' }], constant: false,
  }],
} as { [key: string]: AbiItem[] };

function* getTokenBalance(action: PayloadAction<TokenType>) {
  const { payload } = action;
  const {
    contract, _id, beefyLPName, chain,
    decimals,
  } = payload;

  if (beefyLPName) {
    yield put(setBalance({ _id, balance: 0 }));
    return;
  }

  const web3 = getUserWeb3(chain);
  const accounts = yield call(web3.eth.getAccounts);
  const myAddress = accounts[0] ?? defaultAddress;

  const weiBalance = yield call(contract.methods.balanceOf(myAddress).call);
  const balance = parseFloat(web3.utils.fromWei(weiBalance, (decimals === 6) ? 'mwei' : 'ether'));

  yield put(setBalance({ _id, balance }));
}

function* getTokenPrice(action: PayloadAction<TokenType>) {
  const { payload } = action;
  const {
    name, address, _id, lpAddress, chain,
  } = payload;
  let price = 0;

  if (['DAI', 'USDT', 'USDC'].includes(name)) {
    price = 1;
  } else if (lpAddress) {
    const web3 = getLocalWeb3(chain);
    const lpContract = new web3.eth.Contract(lpABI[chain], lpAddress);

    const token0 = yield call(lpContract.methods.token0().call);
    const token1 = yield call(lpContract.methods.token1().call);
    const reserves = yield call(lpContract.methods.getReserves().call);

    let reserve0 = 0;
    let reserve1 = 0;

    if (token0.toLowerCase() === '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
      || token0.toLowerCase() === '0x04068da6c83afcfa0e13ba15a6696662335d5b75'
      || token0.toLowerCase() === '0xc21223249ca28397b4b6541dffaecc539bff0c59') {
      reserve0 = parseFloat(web3.utils.fromWei(reserves[0], 'mwei'));
      reserve1 = parseFloat(web3.utils.fromWei(reserves[1]));
    } else if (token1.toLowerCase() === '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
      || token1.toLowerCase() === '0x04068da6c83afcfa0e13ba15a6696662335d5b75'
      || token1.toLowerCase() === '0xc21223249ca28397b4b6541dffaecc539bff0c59') {
      reserve0 = parseFloat(web3.utils.fromWei(reserves[1], 'mwei'));
      reserve1 = parseFloat(web3.utils.fromWei(reserves[0]));
    }

    price = parseFloat((reserve0 / reserve1).toFixed(4));
  } else {
    const decimals = payload.decimals ?? 18;

    const baseUrl = 'https://polygon.api.0x.org/swap/v1/price?';
    const options = `sellToken=USDC&buyToken=${address}&buyAmount=${'100'.padEnd(decimals, '0')}`;

    const response = yield call(ApiCall, baseUrl + options);

    price = parseFloat(parseFloat(response.price).toFixed(4));
  }

  yield put(setPrice({ _id, price }));
}

function* getLPTokenPrice(action: PayloadAction<TokenType>) {
  const { payload } = action;
  const {
    name, address, _id,
    contract, chain,
  } = payload;

  const web3 = getLocalWeb3(chain);

  let price = 0;

  const tokens = yield select((state: RootState) => state.tokens);

  const lpTokens = name.split('-');
  const lpToken1: TokenType = find(tokens, { name: lpTokens[0], chain });
  const lpToken2: TokenType = find(tokens, { name: lpTokens[1], chain });

  if (isUndefined(lpToken1) || isUndefined(lpToken2)) return;

  const lpToken1WeiBalance = yield call(lpToken1.contract.methods.balanceOf(address).call);
  const lpToken2WeiBalance = yield call(lpToken2.contract.methods.balanceOf(address).call);

  const lpToken1Balance = parseFloat(web3.utils.fromWei(lpToken1WeiBalance, (lpToken1.decimals === 6) ? 'mwei' : 'ether'));
  const lpToken2Balance = parseFloat(web3.utils.fromWei(lpToken2WeiBalance, (lpToken2.decimals === 6) ? 'mwei' : 'ether'));

  const totalValue = (lpToken1Balance * lpToken1.price) + (lpToken2Balance * lpToken2.price);

  const totalSupply = parseFloat(
    web3.utils.fromWei(yield call(contract.methods.totalSupply().call)),
  );

  price = totalValue / totalSupply;

  yield put(setPrice({ _id, price }));
}

function* getTokenData() {
  let tokenData: TokenType[] = yield call(ApiCall, `${serverURL}/tokens`);
  tokenData = filter(tokenData, (token) => !token.disabled);
  tokenData = sortBy(tokenData, (token) => token.name.toLowerCase());

  for (let i = 0; i < tokenData.length; i += 1) {
    const token = tokenData[i];
    const web3 = getLocalWeb3(token.chain);
    tokenData[i].contract = new web3.eth.Contract(token.abi, token.address);
  }

  yield put(setTokens(tokenData));

  yield all(tokenData.map(
    (token) => call(getTokenBalance, { type: Events.GET_TOKEN_BALANCE, payload: token }),
  ));

  const normalTokens = filter(tokenData, (token) => (!token.isLP && !token.beefyLPName));
  const lpTokens = filter(tokenData, (token) => token.isLP);
  const beefyLPTokens = filter(tokenData, (token) => !isUndefined(token.beefyLPName));

  yield all(normalTokens.map(
    (token) => call(getTokenPrice, { type: Events.GET_TOKEN_PRICE, payload: token }),
  ));

  yield all(lpTokens.map(
    (token) => call(getLPTokenPrice, { type: Events.GET_LP_TOKEN_PRICE, payload: token }),
  ));

  if (beefyLPTokens.length > 0) {
    const prices = yield call(ApiCall, 'https://api.beefy.finance/lps');
    for (let i = 0; i < beefyLPTokens.length; i += 1) {
      const { _id, beefyLPName } = beefyLPTokens[i];
      const price = prices[beefyLPName];
      yield put(setPrice({ _id, price }));
    }
  }
}

export default {
  getLPTokenPrice,
  getTokenBalance,
  getTokenData,
  getTokenPrice,
};
