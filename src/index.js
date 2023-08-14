require("module-alias/register");
require("dotenv").config();
const { scrape } = require("@services/haooffer");
const { query, insertOne } = require("@services/notion");

(async () => {
    const existingHaooffers = await query();
    const idSet = new Set(existingHaooffers.map((haooffer) => haooffer.id));
    const linkSet = new Set(existingHaooffers.map((haooffer) => haooffer.link));
    const newHaooffers = await scrape();

    // * Filter out existing haooffers by id and link
    const filteredHaooffers = newHaooffers.filter((haooffer) => {
        if (idSet.has(haooffer.id) || linkSet.has(haooffer.link)) {
            console.debug(`Skipping ${haooffer.name}...`);
            return false;
        } else {
            console.debug(`Adding ${haooffer.name}...`);
            return true;
        }
    });

    for (let data of filteredHaooffers) {
        await insertOne(data);
    }
})();
