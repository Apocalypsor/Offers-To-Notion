const { Client } = require("@notionhq/client");
const Offer = require("@models/offer");
const { toDateString } = require("@utils/index");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const query = async () => {
    const response = await notion.databases.query({
        database_id: process.env.DATABASE_ID,
    });

    const haooffers = [];

    for (let page of response.results) {
        const name = page.properties.Name.title[0]?.text.content;
        const company = page.properties.Company.multi_select[0]?.name;
        const date = page.properties.Date.date?.start;
        const link = page.properties.Link.url;

        const haooffer = new Offer(name, company, date, link);
        haooffers.push(haooffer);
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
                        name: offer.company.replace(",", "").replace(".", ""),
                    },
                ],
            },
            "Link": { url: offer.link },
            "Date": { date: { start: toDateString(offer.date) } },
            "Submitted?": { checkbox: false },
        },
    });
};

module.exports = { query, insertOne };
