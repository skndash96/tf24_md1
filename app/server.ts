import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import createMongoClient from "./lib/db";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// const io = null;
let onlineUsers = [];

app.prepare().then(async () => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    const client = await createMongoClient();

    const changeStream = client.db("test").collection("test").watch([], {
        fullDocument: "updateLookup"
    });

    changeStream.on("change", data => {
        //@ts-ignore
        io.emit("update_data", data.fullDocument);
    });

    io.on("connection", (socket) => {
        console.log(socket.id, "connected");
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