import getItems from "@/app/actions/getItems";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = cookies();

    if (!cookieStore.get("userId")?.value) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    
    try {
        const data = await getItems();
        return NextResponse.json(data, { status: 200 });
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}