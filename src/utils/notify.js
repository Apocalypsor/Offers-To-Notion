const client = require("@services/client");
const logger = require("@utils/logger");

const notify = async (errorMessage) => {
    try {
        const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        const text = `Error: ${errorMessage}`;

        const response = await client.post(url, {
            chat_id: chatId,
            text: text,
        });

        logger.info("Message sent", response.data);
    } catch (error) {
        logger.log("Error sending message", error);
    }
};

module.exports = notify;
