import { readPrivateKeyFile } from "./fsService.js"
import TronResourceManager from "./TronResourceManager.js"

class MyService {

    constructor() {
        this.tronManager = null;
        this.init();
    }

    async init() {
        const privateKey = await readPrivateKeyFile();
        this.tronManager = new TronResourceManager(privateKey);
    }

    getMainAccount() {
        return this.tronManager.ownerAddress;
    }
}

export default MyService;