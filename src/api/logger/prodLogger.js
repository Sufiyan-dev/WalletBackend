import { createLogger, format, transports } from "winston"

const buildProdLogger = () => {
    // creating logger 
    return createLogger({
        format: format.combine(
            format.timestamp(),
            format.errors({ stack: true }),
            format.json()
        ),
        defaultMeta: { service: "default" },
        transports: [new transports.Console()],
    });
}

export default buildProdLogger;