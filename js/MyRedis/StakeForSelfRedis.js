import RedisManager from "./RedisManager.js";

class StakeForSelfRedis {

    constructor() {
        this.key = "Hash_stake_for_self";
        this.redis = new RedisManager;
        this.client = null;
    }

    async itemPush(amountInSun, resourceType, ownerAddress, txid) {
        const parmas = {
            amountInSun,
            resourceType,
            ownerAddress,
            txid,
            status: 0,
            time: +new Date(),
        }
        await this.redis.connect();
        this.client = this.redis.client;
        this.client.hSet(this.key, parmas.txid, JSON.stringify(parmas));
    }


}

export default StakeForSelfRedis;