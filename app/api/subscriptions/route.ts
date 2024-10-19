import getSubscriptions from "@/app/actions/getSubscriptions";
import getUser from "@/app/actions/getUser";
import createMongoClient from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const data = await getSubscriptions();
        
        return NextResponse.json(data, { status: 200 });
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}