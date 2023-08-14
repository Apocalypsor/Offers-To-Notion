const crypto = require("crypto");

const hashString = (data) => {
    const hash = crypto.createHash("sha256");
    hash.update(data);
    return hash.digest("hex");
};

const toDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

module.exports = { hashString, toDateString };
