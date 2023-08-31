const { Client } = require("@notionhq/client");
const Offer = require("@models/offer");
const { toDateString } = require("@utils/index");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const query = async () => {
    let hasMore = true;
    let startCursor = undefined;
    const haooffers = [];

    while (hasMore) {
        const response = await notion.databases.query({
            database_id: process.env.DATABASE_ID,
            start_cursor: startCursor,
            page_size: 100,
        });

        for (let page of response.results) {
            const name = page.properties.Name.title[0]?.text.content;
            const company = page.properties.Company.multi_select[0]?.name;
            const date = page.properties.Date.date?.start;
            const link = page.properties.Link.url;

            // noinspection OverlyComplexBooleanExpressionJS
            if (name && company && date && link) {
                const haooffer = new Offer(name, company, date, link);
                haooffers.push(haooffer);
            }
        }

        hasMore = response.has_more;
        startCursor = response.next_cursor;
    }

    return haooffers;
};

const insertOne = async (offer) => {
    return await notion.pages.create({
        parent: { database_id: process.env.DATABASE_ID },
        properties: {
            "Name": { title: [{ text: { content: offer.name } }] },
            "Company": {
                multi_select: [
                    {
                        name: offer.company,
                    },
                ],
            },
            "Link": { url: offer.link },
            "Date": { date: { start: toDateString(offer.date) } },
            "Submitted?": { checkbox: false },
            "Won't Apply": { checkbox: false },
            "Ignored?": { checkbox: false },
        },
    });
};

module.exports = { query, insertOne };
