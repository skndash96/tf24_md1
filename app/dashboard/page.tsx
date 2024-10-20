"use client";

import { useEffect, useState } from "react";
import { socket } from "../socket";
import getAuth from "../lib/auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "../../components/dataTable";
import SaleFilter from "./components/salesFilter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SubscriptionsFilter from "./components/subscriptionsFilter";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type SaleRecord = {
    id: string,
    price: string,
    quantity: number,
    totalPrice: string,
    item: string,
    user: string
}

type SubscriptionRecord = {
    id: string,
    user: string,
    planName: string,
    cost: string
};

const saleColumns: ColumnDef<SaleRecord>[] = [
    {
        accessorKey: "user",
        header: "User"
    },
    {
        accessorKey: "email",
        header: "Email"
    },
    {
        accessorKey: "item",
        header: "Item"
    },
    {
        accessorKey: "price",
        header: "Price"
    },
    {
        accessorKey: "quantity",
        header: "Quantity"
    },
    {
        accessorKey: "totalPrice",
        header: "Total"
    },
    {
        accessorKey: "createdAt",
        header: "Date"
    }
];

const subscriptionColumns: ColumnDef<SubscriptionRecord>[] = [
    {
        accessorKey: "user",
        header: "User"
    },
    {
        accessorKey: "planName",
        header: "Plan Name"
    },
    {
        accessorKey: "cost",
        header: "Cost"
    },
    {
        accessorKey: "createdAt",
        header: "Date"
    }
];

export default function Home() {
    const router = useRouter();
    const [salesError, setSalesError] = useState<boolean>(false);
    const [subscribersError, setSubscribersError] = useState<boolean>(false);
    const [sales, setSales] = useState<any[]>([]);
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [totals, setTotals] = useState<any>({});
    const [table, setTable] = useState<string>("Sales");

    useEffect(() => {
        const _userId = getAuth();
        if (!_userId) {
            router.push("/login");
            return;
        }

        if (_userId !== "6713bc17819052ea5df52440") {
            router.push("/user");
            return;
        }

        const updateSalesHandler = (data: any) => {
            console.log("updated sales", data);

            setSales((prevData) => {
                const idx = prevData.findIndex((record) => record._id === data._id);
                if (idx === -1) {
                    return [...prevData, data];
                } else {
                    prevData.splice(idx, 1, data);
                    return [...prevData];
                }
            });
        };

        const updateSubscriptionsHandler = (data: any) => {
            console.log("updated subscriptions", data);

            setSubscribers((prevData) => {
                const idx = prevData.findIndex((record) => record._id === data._id);
                if (idx === -1) {
                    return [...prevData, data];
                } else {
                    prevData.splice(idx, 1, data);
                    return [...prevData];
                }
            });
        };

        const updateTotalsHandler = (data: any) => {
            console.log("updated totals", data);

            setTotals(data);
        };

        socket.emit("get_totals");

        socket.on("update_sale", updateSalesHandler);
        socket.on("update_subscription", updateSubscriptionsHandler);
        socket.on("update_totals", updateTotalsHandler);

        return () => {
            socket.off("update_sale", updateSalesHandler);
            socket.off("update_subscription", updateSubscriptionsHandler);
            socket.off("update_totals", updateTotalsHandler);
        };
    }, []);

    return (
        <div className="h-screen w-full flex md:flex-row">
            <aside className="hidden md:block min-w-52 sm:block bg-neutral-800 text-white">
                <h1 className="p-2 text-lg font-bold mb-2">Dashboard</h1>
                <ul className="flex flex-col">
                    <Button onClick={() => setTable("Sales")} className="hover:bg-neutral-700 hover:text-white" variant="ghost"> Sales </Button>
                    <Button onClick={() => setTable("Subscriptions")} className="hover:bg-neutral-700 hover:text-white" variant="ghost"> Subscriptions </Button>
                </ul>
            </aside>

            <main className="px-4 grow overflow-auto">
                <div className="py-1 flex items-center justify-between">
                    <h1 className="font-bold">MD1</h1>

                    <ul>
                        <li>
                            <Link className="font-semibold hover:underline" href="/user">
                                Account (admin)
                            </Link>
                        </li>
                    </ul>
                </div>
                <section className="p-4 w-fit mx-auto flex flex-wrap gap-2">
                    <Card className="max-w-[200px]">
                        <CardHeader>
                            <h1 className="text-xl font-bold">
                                ${totals.totalSale?.toFixed?.(2) || totals.totalSale}
                            </h1>
                        </CardHeader>
                        <CardContent>Sales</CardContent>
                    </Card>
                    <Card className="max-w-[200px]">
                        <CardHeader>
                            <h1 className="text-xl font-bold">
                                {totals.totalSubscribers}
                            </h1>
                        </CardHeader>
                        <CardContent>Subscribers</CardContent>
                    </Card>
                    <Card className="max-w-[200px]">
                        <CardHeader>
                            <h1 className="text-xl font-bold">
                                ${totals.totalSubscriberCost}
                            </h1>
                        </CardHeader>
                        <CardContent>Subscriptions </CardContent>
                    </Card>
                </section>

                <section className="p-4 mt-8 max-w-7xl mx-auto">
                    <div className="flex gap-4 items-center">
                        <div className="block md:hidden">
                            <Select value={table} defaultValue="Sales" onValueChange={v => setTable(v)}>
                                <SelectTrigger className="w-fit text-base">
                                    <SelectValue placeholder="Select Table" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sales">Sales</SelectItem>
                                    <SelectItem value="Subscriptions">Subscriptions</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {table === "Sales" ? (
                            <SaleFilter
                                error={salesError}
                                setError={setSalesError}
                                data={sales}
                                setData={setSales}
                            />
                        ) : (
                            <SubscriptionsFilter
                                error={subscribersError}
                                setError={setSubscribersError}
                                data={subscribers}
                                setData={setSubscribers}
                            />
                        )}
                    </div>

                    {
                        table === "Sales" && (
                            <section className="mt-2">
                                {salesError && <p>Error fetching sales data</p>}
                                <DataTable data={sales.map(sale => ({
                                    user: sale.user.name,
                                    email: sale.user.email,
                                    item: sale.item.name,
                                    price: "$" + sale.item.price,
                                    quantity: sale.quantity,
                                    totalPrice: "$" + sale.quantity * sale.item.price,
                                    id: sale._id,
                                    createdAt: new Date(sale.createdAt || null).toLocaleString()
                                })).reverse()} columns={saleColumns} />
                            </section>
                        )
                    }

                    {
                        table === "Subscriptions" && (
                            <section className="mt-2">
                                {/* <h2 className="mb-2 text-xl font-bold">Recent Subscribers</h2> */}
                                {subscribersError && <p>Error fetching subscribers data</p>}
                                <DataTable data={subscribers.map(subscriber => ({
                                    user: subscriber.user.email,
                                    planName: subscriber.planName,
                                    cost: "$" + (subscriber.cost.$numberDecimal || subscriber.cost),
                                    id: subscriber._id,
                                    createdAt: new Date(subscriber.createdAt || null).toLocaleString()
                                })).reverse()} columns={subscriptionColumns} />
                            </section>
                        )
                    }
                </section>
            </main>
        </div>
    );
}
