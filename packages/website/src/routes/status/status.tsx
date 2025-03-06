"use client";

import GetShards, { Shard } from '@/components/requests/getShards';
import LoadingSpinner from '@/components/ui/loadingSpinner';
import {  ShardCard } from '@/components/ui/shardCard';
import { useState, useEffect } from 'react';

export default function Status() {
    const [shards, setShards] = useState<Shard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchShards = async () => {
            try {
                const shardData = await GetShards();
                if (isMounted) {
                    setShards(shardData);
                }
            } catch (error) {
                console.error("Failed to fetch shards:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchShards();
        return () => { isMounted = false; };
    }, []);

    return (
        <>
            <main className="w-dvw min-h-dvh flex flex-col items-center py-12">
                <h1 className="text-3xl font-bold mb-8 text-cprimary-light">Shard Status</h1>
                
                {loading && <LoadingSpinner fullScreen={false} message="Loading Shards"/>}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl px-4">
                        {shards.map((shard) => (
                            <ShardCard 
                                key={shard.id} 
                                shard={shard} 
                            />
                        ))}
                    </div>
                )}
                
                {!loading && shards.length === 0 && (
                    <p className="text-xl text-cprimary-light">No shards found</p>
                )}
            </main>
        </>
    );
}
