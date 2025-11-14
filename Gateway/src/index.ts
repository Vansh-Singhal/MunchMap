import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createApolloGraphqlServer } from "./graphql/createApolloGraphqlServer";
import { buildContext } from "./graphql/context";
import { expressMiddleware } from "@as-integrations/express5";
import { PORT } from "./utils/config";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "*",
  credentials: true,
}));

const init = async () => {
  const apolloserver = await createApolloGraphqlServer();
  await apolloserver.start();

  app.use(
    "/graphql",
    expressMiddleware(apolloserver, {
      context: buildContext,
    })
  );

  app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
  });
};

init();
