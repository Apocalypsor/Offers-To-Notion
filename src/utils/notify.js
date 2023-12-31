const client = require("@services/client");
const logger = require("@utils/logger");

const notify = async (errorMessage) => {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
        logger.warning("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set");
        return;
    }

    try {
        const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        const text = `Error: ${errorMessage}`;

        await client.post(url, {
            chat_id: chatId,
            text: text,
        });

        logger.info("Message sent!");
    } catch (error) {
        logger.error("Error sending message", error);
    }
};

module.exports = notify;
