require("module-alias/register");
require("dotenv").config();
const { Client } = require("@notionhq/client");
const logger = require("@utils/logger");
const notify = require("@utils/notify");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const query = async () => {
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        const response = await notion.databases.query({
            database_id: process.env.DATABASE_ID,
            start_cursor: startCursor,
            page_size: 100,
        });
        // Transfer the submitted, Ignored, Won't Apply to Status
        for (let page of response.results) {
            const status = page.properties.Status.status?.name;
            const Submitted = page.properties["Submitted?"].checkbox;
            const Ignored = page.properties["Ignored?"].checkbox;
            const WontApply = page.properties["Won't Apply"].checkbox;
            if (status == "Draft" && (Submitted || Ignored || WontApply)) {
                const statusName =
                    Submitted ? "Submitted" : WontApply || Ignored ? "Won't Apply" : "Draft";

                await notion.pages.update({
                    page_id: page.id,
                    properties: {
                        Status: {
                            status: {
                                name: statusName,
                            },
                        },
                    },
                });
            }
        }

        hasMore = response.has_more;
        startCursor = response.next_cursor;
    }
}

const main = async () => {
    logger.info("Start to migrate status...");
    await query();
}

main()
    .then(() => console.log("Finish the migrating!"))
    .catch(async (err) => {
        logger.error(err.stack);
        await notify(`Offers-To-Notion:\n${err.message}`);
    });
