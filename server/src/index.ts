import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import cors from "cors";

const main = async () => {
  // Connect to the database
  const orm = await MikroORM.init(mikroConfig);
  // Run migration
  await orm.getMigrator().up();

  const app = express();

  // Create redis connection
  const redisClient = redis.createClient({
    host: "0.0.0.0",
    port: 6379,
  });
  const RedisStore = connectRedis(session);

  // Apply cors globally
  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000",
    })
  );

  // Set up express session to store cookie in the browser
  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        secure: __prod__, // cookie only works in https
        sameSite: "lax",
      },
      saveUninitialized: false,
      secret: "Thisfdsajklfjdlsajiwrejfkdlsjflkdsjalkj",
      resave: false,
    })
  );

  // Create Apollo server
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }: MyContext) => ({ em: orm.em, req, res }),
  });

  // Create a graphql end point on express
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("Server started on localhost:4000");
  });
};

main();
