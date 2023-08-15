const { hashString, toDateString } = require("@utils/index");
const moment = require("moment-timezone");

class Offer {
    constructor(name, company, date, link) {
        this.name = name;
        this.company = company;
        this.date = moment.tz(date, "YYYY-MM-DD", "America/New_York");
        this.link = link;
        this.id = hashString(
            this.name + this.company + toDateString(this.date),
        );
    }
}

module.exports = Offer;
