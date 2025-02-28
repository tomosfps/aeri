import { env } from "@/env";

export enum Status {
    Online,
    Starting,
    Offline,
    Unknown,
}

export type Shard = {
    id: number;
    status: Status;
    eventsPerSecond: number;
};

export default async function GetShards(): Promise<Shard[]> {
    try {
        const response = await fetch(`${env.API_URL}/get_shards`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.shards || !Array.isArray(data.shards)) {
            console.error("Unexpected response: ", data);
            return [];
        }
        
        // Do the rest from here
        return [];
    }
    catch (error: any) {
        console.error("Failed to fetch shards", error);
        return [];
    }
}