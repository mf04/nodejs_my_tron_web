import fs from "fs"
import cryptoService from "./cryptoService.js";
import { generateSequence, asyncReduce, readContentFromUrl, isLocalPathFnc } from "./util.js";
import { my01PostionArr } from "./config.js";

async function readPrivateKeyFile() {
    const rankArr = generateSequence(6);
    const result = await asyncReduce(rankArr, async (prev, item) => {
        const addr = my01PostionArr[item - 1];
        // console.log(addr);
        const isLocalPath = isLocalPathFnc(addr);
        // console.log(isLocalPath);
        let txt = "";
        if (isLocalPath) {
            txt = await fs.promises.readFile(addr, "utf-8");
        } else {
            txt = await readContentFromUrl(addr);
        }
        txt = cryptoService.decrypt(txt);
        return prev + txt;
    }, "");
    return result;
}

export {
    readPrivateKeyFile,
}