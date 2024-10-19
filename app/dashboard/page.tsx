"use client";

import { useEffect, useState } from "react";
import { socket } from "../socket";
import getAuth from "../lib/auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "../../components/dataTable";
import { Checkbox } from "@/components/ui/checkbox";

type SaleRecord = {
    id: string,
    cost: string,
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
        accessorKey: "item",
        header: "Item"
    },
    {
        accessorKey: "user",
        header: "User"
    },
    {
        accessorKey: "cost",
        header: "Cost"
    },
    {
        accessorKey: "createdAt",
        header: "date"
    }
];

const subscriptionColumns: ColumnDef<SubscriptionRecord>[] = [
    // {
    //     accessorKey: "id",
    //     header: "id"
    // },
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
    }
];

export default function Home() {
    const router = useRouter();
    const [salesError, setSalesError] = useState<boolean>(false);
    const [subscribersError, setSubscribersError] = useState<boolean>(false);
    const [sales, setSales] = useState<any[]>([]);
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [totals, setTotals] = useState<any>({});

    useEffect(() => {
        const _userId = getAuth();
        if (!_userId) {
            router.push("/login");
            return;
        }

        if (_userId !== "671382fb8b8c6c4776a7c998") {
            router.push("/user");
            return;
        }

        fetch("/api/sales")
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setSales(data)
            })
            .catch(error => {
                console.error(error);
                setSalesError(true);
            });

        fetch("/api/subscriptions")
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setSubscribers(data)
            })
            .catch(error => {
                console.error(error);
                setSubscribersError(true);
            });

        const updateSalesHandler = (data: any) => {
            console.log("updated sales", data);

            setSales((prevData) => {
                let idx = prevData.findIndex((record) => record._id === data._id);
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
                let idx = prevData.findIndex((record) => record._id === data._id);
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
        <main>
            <section className="p-4 max-w-md sm:max-w-2xl mx-auto grid sm:grid-cols-3 gap-2">
                <Card>
                    <CardHeader>
                        <h1 className="text-xl font-bold">
                            ${totals.totalSale?.toFixed?.(2) || totals.totalSale}
                        </h1>
                    </CardHeader>
                    <CardContent>Sales</CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <h1 className="text-xl font-bold">
                            {totals.totalSubscribers}
                        </h1>
                    </CardHeader>
                    <CardContent>Subscribers</CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <h1 className="text-xl font-bold">
                            ${totals.totalSubscriberCost}
                        </h1>
                    </CardHeader>
                    <CardContent>Subscriptions </CardContent>
                </Card>
            </section>

            <div className="mt-8 max-w-7xl mx-auto grid md:grid-cols-2">
                <section className="p-2">
                    <h2 className="mb-2 text-xl font-bold">Recent Sales</h2>
                    {salesError && <p>Error fetching sales data</p>}

                    <DataTable data={sales.map(sale => ({
                        item: sale.item.name,
                        user: sale.user.name,
                        cost: "$" + sale.price,
                        id: sale._id,
                        createdAt: new Date(sale.createdAt || null).toLocaleString()
                    })).reverse()} columns={saleColumns} />

                    {/* <ul>
                    {sales.map((sale) => (
                        <li key={sale._id}>
                            {sale.user.name} | ${sale.item.name} | ${sale.price}
                        </li>
                    ))}
                </ul> */}
                </section>

                <section className="p-2">
                    <h2 className="mb-2 text-xl font-bold">Recent Subscribers</h2>
                    {subscribersError && <p>Error fetching subscribers data</p>}
                    <DataTable data={subscribers.map(subscriber => ({
                        user: subscriber.user.email,
                        planName: subscriber.planName,
                        cost: "$" + (subscriber.cost.$numberDecimal || subscriber.cost),
                        id: subscriber._id
                    })).reverse()} columns={subscriptionColumns} />
                    {/* <ul>
                    {subscribers.map((subscriber) => (
                        <li key={subscriber._id}>
                            {subscriber.user.email} | {subscriber.planName} | ${subscriber.cost.$numberDecimal || subscriber.cost}
                        </li>
                    ))}
                </ul> */}
                </section>
            </div>
        </main>
    );
}
