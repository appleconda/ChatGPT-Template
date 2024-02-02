import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../mongodb";

interface Message {
  id: string;
  date: string;
  role: string;
  content: string;
  streaming?: boolean;
  model?: string;
}

async function appendMessageToSession(
  req: NextRequest,
  { params }: { params: { sessionid: string } },
) {
  console.log(`[DB] putmsg/db/${params.sessionid} called`);
  if (!req.body) {
    return NextResponse.json({
      status: 400,
      body: { error: "Request body is missing" },
    });
  }

  const message: Message = await req.json(); // Assuming the message object is sent in the request body
  const sessionId = params.sessionid;
  console.log(sessionId);

  if (!sessionId) {
    return NextResponse.json({
      status: 400,
      body: { error: "Session ID is missing" },
    });
  }

  const client = await clientPromise;
  const db = client.db("chatapp");

  try {
    // Using MongoDB's $push operator to append the message to the specific session's messages array
    const updateResult = await db
      .collection("store")
      .updateOne(
        { "chat-next-web-store.sessions.id": sessionId },
        { $push: { "chat-next-web-store.sessions.$.messages": message } },
      );

    // Check if the session was found and updated
    if (updateResult.matchedCount === 0) {
      return NextResponse.json({
        status: 404,
        body: { error: "Session not found" },
      });
    }

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({
        status: 500,
        body: { error: "Failed to append message to session" },
      });
    }

    return NextResponse.json({ status: 200, body: { success: true } });
  } catch (error) {
    console.error("Error appending message to session:", error);
    throw error; // Or handle the error as per your application's error handling policy
  } finally {
    // Optional: close the client if you are not reusing it elsewhere
    // await client.close();
  }
}

export const PUT = appendMessageToSession;
