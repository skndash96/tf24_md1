import createMongoClient from "../lib/db";
import getItem from "./getItem";
import getUser from "./getUser";

export default async function getSales() {
    const client = await createMongoClient();

    const data = await client.db("v1").collection("sales").find().toArray();

    const out = await Promise.all(
        data.map(async record => {
            const user = await getUser(record.userId);
            record.user = user;
            const item = await getItem(record.itemId);
            record.item = item;
            return record;
        })
    );

    return out;
}