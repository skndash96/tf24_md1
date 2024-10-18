"use client";

import { useEffect, useState } from "react";
import { socket } from "./socket";

export default function Home() {
    const [data, setData] = useState<any[]>([]);
    const [error, setError] = useState<boolean>(false);
    
    useEffect(() => {
        fetch("/api/test")
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setData(data)
            })
            .catch(error => {
                console.error(error);
                setError(true);
            });
        
        const updateDataHandler = (data: any) => {
            console.log("updated", data);

            setData((prevData) => {
                let idx = prevData.findIndex((record) => record._id === data._id);
                if (idx === -1) {
                    return [...prevData, data];
                } else {
                    prevData.splice(idx, 1, data);
                    return [...prevData];
                }
            });
        };
        socket.on("update_data", updateDataHandler);

        return () => {
            socket.off("update_data", updateDataHandler);
        };
    }, []);

    return (
        <main>
            MD1
            <br/><br/>
            
            {error && <p>Failed to fetch data</p>}

            {data.map((record, idx) => (
                <div key={record._id}>
                    <p>{idx+1}. {record.a}</p>
                    <br />
                </div>
            ))}
        </main>
    );
}
