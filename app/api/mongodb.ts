import { MongoClient, MongoClientOptions } from "mongodb";
import { getServerSideConfig } from "../config/server";

const serverConfig = getServerSideConfig();
// Define a type for the global variable to hold the MongoDB client promise
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = serverConfig.MongoUri;

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

function initializeClient() {
  client = new MongoClient(uri!);
  return client.connect();
}

if (process.env.NODE_ENV === "development") {
  // Check if there's already a promise in global scope
  // If not, create a new one
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = initializeClient();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, always create a new MongoDB client
  clientPromise = initializeClient();
}

export default clientPromise;
