import fs from "fs"
import cryptoService from "./cryptoService.js";
import { generateSequence, asyncReduce } from "./util.js";
import { my01PostionArr } from "./config.js"

async function readPrivateKeyFile() {
    const rankArr = generateSequence(6);
    const result = await asyncReduce(rankArr, async (prev, item) => {
        const addr = my01PostionArr[item - 1];
        const txt = await fs.promises.readFile(addr, "utf-8");
        return prev + txt;
    }, "");
    return cryptoService.encrypt(result);
}

export {
    readPrivateKeyFile,
}