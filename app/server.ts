import { createServer } from "node:http";
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

let totalSale = 0;
let totalSubscribers = 0;
let totalSubscriberCost = 0;

async function prepareTotals() {
    const sales = await getSales({});
    sales.forEach(sale => totalSale += sale.price);

    const subscriptions = await getSubscriptions({});
    subscriptions.forEach(subscription => {
        totalSubscribers++;
        totalSubscriberCost += new Number(subscription.cost).valueOf();
    });
}

app.prepare().then(async () => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    let client;
    try {
        client = await createMongoClient();
    } catch (e) {
        console.error(e, "CANT_CONNECT");
        return;
    }

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
        
        //@ts-expect-error
        const user = await getUser(data.fullDocument.userId);
        //@ts-expect-error
        const item = await getItem(data.fullDocument.itemId);
        
        io.emit("update_sale", {
            //@ts-expect-error
            ...data.fullDocument, user: [user], item: [item]
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
        
        //@ts-expect-error
        const user = await getUser(data.fullDocument.userId);

        io.emit("update_subscription", {
            //@ts-expect-error
            ...data.fullDocument, user: [user]
        });

        //@ts-expect-error
        const toCost = typeof data.fullDocument.cost === "number" ? data.fullDocument.cost : new Number(data.fullDocument.cost).valueOf();
        //@ts-expect-error
        const fromCost = typeof data.fullDocumentBeforeChange?.cost === "number" ? data.fullDocumentBeforeChange.cost : data.fullDocumentBeforeChange?.cost;
        
        if (data.operationType === "insert") {
            totalSubscribers++;
            totalSubscriberCost += toCost;
        } else if (data.operationType === "delete") {
            totalSubscribers--;
            totalSubscriberCost -= fromCost;
        } else if (data.operationType === "update") {
            totalSubscriberCost += toCost - fromCost;
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