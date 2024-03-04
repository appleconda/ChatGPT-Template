import { NextRequest, NextResponse } from "next/server";
import { createApolloClient } from "@/app/utils/apolloClient";
import { logger } from "@/app/logger";
import { PUT_USER } from "@/app/graphql/queries";

async function handler(req: NextRequest) {
  const this_url = "[/api/db/putuser/]";
  logger.info(`${this_url} called...`);

  const data_to_put = await req.json();
  logger.debug(`${this_url} User Data to put: ${data_to_put}`);
  const client = createApolloClient();

  try {
    const { data } = await client.mutate({
      mutation: PUT_USER,
      variables: { data: data_to_put },
    });
    if (!data) {
      logger.error(
        `${this_url} GraphQL returned nothing; returning 500 status code`,
      );
      return NextResponse.json({ status: 500 });
    }
    logger.info(`${this_url} Returning 200 status code`);
    return NextResponse.json({ status: 200 });
  } catch (error) {
    logger.error(
      `${this_url} Error requesting GraphQL Server ${error}; Returning 500 status code`,
    );
    return NextResponse.json({ status: 500 });
  }
}

export const POST = handler;
