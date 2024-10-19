import getUserByEmail from "@/app/actions/getUserByEmail";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import createMongoClient from "@/app/lib/db";

export async function POST(request: Request) {
    try {

        const { name, email, password } = await request.json();
    
        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
    
        const client = await createMongoClient();
        const cookieStore = cookies();
    
        const user = await getUserByEmail(email);
        if (user) {
            return new NextResponse("User already found", { status: 400 });
        }
    
        const hash = await bcrypt.hash(password, 10);
    
        const { insertedId } = await client.db("v1").collection("users").insertOne({
            name,
            email,
            password: hash,
            createdAt: new Date()
        });
    
        cookieStore.set("userId", insertedId.toString());
    
        return new NextResponse("Success", { status: 200 });
    } catch (e) {
        console.error(e);

        return new NextResponse("Internal Server Error", { status: 500 });
    }
}