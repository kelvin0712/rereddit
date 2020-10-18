import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import cors from "cors";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import path from "path";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: "reredis2",
    username: "postgres",
    password: "bi071297",
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    port: 5433,
    entities: [User, Post],
  });

  // run
  await conn.runMigrations();
  // Post.delete({});

  const app = express();

  // Create redis connection
  const redis = new Redis({
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
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
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
    context: ({ req, res }: MyContext) => ({ req, res, redis }),
  });

  // Create a graphql end point on express
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("Server started on localhost:4000");
  });
};

main();
