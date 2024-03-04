import { NextRequest, NextResponse } from "next/server";
import { createApolloClient } from "@/app/utils/apolloClient";
import { APPEND_SESS } from "@/app/graphql/queries";
import { logger } from "@/app/logger";

async function handler(
  req: NextRequest,
  { params }: { params: { username: string } },
) {
  const this_url = `[/api/db/putSession/${params.username}]`;
  logger.info(`${this_url} called`);
  const req_body = await req.json();
  logger.debug(`${this_url} Request body (session to put): ${req_body}`);
  if (!req_body) {
    logger.error(`${this_url} Request body is null, returning 400 status code`);
    return new NextResponse("Bad Request", { status: 400 });
  }

  const client = createApolloClient();

  const variables = { userName: params.username, session: req_body };
  logger.debug(`${this_url} Variables to send to graphQL server: ${variables}`);

  try {
    const { data } = await client.mutate({
      mutation: APPEND_SESS,
      variables: variables,
    });
    if (!data) {
      logger.error(
        `${this_url} GraphQL server returned NULL; returning status code 500`,
      );
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  } catch (error) {
    logger.error(
      `${this_url} Error requesting GraphQL Server ${error}; Returning 500 status code`,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
  logger.info(`${this_url} Returning 200 status code`);
  return new NextResponse("OK", { status: 200 });
}

export const POST = handler;
