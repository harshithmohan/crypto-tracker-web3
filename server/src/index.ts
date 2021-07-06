import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

import farmRouter from './router/farmRouter';
import tokenRouter from './router/tokenRouter';

dotenv.config();

const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.use('/tokens', tokenRouter);
app.use('/farms', farmRouter);

app.get('/', (req, res) => {
  res.send('Hello world!');
});

client.connect()
  .then(() => {
    app.set('db', client.db('cryptotracker'));
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`server started at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    client.close();
  });
