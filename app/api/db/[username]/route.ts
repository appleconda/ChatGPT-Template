// posts.js
import clientPromise from "../../mongodb";
import { NextRequest, NextResponse } from "next/server";

async function handler(
  req: NextRequest,
  { params }: { params: { username: string } },
) {
  const client = await clientPromise;
  const db = client.db("chatapp");

  switch (req.method) {
    case "GET":
      console.log("Get method called");
      // Retrieve the user's document
      const document = await db
        .collection("store")
        .findOne({ "access-control.userName": params.username });
      if (!document) {
        return NextResponse.json({ status: 404 });
      } else {
        return NextResponse.json({ body: document }, { status: 200 });
      }

    case "DELETE":
      // Delete the user's document
      const deleteResult = await db
        .collection("store")
        .deleteOne({ "access-control.userName": params.username });
      if (deleteResult.deletedCount === 0) {
        return NextResponse.json({
          status: 404,
          body: { message: "User not found" },
        });
      } else {
        return NextResponse.json({
          status: 200,
          body: { message: "User deleted successfully" },
        });
      }

    case "PUT":
      console.log("put function called");
      // Update the user's document
      console.log("putting data into the mongo db ");
      const bodyObject = await req.json();

      const updateResult = await db
        .collection("store")
        .updateOne(
          { "access-control.userName": params.username },
          { $set: bodyObject },
        );

      if (updateResult.matchedCount === 0) {
        return NextResponse.json({
          status: 404,
          body: { message: "User not found" },
        });
      } else {
        return NextResponse.json({
          status: 200,
          body: { message: "User updated successfully" },
        });
      }

    default:
      return new NextResponse(null, {
        status: 405,
        headers: { Allow: "GET, POST, DELETE" },
      });
  }
}

export const GET = handler;
export const DELETE = handler;
export const PUT = handler;
