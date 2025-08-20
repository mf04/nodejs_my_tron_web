import { createClient } from "redis"
import { redisHost, redisPort, redisPwd, redisDb } from "../config.js"

class RedisManager {
    constructor() {
        this.client = null;
    }

    async connect() {
        const connectParams = {
            socket: {
                host: redisHost,
                port: redisPort,
                tls: false,
            },
            password: redisPwd,
            database: redisDb,
        };
        this.client = await createClient(connectParams)
            .on("error", err => console.log(err))
            .connect();
    }

    async stakeForSelfItemPush(amountInSun, resourceType, ownerAddress, txid) {
        const parmas = {
            amountInSun,
            resourceType,
            ownerAddress,
            txid,
            status: 0,
            time: +new Date(),
        }
        await this.connect();
        this.client.hSet("Hash_stake_for_self", parmas.txid, JSON.stringify(parmas));
    }

    async getMyPrimaryKey() {
        await this.connect();
        const ret = await this.client.get("my01") || "";
        return ret;
    }

}

export default RedisManager;