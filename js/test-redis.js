import { createClient } from "redis"

async function init() {
    const connectParams = {
        socket: {
            host: "192.168.3.44",
            port: 6379,
            tls: false,
        },
        password: "kingsai001!@",
        database: 6
    };
    const client = await createClient(connectParams)
        .on("error", err => console.log(err))
        .connect();
    await client.set("aaaa", 123123);
}

init();