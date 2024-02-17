import { NextRequest, NextResponse } from "next/server";
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
  console.log("/api/db/appendmsg/ called");
  const req_body = await req.json();
  console.log("message to put ", req_body);
  if (!req_body) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const message: Message = req_body;
  const sessionId = params.sessionid;
  console.log("Message ", message);
  console.log("session id", sessionId);

  const client = createApolloClient();

  try {
    const { data } = await client.mutate({
      mutation: APPEND_MSG,
      variables: { sessionId: sessionId, message: message },
    });
    console.log(data);
    if (!data) {
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
  return new NextResponse("OK", { status: 200 });
}

export const POST = handler;
