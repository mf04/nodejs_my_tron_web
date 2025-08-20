import fs from "fs"
import cryptoService from "./cryptoService.js";
import { generateSequence, asyncReduce } from "./util.js";


const txtMap = [
    "D:/2025/my_tronweb/js/my01.p1.txt",
    "D:/2025/my_tronweb/js/my01.p2.txt",
    "D:/2025/my_tronweb/js/my01.p3.txt",
    "D:/2025/my_tronweb/js/my01.p4.txt",
    "D:/2025/my_tronweb/js/my01.p5.txt",
    "D:/2025/my_tronweb/js/my01.p6.txt",
];

async function readPrivateKeyFile() {
    const rankArr = generateSequence(6);
    const result = await asyncReduce(rankArr, async (prev, item) => {
        const addr = txtMap[item - 1];
        const txt = await fs.promises.readFile(addr, "utf-8");
        return prev + txt;
    }, "");
    return cryptoService.encrypt(result);
}

export {
    readPrivateKeyFile,
}