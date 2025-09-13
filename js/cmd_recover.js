import IndexMethod from "./cmd_index.js";

try {
    async function init() {
        const im = await IndexMethod.create();
        im.tronManager.resourceRentRecoverInit();
    }
    init();
} catch (error) {
    console.log(error.message);
}
