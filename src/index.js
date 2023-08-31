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

    logger.info("Start to scrape haoofer...");
    const newHaooffers = await haooffer.scrape();

    logger.info("Start to scrape newgrad...");
    const newNewGradOffers = await newgrad.scrape();

    const newOffers = _.concat(newHaooffers, newNewGradOffers);

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
    .catch(async (err) => {
        logger.error(err.stack);
        await notify(err.message);
    });
