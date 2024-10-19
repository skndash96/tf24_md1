import { createServer, get } from "node:http";
import next from "next";
import { Server } from "socket.io";
import createMongoClient from "./lib/db";
import getSales from "./actions/getSales";
import getSubscriptions from "./actions/getSubscriptions";
import getUser from "./actions/getUser";
import getItem from "./actions/getItem";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// const io = null;
let onlineUsers = [];
let totalSale = 0;
let totalSubscribers = 0;
let totalSubscriberCost = 0;

async function prepareTotals() {
    const sales = await getSales();
    sales.forEach(sale => totalSale += sale.price);

    const subscriptions = await getSubscriptions();
    subscriptions.forEach(subscription => {
        totalSubscribers++;
        totalSubscriberCost = totalSubscriberCost + new Number(subscription.cost).valueOf();
    });
}

app.prepare().then(async () => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    const client = await createMongoClient();

    await prepareTotals();

    const salesStream = client.db("v1").collection("sales").watch([], {
        fullDocument: "updateLookup",
        fullDocumentBeforeChange: "whenAvailable"
    });
    const subscriptionsStream = client.db("v1").collection("subscriptions").watch([], {
        fullDocument: "updateLookup",
        fullDocumentBeforeChange: "whenAvailable"
    });

    salesStream.on("change", async data => {
        console.log("sale", data);
        
        //@ts-ignore
        const user = await getUser(data.fullDocument.userId);
        //@ts-ignore
        const item = await getItem(data.fullDocument.itemId);
        
        io.emit("update_sale", {
            //@ts-ignore
            ...data.fullDocument, user, item 
        });

        if (data.operationType === "insert") {
            totalSale += data.fullDocument.price;
        } else if (data.operationType === "delete") {
            totalSale -= data.fullDocumentBeforeChange?.price;
        } else if (data.operationType === "update") {
            totalSale += data.fullDocument?.price - data.fullDocumentBeforeChange?.price;
        }
        
        io.emit("update_totals", {
            totalSubscribers,
            totalSubscriberCost,
            totalSale
        });
    });

    subscriptionsStream.on("change", async data => {
        console.log("subs", data);
        
        //@ts-ignore
        const user = await getUser(data.fullDocument.userId);

        io.emit("update_subscription", {
            //@ts-ignore
            ...data.fullDocument, user
        });

        if (data.operationType === "insert") {
            totalSubscribers++;
            totalSubscriberCost += data.fullDocument.price;
        } else if (data.operationType === "delete") {
            totalSubscribers--;
            totalSubscriberCost -= data.fullDocumentBeforeChange?.price;
        }

        io.emit("update_totals", {
            totalSubscribers,
            totalSubscriberCost,
            totalSale
        });
    });

    io.on("connection", (socket) => {
        console.log(socket.id, "connected");
        
        socket.on("get_totals", () => {
            io.emit("update_totals", {
                totalSubscribers,
                totalSubscriberCost,
                totalSale
            });
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});