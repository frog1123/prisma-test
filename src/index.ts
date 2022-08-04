import { join } from 'path';
import 'dotenv/config';
import gradient from 'gradient-string';

import { MongoClient } from 'mongodb';
import { ApolloServer } from 'apollo-server-express';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import express, { Request as req, Response as res } from 'express';
import cors from 'cors';

import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

// graphql
import { hello as gql_hello } from './graphql/resolvers/hello.js';

const graphql = {
  hello: gql_hello
};

const color = gradient(['#8229c6', '#2bf2e5']);

const client = new MongoClient(typeof process.env.DATABASE_URL === 'undefined' ? '' : process.env.DATABASE_URL.toString());
client.connect(() => console.log(`Connected to ${color('database')}`));
export const db = client.db();

(async () => {
  const app = express();
  app.use(cors({ credentials: true, origin: ['http://localhost:3000', 'https://studio.apollographql.com'] }));
  app.use('/rest', (req: req, res: res) => {
    res.json({ message: 'hello from rest' });
  });

  const schema = loadSchemaSync(join('src', 'graphql', 'schemas', '*.gql'), { loaders: [new GraphQLFileLoader()] });
  const server = new ApolloServer({
    typeDefs: schema,
    resolvers: [graphql.hello],
    context: ({ req, res }: { req: req; res: res }) => ({ req, res })
  });

  await server.start();
  server.applyMiddleware({
    app,
    cors: {
      credentials: true,
      origin: ['http://localhost:3000', 'https://studio.apollographql.com']
    }
  });

  app.listen(process.env.PORT ?? 9000, () => console.log(`Server listening on port ${color(process.env.PORT ?? '9000')}`));
})()
  .catch(err => console.log(err))
  .finally(async () => await prisma.$disconnect());
