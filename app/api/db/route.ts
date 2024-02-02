// posts.js
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../mongodb";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

async function handler(req: NextRequest) {
  console.log("post method called");
  const client = await clientPromise;
  const db = client.db("chatapp");

  const bodyObject = await req.json();
  const myPost = await db.collection("store").insertOne(bodyObject);
  return NextResponse.json({ status: 200, body: myPost });
}

const client = jwksClient({
  jwksUri: `https://ai.eunomatix.com:4116/auth/realms/RealmTest/protocol/openid-connect/certs`,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid as string, function (err, key) {
    if (err) {
      callback(err, undefined);
      return;
    }

    // Ensure key is not undefined and has getPublicKey method
    if (!key || typeof key.getPublicKey !== "function") {
      callback(new Error("Signing key not found or not valid"), undefined);
      return;
    }

    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

function verifyToken(
  token: string,
  getKey: (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => void,
): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {}, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

async function testHandler(req: NextRequest, res: NextResponse) {
  const authorization = req.headers.get("Authorization") ?? "";
  console.log(authorization);

  if (!authorization) {
    console.log("No authorization header");
    return NextResponse.json({ body: "Unauthorized" }, { status: 401 });
  }

  const token = authorization.split(" ")[1]; // Extract the token from 'Bearer'

  try {
    // Use the manually created verifyToken function
    const decoded = await verifyToken(token, getKey);
    console.log("Authorized");
    return NextResponse.json({ body: "OK" }, { status: 200 });
  } catch (error) {
    console.log("Unauthorized");
    return NextResponse.json({ body: "Unauthorized" }, { status: 401 });
  }
}

export const POST = handler;
