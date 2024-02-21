import { NextRequest, NextResponse } from "next/server";
import { createApolloClient } from "@/app/utils/apolloClient";
import { APPEND_SESS } from "@/app/graphql/queries";

async function handler(
  req: NextRequest,
  { params }: { params: { username: string } },
) {
  console.log("/api/db/putSession/ called");
  const req_body = await req.json();
  if (!req_body) return new NextResponse("Bad Request", { status: 400 });

  console.log("session to put ", req_body);

  const client = createApolloClient();

  try {
    const { data } = await client.mutate({
      mutation: APPEND_SESS,
      variables: { userName: params.username, session: req_body },
    });
    if (!data)
      return new NextResponse("Internal Server Error", { status: 500 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
  return new NextResponse("OK", { status: 200 });
}

export const POST = handler;
