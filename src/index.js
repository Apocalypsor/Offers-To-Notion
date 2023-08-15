require("module-alias/register");
require("dotenv").config();
const haooffer = require("@services/haooffer");
const { query, insertOne } = require("@services/notion");
const logger = require("@utils/logger");
const newgrad = require("@services/newgrad");
const _ = require("lodash");
const notify = require("@utils/notify");

const main = async () => {
    const existingOffers = await query();
    const linkSet = new Set(existingOffers.map((haooffer) => haooffer.link));

    const newHaooffers = await haooffer.scrape();
    const newNewGradOffers = await newgrad.scrape();
    const newOffers = _.concat(newHaooffers, newNewGradOffers);

    // * Filter out existing haooffers by id and link
    const filteredOffers = newOffers.filter((haooffer) => {
        if (linkSet.has(haooffer.link)) {
            logger.debug(`Skipping ${haooffer.name}...`);
            return false;
        } else {
            logger.debug(`Adding ${haooffer.name}...`);
            return true;
        }
    });

    logger.info(`Adding ${filteredOffers.length} new offers...`);

    for (let data of filteredOffers) {
        await insertOne(data);
    }
};

main()
    .then(() => console.log("Done!"))
    .catch(async (err) => await notify(err.message));
