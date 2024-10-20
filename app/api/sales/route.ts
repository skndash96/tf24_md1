import getSales from "@/app/actions/getSales";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const q = Object.fromEntries(
        new URLSearchParams(request.url.split("?")[1] || "").entries()
    );

    const cookieStore = cookies();

    if (cookieStore.get("userId")?.value !== "6713bc17819052ea5df52440") {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    
    try {
        const data = await getSales(q);
        return NextResponse.json(data, { status: 200 });
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}