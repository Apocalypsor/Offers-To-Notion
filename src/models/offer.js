const { hashString } = require("@utils/index");

class Offer {
    constructor(name, company, date, link) {
        this.name = name;
        this.company = company;
        this.date = new Date(date);
        this.link = link;
        this.id = hashString(this.name + this.company + this.date);
    }
}

module.exports = Offer;
