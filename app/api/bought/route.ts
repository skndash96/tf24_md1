import getItem from "@/app/actions/getItem";
import getSales from "@/app/actions/getSales";
import getUser from "@/app/actions/getUser";
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

        const data = await client.db("v1").collection("sales").find({
            userId: {
                $eq: userId
            }
        }).toArray();

        const out = await Promise.all(data.map(async sale => {
            const item = await getItem(sale.itemId);
            
            sale.item = item;

            return sale;
        }));

        return NextResponse.json(out, { status: 200 });
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}