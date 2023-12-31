const client = require("@services/client");
const cheerio = require("cheerio");
const _ = require("lodash");
const Offer = require("@models/offer");
const logger = require("@utils/logger");

const scrapeOnePage = async (pageNum) => {
    const res = await client.get(
        `https://haooffer.net/new-grad/page/${pageNum}/?0=1&nations=US&oppTypes=New%20Grad&types=SDE`,
    );

    const $ = cheerio.load(res.data);
    const tableDiv = $(".tablebox");
    const rows = $(tableDiv).find("div.row");

    let tableData = [];
    let stop = false;

    logger.debug(
        `Found ${rows.length} rows in page ${pageNum} of haooffer.net/new-grad`,
    );

    rows.map(async (i, row) => {
        const cols = $(row).find("div.td");
        if (cols.length === 0) return;

        const colData = [];

        let valid = true;
        cols.each((j, ele) => {
            const element = $(ele);
            if (element.find("a").length) {
                const sponsor = element.text().trim();
                if (
                    sponsor.includes("US Citizen") ||
                    sponsor.includes("无 Sponsor") ||
                    sponsor.includes("职位失效")
                ) {
                    logger.debug(
                        "Skipping " + sponsor + " because it is " + sponsor,
                    );
                    valid = false;
                }
                colData.push(element.find("a").attr("href"));
                colData.push(element.find("a").text().trim());
            } else {
                colData.push(element.text().trim());
            }
        });

        if (colData[0].startsWith("没数据")) stop = true;

        if (!stop && valid) {
            tableData.push(
                new Offer(
                    colData[1],
                    colData[2],
                    colData[3],
                    colData[0].replace(
                        /[?&]utm_source=Haooffer&ref=Haooffer/,
                        "",
                    ),
                ),
            );
        }
    });

    return tableData;
};

const scrape = async () => {
    let tableData = [];

    for (let i = 1; ; i++) {
        const scrapedTableData = await scrapeOnePage(i);
        if (scrapedTableData.length === 0) break;

        tableData = _.union(tableData, scrapedTableData);
    }

    logger.info("Found " + tableData.length + " offers from haooffer");
    logger.debug(tableData);

    return tableData;
};

module.exports = {
    scrape,
};
