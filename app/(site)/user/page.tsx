"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import getAuth from "../../lib/auth";
import { useRouter } from "next/navigation";
import DataTable from "@/components/dataTable";
import { ColumnDef } from "@tanstack/react-table";
import { socket } from "../../socket";
import toast from "react-hot-toast";
import { error } from "console";

type SaleRecord = {
    name: string;
    quantity: number;
    price: string;
    date: string;
};

const columns: ColumnDef<SaleRecord>[] = [
    {
        accessorKey: "name",
        header: "Name"
    },
    {
        accessorKey: "quantity",
        header: "Quantity"
    },
    {
        accessorKey: "price",
        header: "Price"
    },
    {
        accessorKey: "date",
        header: "Date"
    }
];

export default function UserPanel() {
    const router = useRouter();
    const [userId, setUserId] = useState<string>("");
    const [itemId, setItemId] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(0);
    const [items, setItems] = useState<any[]>([]);
    const [plan, setPlan] = useState<string>();
    const [itemsError, setItemsError] = useState<boolean>(false);
    const [salesError, setSalesError] = useState<boolean>(false);
    const [sales, setSales] = useState<any[]>([]);
    const [currentPlan, setCurrentPlan] = useState<string>();

    const handlePurchase = async () => {
        const res = await fetch("/api/buy", {
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

        if (res.status !== 200) {
            const text = await res.text();
            toast.error(text);
            return;
        } else {
            toast.success("Purchase successful");
        }
    };

    const handleSubs = async () => {
        const res = await fetch("/api/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId,
                planName: plan
            })
        });

        if (res.status !== 200) {
            const text = await res.text();
            toast.error(text);
            return;
        } else {
            toast.success("Subscription successful");
        }
    };

    useEffect(() => {
        const userId = getAuth();
        if (!userId) router.push("/login");
        else setUserId(userId);

        fetch("/api/users")
            .then(res => res.json())
            .then(u => setCurrentPlan(u.planName))
            .catch(console.error);

        fetch("/api/items")
            .then(res => res.json())
            .then(items => setItems(items))
            .catch(error => {
                console.error(error);
                setItemsError(true);
            });

        fetch("/api/bought")
            .then(res => res.json())
            .then(sales => setSales(sales))
            .catch(error => {
                console.error(error);
                setSalesError(true);
            });

        const newSaleHandler = (data: any) => {
            setSales(sales => {
                const idx = sales.findIndex(s => s._id === data._id);

                if (idx === -1) return [...sales, data];
                else {
                    sales.splice(idx, 1, data);
                    return [...sales];
                }
            });
        };

        socket.on("update_sale", newSaleHandler);

        return () => {
            socket.off("update_sale", newSaleHandler);
        };
    }, []);

    const handleSignout = () => {
        document.cookie = document.cookie.split(";").map(x => {
            const [k, v] = x.split("=");
            if (k === "userId") return k + "=";
            else return [k, v].join("=");
        }).join(";");

        //force reload to update the cookie
        location.href = "/login";
    };

    return (
        <div className="p-4 w-full mx-auto max-w-4xl flex flex-col gap-4">
            <div className="flex flex-wrap gap-8">
                <div className="w-fit flex flex-col gap-2">
                    <h1 className="text-lg font-semibold">Buy Items</h1>

                    <Select defaultValue="" onValueChange={v => setItemId(v)}>
                        <div>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Select an item" />
                            </SelectTrigger>
                        </div>
                        
                        <SelectContent>
                            {items.map(item => (
                                <SelectItem key={item._id} value={item._id}>
                                    {item.name} (${item.price})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {itemsError && (
                        <p>Failed to load items</p>
                    )}

                    <Input placeholder="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} />

                    <Button variant="secondary" onClick={handlePurchase}>
                        Purchase
                        {quantity > 0 && ` ($${(items.find(i => i._id === itemId)?.price*quantity).toFixed(2)})`}
                    </Button>
                </div>

                <div className="w-fit flex flex-col gap-2">
                    <h1 className="text-lg font-semibold"> Subscription: </h1>

                    <Select defaultValue={""} onValueChange={(v: any) => setPlan(v)}>
                        <div>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                        </div>
                        <SelectContent>
                            {["member", "premium", "vip"].map(p => (
                                <SelectItem key={p} disabled={p === currentPlan} value={p}>
                                    {p[0].toUpperCase()}
                                    {p.substring(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="secondary" onClick={handleSubs}>
                        Subscribe
                        {plan && ` ($${plan === "vip" ? 30 : plan === "premium" ? 20 : 10})`}
                    </Button>
                </div>
            </div>

            <section className="mt-8">
                <h2 className="text-lg font-semibold">
                    Recent Sales:
                </h2>

                {salesError && (
                    <p>
                        Failed to load sales
                    </p>
                )}

                <div className="w-full mx-auto">
                    <DataTable columns={columns} data={sales.map(sale => ({
                        name: sale.item.name,
                        quantity: sale.quantity,
                        price: "$" + sale.item.price * sale.quantity,
                        date: new Date(sale.createdAt).toLocaleString()
                    }))} />
                </div>

                <div className="mt-2 w-fit ml-auto">
                    <Button onClick={handleSignout} variant="destructive">
                        Signout
                    </Button>
                </div>
            </section>
        </div>
    );
}