import { Logger } from "logger";

const logger = new Logger();

export async function checkResponse(response: Response | null | undefined, type: string): Promise<any> {
    if (response === null || response === undefined) {
        logger.error(`Error in response for type ${type}`, "Response is null");
        return null;
    }

    if (!response.ok) {
        const error = await response.json();
        logger.error(`Error in response for type ${type}`, error);
        return null;
    }

    const result = await response.json();
    if (result.error) {
        logger.error(`Error in response for type ${type}`, result);
        return null;
    }
    return result;
}

export function truncateAnilistDescription(description: string, itemsToRemove: number): string {
    const lines = description.split("\n");
    const truncatedLines = lines.slice(0, lines.length - itemsToRemove);
    const remainingItems = lines.length - truncatedLines.length;
    return `${truncatedLines.join("\n")}\n+ ${remainingItems} more`;
}

export function truncateAnilistIfExceedsDescription(description: string, maxLength: number): string {
    if (description.length > maxLength) {
        const excessLength = description.length - maxLength;
        const itemsToRemove = Math.ceil(excessLength / 100);
        return truncateAnilistDescription(description, itemsToRemove);
    }
    return description;
}

export function filteredDescription(description: string | string[], set_spoiler: boolean): string {
    if (typeof description === "string") {
        return description
            .split("\n")
            .map((line: any) => {
                if ((set_spoiler && line.startsWith("~!")) || line.endsWith("!~")) {
                    return `||${line.slice(2, -2)}||`;
                }
                return line;
            })
            .filter((line: any) => {
                return !(
                    /^\s*$/.test(line) ||
                    /null/.test(line) ||
                    /undefined/.test(line) ||
                    line === "`completed         :` \n \n" ||
                    line === "`current           :` \n \n" ||
                    line === "`planning          :` \n \n" ||
                    line === "`dropped           :`\n \n" ||
                    line === "`paused            :`\n \n\n"
                );
            })
            .join("\n");
    }

    const filtered = description
        .filter((line) => {
            return !(
                /^\s*$/.test(line) ||
                /null/.test(line) ||
                /undefined/.test(line) ||
                line === "`completed         :` \n \n" ||
                line === "`current           :` \n \n" ||
                line === "`planning          :` \n \n" ||
                line === "`dropped           :`\n \n" ||
                line === "`paused            :`\n \n\n"
            );
        })
        .join("");
    return filtered;
}
