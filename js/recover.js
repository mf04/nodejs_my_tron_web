import tronService from "./tronService.js";
import { newAsync } from "./util.js";

class Recover {

    async init() {
        await this.resourceRecover();
    }

    async resourceRecover() {
        const result = await tronService.resourceRecover();
        console.log(result);
    }
}

try {
    // const r = new Recover();
    // await r.init();

    const r = await newAsync(Recover);
    console.log(r);

} catch (error) {
    console.log(error.message);
}
