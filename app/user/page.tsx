"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import getAuth from "../lib/auth";
import { useRouter } from "next/navigation";

export default function UserPanel() {
    const router = useRouter();
    const [userId, setUserId] = useState<string>("");
    const [itemId, setItemId] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(0);
    const [plan, setPlan] = useState<string>();

    const handlePurchase = async () => {
        await fetch("/api/buy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId,
                itemId,
                quantity
            })
        });
    };
    const handleSubs = async () => {
        await fetch("/api/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId,
                planName: plan
            })
        });
    };

    useEffect(() => {
        const userId = getAuth();
        if (!userId) router.push("/login");
        else setUserId(userId);
    }, []);

    const handleSignout = () => {
        document.cookie = document.cookie.split(";").map(x => {
            const [k,v] = x.split("=");
            if (k === "userId") return k+"=";
            else return [k,v].join("=");
        }).join(";");

        router.push("/login");
    };

    return (
        <div className="w-fit mx-auto flex flex-col gap-2">
            <Input placeholder="itemid" className="bg-black/10" type="text" value={itemId} onChange={(e) => setItemId(e.target.value)} />

            <Input placeholder="quantity" className="bg-black/10" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} />

            <div>
                <Select defaultValue={""} onValueChange={(v: any) => setPlan(v)}>
                    <div>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                    </div>
                    <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="mt-4 flex gap-2">
                <Button onClick={handlePurchase}>
                    Purchase
                </Button>

                <Button onClick={handleSubs}>
                    Subscribe
                </Button>
            </div>

            <div>
                <Button onClick={handleSignout} variant="destructive">
                    Signout
                </Button>
            </div>
        </div>
    );
}