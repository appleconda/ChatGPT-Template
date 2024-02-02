import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../mongodb";

async function doesUserExist(
  req: NextRequest,
  { params }: { params: { username: string } },
) {
  const client = await clientPromise;
  const db = client.db("chatapp");

  try {
    // Search for a document with the given username
    const userDocument = await db
      .collection("store")
      .findOne({ "access-control.userName": params.username });

    // Check if a document was found

    const DoesExist = userDocument != null;
    return NextResponse.json({ status: 200, body: { Exists: DoesExist } });
  } catch (error) {
    console.error("Error checking user existence:", error);
    throw error; // Or handle the error as per your application's error handling policy
  } finally {
    // Optional: close the client if you are not reusing it elsewhere
    // await client.close();
  }
}

export const GET = doesUserExist;
