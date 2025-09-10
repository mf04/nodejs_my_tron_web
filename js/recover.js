import tronService from "./tronService.js";

class Recover {

    init() {
        this.resourceRecover();
    }

    async resourceRecover() {
        const result = await tronService.resourceRecover();
        console.log(result);
    }
}


try {
    const r = new Recover;
    r.init();
} catch (error) {
    console.log(error.message);
}
