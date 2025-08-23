import fs from "fs"
import cryptoService from "./cryptoService.js";
import { generateSequence, asyncReduce } from "./util.js";
import { my01PostionArr } from "./config.js"

async function readPrivateKeyFile() {
    const rankArr = generateSequence(6);
    const result = await asyncReduce(rankArr, async (prev, item) => {
        const addr = my01PostionArr[item - 1];
        let txt = await fs.promises.readFile(addr, "utf-8");
        txt = cryptoService.decrypt(txt);
        return prev + txt;
    }, "");
    return result;
    // return cryptoService.encrypt(result);
}

export {
    readPrivateKeyFile,
}