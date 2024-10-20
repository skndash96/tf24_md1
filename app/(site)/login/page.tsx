"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import getAuth from "../../lib/auth";
import toast from "react-hot-toast";

export default function AuthForm() {
    const [isSignup, setIsSignup] = useState<boolean>(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        setLoading(true);

        try {
            let res;
            if (isSignup) {
                res = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name, email, password })
                });
            } else {
                res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });
            }

            if (res.status === 200) {
                //force reload to get the new cookie
                location.href = "/user";
            } else {
                const text = await res.text();
                throw text;
            }
        } catch (e) {
            toast.error(e as string);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const userId = getAuth();
        if (userId) router.push("/user");
        else setLoading(false);
    }, []);

    return (
        <form className="p-4 w-full max-w-lg mx-auto flex flex-col gap-2" onSubmit={handleSubmit}>
            <h1 className="text-xl text-center font-bold">
                {isSignup ? "Sign Up" : "Login"}
            </h1>

            {isSignup && (
                <div>
                    <label htmlFor="name">Name:</label>
                    <Input
                        type="name"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
            )}
            <div>
                <label htmlFor="email">Email:</label>
                <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <Button className="mt-4" disabled={loading} type="submit">
                {isSignup ? "Sign up" : "Login"}
            </Button>

            <Button onClick={() => setIsSignup(b => !b)} type="button" variant="ghost">
                { isSignup ? "Already signed up?" : "Create an account?"}
            </Button>
        </form>
    );
}