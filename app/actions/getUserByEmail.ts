import { ObjectId } from "mongodb";
import createMongoClient from "../lib/db";

export default async function getUserByEmail(userEmail: string) {
    const client = await createMongoClient();

    const user = await client.db("v1").collection("users").findOne({
        "email": userEmail
    });

    return user;
}