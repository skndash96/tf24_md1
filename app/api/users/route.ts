import getUser from "@/app/actions/getUser";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const userId = req.url.split("?").pop()?.split("&").find((s:any) => s.startsWith("userId"))?.split("=").pop();

        if (!userId) return new NextResponse("Invalid request", { status: 400 });

        const user = await getUser(typeof userId === "object" ? userId[0] : userId);
        
        if (user) return NextResponse.json({
            _id: user._id.toString(),
            name: user.name,
            email: user.email
        }, { status: 200});

        return new NextResponse("User not found", { status: 400 });
    } catch(e) {
        console.error(e);

        return new NextResponse("Internal Server Error", { status: 500 });
    }
}