import createMongoClient from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const client = await createMongoClient();
    
        const data = await client.db("test").collection("test").find({}).toArray();

        return NextResponse.json(data, { status: 200 });
    } catch (e) {
        console.error(e);
        return new Response("Internal Error", { status: 500 });
    }
}