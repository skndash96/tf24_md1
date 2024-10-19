import getItem from "@/app/actions/getItem";
import getSales from "@/app/actions/getSales";
import getUser from "@/app/actions/getUser";
import createMongoClient from "@/app/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const cookieStore = cookies();

    if (cookieStore.get("userId")?.value !== "671382fb8b8c6c4776a7c998") {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    
    try {
        const data = await getSales();
        return NextResponse.json(data, { status: 200 });
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}