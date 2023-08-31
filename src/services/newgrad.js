const client = require("@services/client");
const Offer = require("@models/offer");
const logger = require("@utils/logger");

const extractNameOrAbbreviation = (input) => {
    const linkRemoved = input.replace(/\[([^\]]+)]\([^)]+\)/, "$1");

    const abbreviationMatch = linkRemoved.match(/\(([^)]+)\)/);
    if (abbreviationMatch) {
        return abbreviationMatch[1];
    }

    const matched = linkRemoved.replace(/\([^)]*\)/g, "").trim();
    if (matched) {
        return matched;
    } else {
        return linkRemoved;
    }
};

const checkNoSponsor = (str) => {
    const stopWords = [
        "Work Auth Required",
        "Sponsorship not available",
        "U.S. Citizen",
        "Permanent Resident",
        "does NOT offer visa sponsorship",
        "No sponsorship",
        "sponsorship not eligible",
        "not eligible for sponsorship",
        "Sponsorship not provided",
        "sponsorship not available",
    ];

    return stopWords.some((word) => str.indexOf(word) !== -1);
};

const extractJobDetails = (str) => {
    return str
        .split("<br>")
        .map((item) => {
            if (!item || item.indexOf("🔒") !== -1) return null;
            const match = item.match(/\[(.*?)]\((.*?)\)/);
            if (match && match[1] && match[2]) {
                return { name: match[1], link: match[2] };
            }
            return null;
        })
        .filter((job) => job !== null);
};

const scrape = async () => {
    const markdownContent = (
        await client.get(
            "https://raw.githubusercontent.com/ReaVNaiL/New-Grad-2024/main/README.md",
        )
    ).data;

    // 1. Locate the "## Jobs" block
    const startIndex = markdownContent.indexOf("## Jobs");
    if (startIndex === -1) {
        logger.error("Jobs block not found.");
        return [];
    }
    let jobsContent = markdownContent.substring(startIndex);

    // 2. Extract content until "-END OF LIST-" or end of content
    const endIndex = jobsContent.indexOf("-END OF LIST-");
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

            const sponsor = job["Citizenship/Visa Requirements"];
            if (sponsor && checkNoSponsor(sponsor)) {
                logger.debug(
                    `Skipping ${job["Roles"]} at ${job["Name"]} due to work auth.`,
                );
                continue;
            }

            const nameAndLink = extractJobDetails(job["Roles"]);
            const company = extractNameOrAbbreviation(job["Name"]);
            for (const nl of nameAndLink) {
                jobListings.push(
                    new Offer(nl.name, company, job["Date Added"], nl.link),
                );
            }
        }
    }

    logger.info(`Found ${jobListings.length} jobs in newgrad`);
    logger.debug(jobListings);

    return jobListings;
};

module.exports = {
    scrape,
};
