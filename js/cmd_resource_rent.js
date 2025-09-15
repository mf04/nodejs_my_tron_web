import IndexMethod from "./cmd_index.js";

try {
    async function init() {
        const im = await IndexMethod.create();
        im.tronManager.resourceRentDoInit();
    }
    // init();
    while (true) {
        init();
        sleep(1);
    }
} catch (error) {
    console.log(error.message);
}