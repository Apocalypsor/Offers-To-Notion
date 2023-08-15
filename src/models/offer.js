const { hashString, toDateString } = require("@utils/index");
const moment = require("moment-timezone");
const logger = require("@utils/logger");

class Offer {
    constructor(name, company, date, link) {
        this.name = name;
        this.company = company.replace(",", "").replace(".", "");
        this.link = link;
        this.date = moment.tz(
            date,
            ["YYYY-MM-DD", "MM/DD/YYYY"],
            "America/New_York",
        );

        if (!this.date.isValid()) {
            logger.error("Invalid date:", date);
        }

        this.id = hashString(
            this.name + this.company + toDateString(this.date),
        );
    }
}

module.exports = Offer;
