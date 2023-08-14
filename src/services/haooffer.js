const client = require("@services/client");
const cheerio = require("cheerio");
const _ = require("lodash");
const Haooffer = require("@models/haooffer");

const scrapeOnePage = async (pageNum) => {
    const res = await client.get(
        `https://haooffer.net/new-grad/page/${pageNum}/?0=1&nations=US&oppTypes=New%20Grad&types=SDE`,
    );

    const $ = cheerio.load(res.data);
    const rows = $("tr");

    let tableData = [];
    let start = false;
    let stop = false;

    rows.each((i, row) => {
        const cols = $(row).find("td, th");

        let colData = [];
        cols.each((j, ele) => {
            const element = $(ele);
            if (element.find("a").length) {
                colData.push(element.find("a").attr("href"));
                colData.push(element.find("a").text().trim());
            } else {
                colData.push(element.text().trim());
            }
        });

        if (colData[0].startsWith("没数据")) stop = true;

        if (start && !stop) {
            tableData.push(
                new Haooffer(colData[1], colData[2], colData[3], colData[0]),
            );
        }

        if (colData[0].startsWith("职位名称")) {
            start = true;
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

    return tableData;
};

module.exports = {
    scrape,
};
