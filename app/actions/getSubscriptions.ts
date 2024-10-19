import createMongoClient from "../lib/db";
import getUser from "./getUser";

export default async function getSubscriptions() {
    const client = await createMongoClient();
    
    const data = await client.db("v1").collection("subscriptions").find().toArray();
    
    const out = await Promise.all(data.map(async (record) => {
        const user = await getUser(record.userId);
        record.user = user;
        return record;
    }));

    return out;
}