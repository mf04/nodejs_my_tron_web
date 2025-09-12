import IndexMethod from "./cmd_index.js";
// import { readPrivateKeyFile } from "./fsService.js"
// import TronResourceManager from "./TronResourceManager.js"

// class Recover {

//     constructor(tronManager) {
//         this.tronManager = tronManager;
//     }

//     static async create() {
//         const privateKey = await readPrivateKeyFile();
//         const tronManager = new TronResourceManager(privateKey);
//         return new Recover(tronManager);
//     }
// }

try {
    (async () => {
        const im = await IndexMethod.create();
        im.tronManager.resourceRecover();
    })();
} catch (error) {
    console.log(error.message);
}
