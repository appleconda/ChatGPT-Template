import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/app/logger";
import { createApolloClient } from "@/app/utils/apolloClient";
import { APPEND_MSG } from "@/app/graphql/queries";

interface Message {
  id: string;
  date: string;
  role: string;
  content: string;
  streaming?: boolean;
  model?: string;
}

async function handler(
  req: NextRequest,
  { params }: { params: { sessionid: string } },
) {
  const this_url = `[/api/db/putMsg/${params.sessionid}]`;
  logger.info(`${this_url} called`);

  const req_body = await req.json();
  logger.debug(`${this_url} Request body (message to put): ${req_body}`);

  if (!req_body) {
    logger.error(`${this_url} Request body is null, returning 400 status code`);
    return new NextResponse("Bad Request", { status: 400 });
  }

  const message: Message = req_body;
  const sessionId = params.sessionid;

  const client = createApolloClient();

  try {
    const { data } = await client.mutate({
      mutation: APPEND_MSG,
      variables: { sessionId: sessionId, message: message },
    });
    console.log(data);
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
