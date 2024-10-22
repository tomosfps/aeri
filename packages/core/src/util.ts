export function calculateWorkerId(shardIds: number[], shardsPerWorker: number): number {
    if (shardIds[0] === undefined) throw new Error("No shard IDs provided.");

    return Math.floor(shardIds[0] / shardsPerWorker);
}
