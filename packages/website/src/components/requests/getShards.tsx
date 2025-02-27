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
    return [];
}