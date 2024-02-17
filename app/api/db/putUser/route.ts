import { NextRequest, NextResponse } from "next/server";
import { createApolloClient } from "@/app/utils/apolloClient";
import { PUT_USER } from "@/app/graphql/queries";

async function handler(req: NextRequest) {
  console.log("/api/db/putuser/ called");
  const data_to_put = await req.json();
  console.log("putting following data in DB ", data_to_put);
  const client = createApolloClient();

  try {
    const { data } = await client.mutate({
      mutation: PUT_USER,
      variables: { data: data_to_put },
    });
    if (!data) {
      return NextResponse.json({ status: 500 });
    }
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500 });
  }
}

export const POST = handler;
