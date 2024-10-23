import { type InspectOptions, inspect } from "node:util";
import chalk, { type ChalkInstance } from "chalk";
import { env } from "core";

export enum LogLevel {
    Fatal = 0,
    Error = 1,
    Warn = 2,
    Info = 3,
    Debug = 4,
    Silly = 5,
}

const inspectOptions: InspectOptions = {
    depth: Number.POSITIVE_INFINITY,
    colors: true,
    maxArrayLength: Number.POSITIVE_INFINITY,
    breakLength: 120,
    compact: Number.POSITIVE_INFINITY,
};

const connectors = {
    singleLine: "▪",
    startLine: "┏",
    line: "┃",
    endLine: "┗",
};

const tags: { [key in LogLevel]: string } = {
    5: chalk.magentaBright("silly:".padStart(6, " ")),
    4: chalk.blueBright("debug:".padStart(6, " ")),
    3: chalk.greenBright("info:".padStart(6, " ")),
    2: chalk.yellowBright("warn:".padStart(6, " ")),
    1: chalk.redBright("error:".padStart(6, " ")),
    0: chalk.red("fatal:".padStart(6, " ")),
};

export class Logger {
    private timestamp(): string {
        const date = new Date();

        const year = date.getUTCFullYear();
        const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
        const day = date.getUTCDate().toString().padStart(2, "0");
        const hours = date.getUTCHours().toString().padStart(2, "0");
        const minutes = date.getUTCMinutes().toString().padStart(2, "0");
        const seconds = date.getUTCSeconds().toString().padStart(2, "0");

        const line = `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`;
        return chalk.dim(line);
    }

    private getCallee(): string {
        const oldPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => stack;
        const stack = new Error().stack;
        Error.prepareStackTrace = oldPrepareStackTrace;

        if (!stack || typeof stack !== "object") return "unknown";

        const line = stack[3] as NodeJS.CallSite;

        return chalk.italic(
            `at ${line.getFileName()?.slice(7)}:${line.getLineNumber()}:${line.getColumnNumber()} [${
                line.getFunctionName() || "top level"
            }]`,
        );
    }

    private errorToLines(error: Error): string[] {
        return error.stack?.split("\n") || [];
    }

    private getColor(level: LogLevel): ChalkInstance {
        switch (level) {
            case LogLevel.Fatal:
                return chalk.red;
            case LogLevel.Error:
                return chalk.redBright;
            case LogLevel.Warn:
                return chalk.yellowBright;
            case LogLevel.Info:
                return chalk.greenBright;
            case LogLevel.Debug:
                return chalk.blueBright;
            case LogLevel.Silly:
                return chalk.magentaBright;
            default:
                return chalk.white;
        }
    }

    private write(message: string, tag: string, level: LogLevel, at: boolean, object?: object): void {
        const color = this.getColor(level);
        const timestamp = this.timestamp();
        const timestampPadding = " ".repeat(21);
        const levelTag = tags[level];
        const dimLevelTag = " ".repeat(6);
        const domainTag = `[${color(`${tag}`)}]`;
        const mainMessage = color(message);

        let log = `${timestamp} ${levelTag} ${connectors.startLine} ${domainTag} ${mainMessage}\n`;

        const metaLines = object
            ? object instanceof Error
                ? this.errorToLines(object)
                : [inspect(object, inspectOptions)]
            : [];

        if (at) {
            const callee = color.dim(this.getCallee());
            log += `${timestampPadding} ${dimLevelTag} ${
                metaLines.length ? connectors.line : connectors.endLine
            } ${callee}\n`;
        }

        for (let i = 0; i < metaLines.length; i++) {
            const line = i > 2 ? chalk.dim(metaLines[i]) : metaLines[i];
            const connector = i === metaLines.length - 1 ? connectors.endLine : connectors.line;
            const lineNumber = chalk.dim(`[${i + 1}]`);
            log += `${timestampPadding} ${dimLevelTag} ${connector} ${lineNumber} ${line}\n`;
        }

        process.stdout.write(log);
    }

    private writeSingle(message: string, tag: string, level: LogLevel): void {
        const color = this.getColor(level);
        const timestamp = this.timestamp();
        const levelTag = tags[level];
        const domainTag = `[${color(`${tag}`)}]`;
        const mainMessage = color(message);
        process.stdout.write(`${timestamp} ${levelTag} ${connectors.singleLine} ${domainTag} ${mainMessage}\n`);
    }

    public silly(message: string, tag: string, object?: object, at = false): void {
        if (env.LOG_LEVEL < LogLevel.Silly) return;
        this.write(message, tag, LogLevel.Silly, at, object);
    }

    public sillySingle(message: string, tag: string): void {
        if (env.LOG_LEVEL < LogLevel.Silly) return;
        this.writeSingle(message, tag, LogLevel.Silly);
    }

    public debug(message: string, tag: string, object?: object, at = false): void {
        if (env.LOG_LEVEL < LogLevel.Debug) return;
        this.write(message, tag, LogLevel.Debug, at, object);
    }

    public debugSingle(message: string, tag: string): void {
        if (env.LOG_LEVEL < LogLevel.Debug) return;
        this.writeSingle(message, tag, LogLevel.Debug);
    }

    public info(message: string, tag: string, object?: object, at = false): void {
        if (env.LOG_LEVEL < LogLevel.Info) return;
        this.write(message, tag, LogLevel.Info, at, object);
    }

    public infoSingle(message: string, tag: string): void {
        if (env.LOG_LEVEL < LogLevel.Info) return;
        this.writeSingle(message, tag, LogLevel.Info);
    }

    public warn(message: string, tag: string, object?: object, at = true): void {
        if (env.LOG_LEVEL < LogLevel.Warn) return;
        this.write(message, tag, LogLevel.Warn, at, object);
    }

    public warnSingle(message: string, tag: string): void {
        if (env.LOG_LEVEL < LogLevel.Warn) return;
        this.writeSingle(message, tag, LogLevel.Warn);
    }

    public error(message: string, tag: string, object?: object, at = true): void {
        if (env.LOG_LEVEL < LogLevel.Error) return;
        this.write(message, tag, LogLevel.Error, at, object);
    }

    public errorSingle(message: string, tag: string): void {
        if (env.LOG_LEVEL < LogLevel.Error) return;
        this.writeSingle(message, tag, LogLevel.Error);
    }

    public fatal(message: string, tag: string, object?: object, at = true): void {
        this.write(message, tag, LogLevel.Fatal, at, object);
    }

    public fatalSingle(message: string, tag: string): void {
        this.writeSingle(message, tag, LogLevel.Fatal);
    }
}
