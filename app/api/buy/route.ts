import getItem from "@/app/actions/getItem";
import createMongoClient from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const client = await createMongoClient();
        const { userId, itemId, quantity }: any = await request.json();

        if (!userId || !itemId) return new NextResponse("Missing required fields", { status: 400 });

        const item = await getItem(itemId);
        if (!item) return new NextResponse("Item not found", { status: 404 });
        
        await client.db("v1").collection("sales").insertOne({
            itemId: itemId,
            userId: userId,
            price: item.price*quantity,
            quantity: quantity || 1,
        });

        return new NextResponse("Success", { status: 200 });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}