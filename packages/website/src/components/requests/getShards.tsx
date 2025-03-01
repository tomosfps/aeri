import { env } from "@/env";

export enum Status {
    Online = "online",
    Starting = "starting",
    Offline = "offline",
    Unknown = "unknown",
}

export type Shard = {
    id: number;
    status: Status;
    eventsPerSecond: number;
};

export default async function GetShards(): Promise<Shard[]> {
    try {
        const response = await fetch(`${env.API_URL}/shards`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }
    catch (error: any) {
        console.error("Failed to fetch shards", error);
        return [];
    }
}
