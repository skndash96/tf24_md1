import { MongoClient } from "mongodb";

import dotenv from "dotenv";
dotenv.config({
    path: ".env"
});

// Connection URL
const url = process.env.MONGODB_URI!;

let client : MongoClient | undefined = undefined;

export default async function createMongoClient() {
    if (client) return client;
    
    client = new MongoClient(url);

    // Use connect method to connect to the server
    await client.connect();

    console.log('Connected successfully to server');
    
    return client;
}