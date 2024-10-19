import { ObjectId } from "mongodb";
import createMongoClient from "../lib/db";

export default async function getItem(itemId: string) {
    const client = await createMongoClient();

    const item = await client.db("v1").collection("items").findOne({
        "_id": new ObjectId(itemId)
    });

    return item;
}