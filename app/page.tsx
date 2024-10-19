"use client";

import { useEffect, useState } from "react";
import { socket } from "./socket";
import getAuth from "./lib/auth";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    const [userId, setUserId] = useState<string>("");
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
        setUserId(_userId)
        ;
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
            <h1>Dashboard</h1>
            <br/>
            <section>
                <h2>Totals</h2>
                <p>Total Sales: ${totals.totalSale}</p>
                <p>Total Subscribers: {totals.totalSubscribers}</p>
                <p>Total Subscriber Cost: ${totals.totalSubscriberCost}</p>
            </section>
            <br/>

            <section>
                <h2>Sales</h2>
                {salesError && <p>Error fetching sales data</p>}
                <ul>
                    {sales.map((sale) => (
                        <li key={sale._id}>
                            {sale.user.name} | ${sale.item.name} | ${sale.price}
                        </li>
                    ))}
                </ul>
            </section>
            <br/>
            <section>
                <h2>Subscribers</h2>
                {subscribersError && <p>Error fetching subscribers data</p>}
                <ul>
                    {subscribers.map((subscriber) => (
                        <li key={subscriber._id}>
                            {subscriber.user.email} | {subscriber.planName} | ${subscriber.cost.$numberDecimal || subscriber.cost}
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
