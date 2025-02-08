export type errorResponse = {
    error: string;
};

export async function validateResponse<T extends object>(response: Response): Promise<T> {
    if (!response.ok) {
        const result = (await response.json().catch((error) => {
            throw new Error(`Error while parsing error response (${response.status})`, { cause: error });
        })) as errorResponse;

        throw new Error(`Response not ok (${response.status}):\n${result.error}`);
    }

    return (await response.json().catch((error) => {
        throw new Error("Error while parsing response", { cause: error });
    })) as T;
}
