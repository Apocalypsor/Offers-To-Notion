const winston = require("winston");

const rootDir = __dirname + "/../../";

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.File({
            filename: rootDir + "./logs/error.log",
            level: "error",
        }),

        new winston.transports.File({
            filename: rootDir + "./logs/combined.log",
        }),

        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
            ),
        }),
    ],
});

module.exports = logger;
