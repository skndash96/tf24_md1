"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import getAuth from "../lib/auth";
import { useRouter } from "next/navigation";
import DataTable from "@/components/dataTable";
import { ColumnDef } from "@tanstack/react-table";
import { socket } from "../socket";
import toast from "react-hot-toast";

type SaleRecord = {
    name: String;
    quantity: Number;
    price: Number;
    date: String;
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
        }
    };

    useEffect(() => {
        const userId = getAuth();
        if (!userId) router.push("/login");
        else setUserId(userId);

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
                let idx = sales.findIndex(s => s._id === data._id);

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
                                {item.name}
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
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="secondary" onClick={handleSubs}>
                    Subscribe
                </Button>
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
                        price: sale.item.price,
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