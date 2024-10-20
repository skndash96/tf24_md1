import createMongoClient from "../lib/db";

export default async function getSales(q: any) {
    const {
        cost,
        costCmp,
        user,
        item,
        start,
        end
    } = q;
    
    const client = await createMongoClient();

    const agg = [];

    const costF = parseFloat(cost);

    if (costF) {
        agg.push({
            "$match": {
                "price": costCmp === "lt" ? {
                    "$lt": costF
                } : {
                    "$gt": costF
                }
            }
        });
    }
    
    if (start) {
        agg.push({
            "$match": {
                "createdAt": {
                    "$gte": new Date(start)
                }
            }
        });
    }

    if (end) {
        agg.push({
            "$match": {
                "createdAt": {
                    "$lte": new Date(end)
                }
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
    }, {
        "$unwind": {
            "path": "$user"
        }
    });

    if (user) {
        agg.push({
            "$match": {
                "$or": [
                    {
                        "user.email": new RegExp(user, "i")
                    },
                    {
                        "user.name": new RegExp(user, "i")
                    }
                ]
            }
        });
    }

    agg.push({
        "$lookup": {
            "from": "items",
            "localField": "itemId",
            "foreignField": "_id",
            "as": "item"
        }
    }, {
        "$unwind": {
            "path": "$item"
        }
    });

    if (item) {
        agg.push({
            "$match": {
                "item.name": new RegExp(item, "i")
            }
        });
    }
    
    console.dir(agg, {
        depth: Infinity
    });

    const data = await client.db("v1").collection("sales").aggregate(agg).toArray();
    
    return data;
}