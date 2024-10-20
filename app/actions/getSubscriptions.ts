import createMongoClient from "../lib/db";

export default async function getSubscriptions(q: any) {
    const {
        user,
        plan
    } = q;

    const client = await createMongoClient();

    const agg = [];

    if (plan) {
        agg.push({
            "$match": {
                "planName": plan
            }
        });
    }
    
    agg.push({
        "$lookup": {
            "from": "users",
            "localField": "userId",
            "foreignField": "_id",
            "as": "user"
        }
    });

    agg.push({
        "$unwind": "$user"
    });

    if (user) {
        agg.push({
            "$match": {
                "$or": [
                    {
                        "user.email": new RegExp(user, "i"),
                    },
                    {
                        "user.name": new RegExp(user, "i"),
                    }
                ]
            }
        });
    }

    console.log(agg, "SUBS");

    const data = await client.db("v1").collection("subscriptions").aggregate(agg).toArray();

    return data;
}