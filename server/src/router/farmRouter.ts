import express from 'express';
import fetch from 'node-fetch';
import type { Db } from 'mongodb';

import type { FarmType } from '../types';

const router = express.Router();

const getAbi = async (address: string) => {
  const abi = await fetch(
    `https://api.polygonscan.com/api?module=contract&action=getabi&address=${address}`,
  ).then((res) => res.json());
  return JSON.parse(abi.result);
};

router.get('/', async (req, res) => {
  const db: Db = req.app.get('db');
  const cursor = db.collection('farms').find();
  const result: FarmType[] = [];
  await cursor.forEach((item) => {
    result.push(item);
  });
  res.json(result);
});

router.post('/', async (req, res) => {
  const db: Db = req.app.get('db');
  const collection = db.collection('farms');
  const document: FarmType = req.body;

  const abi = await getAbi(document.address);
  document.abi = abi;

  document.disabled = document?.disabled ?? false;

  await collection.insertOne(document);
  res.json();
});

export default router;
