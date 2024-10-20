import getUser from "@/app/actions/getUser";
import createMongoClient from "@/app/lib/db";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const cookieStore = cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) return new NextResponse("Invalid request", { status: 400 });

        const client = await createMongoClient();
        
        const user = await getUser(userId);
        if (!user) return new NextResponse("User not found", { status: 404 });

        const sub = await client.db('v1').collection("subscriptions").findOne({
            "userId": new ObjectId(userId)
        });

        return NextResponse.json({
            ...user,
            planName: sub?.planName   
        }, { status: 200});
    } catch(e) {
        console.error(e);

        return new NextResponse("Internal Server Error", { status: 500 });
    }
}