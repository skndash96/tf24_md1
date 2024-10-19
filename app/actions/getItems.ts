import createMongoClient from "../lib/db";

export default async function getItems() {
    const client = await createMongoClient();

    const items = await client.db("v1").collection("items").find().toArray();

    return items;
}