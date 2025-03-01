import { createServer } from "node:http";
import { env } from "core";
import { Logger } from "logger";
import { register } from "prom-client";

const logger = new Logger();

export async function setupMetricsServer() {
    const server = createServer(async (req, res) => {
        if (req.url === "/metrics") {
            try {
                res.writeHead(200, { "Content-Type": register.contentType });
                res.end(await register.metrics());
            } catch (err: any) {
                logger.error("Failed to get metrics", "Metrics", err);
                res.statusCode = 500;
                res.end("Internal Server Error");
            }
        } else {
            res.statusCode = 404;
            res.end("Not Found");
        }
    });

    server.listen(env.METRICS_PORT, "0.0.0.0", () => {
        logger.infoSingle(`Metrics server listening on port ${env.METRICS_PORT}`, "Metrics");
    });
}
