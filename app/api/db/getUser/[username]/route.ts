import { NextRequest, NextResponse } from "next/server";
import { createApolloClient } from "@/app/utils/apolloClient";
import { GET_USER } from "@/app/graphql/queries";

async function handler(
  req: NextRequest,
  { params }: { params: { username: string } },
) {
  console.log(`/api/db/getUser/${params.username} called`);
  const client = createApolloClient();
  try {
    const { data } = await client.query({
      query: GET_USER,
      variables: { userName: params.username },
      fetchPolicy: "no-cache",
    });

    console.log("User Data from graphQL server: ", data?.user);

    // Assuming at least one of these fields should be non-null for a valid user
    const userExists =
      data.user &&
      (data.user.accessControl ||
        data.user.appConfig ||
        data.user.chat_next_web_store ||
        data.user.maskStore ||
        data.user.promptStore);

    if (!userExists) {
      console.log("All properties are null for user: ", params.username);
      return new NextResponse("User not found", { status: 404 });
    }

    return new NextResponse(JSON.stringify(data.user), { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const GET = handler;
