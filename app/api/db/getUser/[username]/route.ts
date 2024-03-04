import { NextRequest, NextResponse } from "next/server";
import { createApolloClient } from "@/app/utils/apolloClient";
import { logger } from "@/app/logger";
import { GET_USER } from "@/app/graphql/queries";

async function handler(
  req: NextRequest,
  { params }: { params: { username: string } },
) {
  const this_url = `[/api/db/getUser/${params.username}]`;
  logger.info(`${this_url} called`);

  logger.info(`${this_url} Querying user data from graphQL server`);
  const client = createApolloClient();
  try {
    const { data } = await client.query({
      query: GET_USER,
      variables: { userName: params.username },
      fetchPolicy: "no-cache",
    });

    console.log(`${this_url} User Data from graphQL server: ${data?.user}`);

    // Assuming at least one of these fields should be non-null for a valid user
    console.log(`${this_url} Checking if User Data is not null`);
    const userExists =
      data.user &&
      (data.user.accessControl ||
        data.user.appConfig ||
        data.user.chat_next_web_store ||
        data.user.maskStore ||
        data.user.promptStore);

    if (!userExists) {
      logger.info(
        `${this_url} All properties are null, returning 404 status code`,
      );
      return new NextResponse("User not found", { status: 404 });
    }
    logger.info(
      `${this_url} User Data is valid returning 200 status code and user data`,
    );
    return new NextResponse(JSON.stringify(data.user), { status: 200 });
  } catch (error) {
    logger.error(
      `${this_url}Error fetching user data from graphQL server ${error}`,
    );
    logger.info(`${this_url} Returning 500 status code`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const GET = handler;
