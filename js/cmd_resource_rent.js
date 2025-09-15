import IndexMethod from "./cmd_index.js";
import { sleep } from "./util.js";

try {
    // async function init() {
    //     const im = await IndexMethod.create();
    //     im.tronManager.resourceRentDoInit();
    // }
    // init();

    async function init() {
        const im = await IndexMethod.create();
        while (true) {
            // console.log("-----init111----");
            await im.tronManager.resourceRentDoInit();
            // console.log("-----init222----");
            await sleep(1);
            // console.log("-----init333----");
        }
    }
    init();
} catch (error) {
    console.log(error.message);
}