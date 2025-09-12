import { readPrivateKeyFile } from "./fsService.js"
import TronResourceManager from "./TronResourceManager.js"

class IndexMethod {

    constructor(tronManager) {
        this.tronManager = tronManager;
    }

    static async create() {
        const privateKey = await readPrivateKeyFile();
        const tronManager = new TronResourceManager(privateKey);
        return new IndexMethod(tronManager);
    }
}

export default IndexMethod;