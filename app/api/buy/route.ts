import getItem from "@/app/actions/getItem";
import createMongoClient from "@/app/lib/db";
import { Double, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const client = await createMongoClient();
        const { userId, itemId, quantity }: any = await request.json();

        if (!userId || !itemId) return new NextResponse("Missing required fields", { status: 400 });
        if (typeof quantity === "number" && quantity < 1) {
            return new NextResponse("Quantity must be greater than 0", { status: 400 });
        }

        const item = await getItem(itemId);
        if (!item) return new NextResponse("Item not found", { status: 404 });
        if (item.stock < quantity) return new NextResponse("Out of stock", { status: 400 });

        await client.db("v1").collection("items").updateOne({
            _id: new ObjectId(itemId)
        }, {
            $inc: { stock: -quantity || -1 }
        }, {
            upsert: false
        });

        await client.db("v1").collection("sales").insertOne({
            itemId: new ObjectId(itemId),
            userId: new ObjectId(userId),
            price: new Double(item.price*quantity),
            quantity: quantity || 1,
            createdAt: new Date()
        });

        return new NextResponse("Success", { status: 200 });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}