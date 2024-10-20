import getUserByEmail from "@/app/actions/getUserByEmail";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import createMongoClient from "@/app/lib/db";

export async function POST(request: Request) {
    const { email, password } = await request.json();

    if (!email || !password) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cookieStore = cookies();

    const user = await getUserByEmail(email);
    if (!user) {
        return new NextResponse("No user found", { status: 400 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
        return new NextResponse("Invalid credentials", { status: 400 });
    }

    cookieStore.set("userId", user._id.toString());

    return new NextResponse("Success", { status: 200 });
}