"use client";
import { useEffect, useState } from "react";
import getAuth from "../lib/auth";
import Link from "next/link";

export default function Header() {
    const [user, setUser] = useState<any>();

    useEffect(() => {
        const userId = getAuth();

        if (!userId) {
            setUser(null);
            return;
        }

        fetch(`/api/users`)
            .then(res => res.json())
            .then(user => setUser(user))
            .catch(e => {
                console.error(e);
                setUser(null);
            });
    }, []);

    return (
        <header className="px-2 py-1 flex justify-between">
            <h1 className="font-bold">
                MD1
            </h1>

            <nav className="flex gap-4">
                {user ? (
                    <>
                        {user._id === "6713bc17819052ea5df52440" && (
                            <Link className="font-semibold hover:underline" href="/dashboard">
                                Dashboard
                            </Link>
                        )}
                        
                        <Link className="font-semibold hover:underline" href="/user">
                            Account ({user.name})
                        </Link>

                    </>
                ) : (
                    <Link className="font-semibold" href="/login">
                        Login
                    </Link>
                )}
            </nav>
        </header>
    );
}