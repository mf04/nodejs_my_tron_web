import IndexMethod from "./cmd_index.js";
import { sleep } from "./util.js";

try {
    async function init() {
        const im = await IndexMethod.create();
        while (true) {
            await im.tronManager.userRechargeInit();
            await sleep(1);
        }
    }
    init();
} catch (error) {
    console.log(error.message);
}