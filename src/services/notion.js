const { Client } = require("@notionhq/client");
const Haooffer = require("@models/haooffer");
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

        const haooffer = new Haooffer(name, company, date, link);
        haooffers.push(haooffer);
    }

    return haooffers;
};

const insertOne = async (data) => {
    return await notion.pages.create({
        parent: { database_id: process.env.DATABASE_ID },
        properties: {
            "Name": { title: [{ text: { content: data.name } }] },
            "Company": {
                multi_select: [
                    {
                        name: data.company.replace(",", "").replace(".", ""),
                    },
                ],
            },
            "Link": { url: data.link },
            "Date": { date: { start: toDateString(data.date) } },
            "Submitted?": { checkbox: false },
        },
    });
};

module.exports = { query, insertOne };
