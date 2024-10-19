import { ObjectId } from "mongodb";
import createMongoClient from "../lib/db";

export default async function getUser(userId: string) {
    const client = await createMongoClient();

    const user = await client.db("v1").collection("users").findOne({
        "_id": new ObjectId(userId)
    });

    return user;
}