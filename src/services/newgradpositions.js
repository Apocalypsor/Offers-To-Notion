const client = require("@services/client");
const logger = require("@utils/logger");
const Offer = require("@models/offer");

const extractNameOrAbbreviation = (input) => {
    const strippedString = input.replace(/^[*[]+/, "");
    const regex = /^([^\]*(]+)/;
    const match = regex.exec(strippedString);
    return match ? match[1] : input;
};

const extractLink = (input) => {
    const linkMatch = input.match(/href="([^"]*)"/);
    if (linkMatch) {
        return linkMatch[1];
    }
    return null;
};

const scrape = async () => {
    const markdownContent = (
        await client.get(
            "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/README.md",
        )
    ).data;

    const startIndex = markdownContent.indexOf(
        "<!-- Please leave a one line gap between this and the table TABLE_START (DO NOT CHANGE THIS LINE) -->",
    );
    if (startIndex === -1) {
        logger.error("Jobs block not found.");
        return [];
    }
    let jobsContent = markdownContent.substring(startIndex);

    const endIndex = jobsContent.indexOf(
        "<!-- Please leave a one line gap between this and the table TABLE_END (DO NOT CHANGE THIS LINE) -->",
    );
    if (endIndex !== -1) {
        jobsContent = jobsContent.substring(0, endIndex);
    }

    // 3. Process the extracted block
    const rows = jobsContent.split("\n");
    const tableRows = rows.filter((row) => row.startsWith("|"));
    const header = tableRows[0]
        .split("|")
        .map((item) => item.split("<br>")[0].trim())
        .filter((item) => item);

    const jobListings = [];

    // Start from the third row (i = 2) to skip the header and its separator
    for (let i = 2; i < tableRows.length; i++) {
        const columns = tableRows[i]
            .split("|")
            .map((item) => item.trim())
            .filter((item) => item);

        if (columns.length === header.length) {
            const job = {};
            for (let j = 0; j < header.length; j++) {
                job[header[j]] = columns[j];
            }

            if (["🛂", "🇺🇸", "🔒"].includes(job["Application/Link"])) {
                continue;
            }

            const company = extractNameOrAbbreviation(job["Company"]);
            const link = extractLink(job["Application/Link"]);
            if (!link) {
                logger.error(`No link found for ${company}`);
                continue;
            }

            jobListings.push(
                new Offer(
                    job["Role"],
                    company,
                    job["Date Posted"],
                    link.replace(/[?&]utm_source=Simplify&ref=Simplify$/, ""),
                ),
            );
        }
    }

    logger.info(`Found ${jobListings.length} jobs in newgradpositons`);
    logger.debug(jobListings);

    return jobListings;
};

module.exports = {
    scrape,
};
