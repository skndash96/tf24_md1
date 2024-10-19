import getUser from "@/app/actions/getUser";
import createMongoClient from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const client = await createMongoClient();
        const { userId, planName }: any = await request.json();
    
        if (!userId || !planName) return new NextResponse("Missing required fields", { status: 400 });
    
        const user = await getUser(userId);

        //TODO: Check if user is already subscribed to the plan and throw error

        if (!user) return new NextResponse("User doesn't exist", { status: 404 });
    
        if (!["member", "premium", "vip"].includes(planName)) return new NextResponse("Invalid plan name", { status: 400 });

        const cost = planName === "member" ? 10 : planName === "premium" ? 20 : 30;

        await client.db("v1").collection("subscriptions").insertOne({
            userId: userId,
            cost: cost,
            planName: planName
        });
    
        return new NextResponse("Subscribed successfully", { status: 200 });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal server error", { status: 500 });
    }
} 