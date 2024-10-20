import createMongoClient from "@/app/lib/db";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const cookieStore = cookies();

    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const client = await createMongoClient();

        const data = await client.db("v1").collection("sales").aggregate([
            {
                "$match": {
                    userId: new ObjectId(userId)
                }
            },
            {
                "$lookup": {
                    from: "items",
                    localField: "itemId",
                    foreignField: "_id",
                    as: "item"
                }
            },
            {
                "$unwind": {
                    path: "$item"
                }
            }
        ]).toArray();

        return NextResponse.json(data, { status: 200 });
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}