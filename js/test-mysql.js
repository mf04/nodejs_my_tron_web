import { createStakeForSelf } from "./MyMysql/Index.js"

(async function () {

    const result = await createStakeForSelf(
        20,
        "ENERGY",
        "TYeVen55WyknWPUpZemobRbs3cUEM8KJhy",
        "sdfdg8935738b0f9ade2556685ee14d532e591b9ce4179bd93521c19622dc51f9"
    );

    console.log("--------createStakeForSelf---------");
    console.log(result);

}())
