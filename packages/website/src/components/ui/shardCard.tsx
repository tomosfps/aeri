"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Shard, Status } from "../requests/getShards";

const statusConfig = {
    [Status.Online]: {
        label: "Online",
        className: "bg-emerald-500/20 text-emerald-500",
    },
    [Status.Starting]: {
        label: "Starting",
        className: "bg-amber-500/20 text-amber-500",
    },
    [Status.Offline]: {
        label: "Offline",
        className: "bg-rose-500/20 text-rose-500",
    },
    [Status.Unknown]: {
        label: "Unknown",
        className: "bg-slate-500/20 text-slate-500",
    },
};

interface ShardCardProps {
    shard: Shard;
    className?: string;
}

export function ShardCard({ shard, className }: ShardCardProps) {
    const [animate, setAnimate] = useState(false);
    const { label, className: statusClassName } = statusConfig[shard.status];
    const isOdd = shard.id % 2 !== 0;
    const accentColor = isOdd ? "csecondary-light" : "cprimary-light";
    const bgAccentClass = isOdd ? "bg-csecondary-light/5" : "bg-cprimary-light/5";

    // Pulse Animation for events per second
    useEffect(() => {
        if (shard.eventsPerSecond > 0) {
            setAnimate(true);
            const timeout = setTimeout(() => setAnimate(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [shard.eventsPerSecond]);

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-lg border border-cborder-light bg-cbackground-light p-4 transition-all",
                bgAccentClass,
                animate ? "shadow-md" : "shadow-sm",
                className
            )}
        >
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className={`text-lg font-medium text-${accentColor}`}>
                        Shard #{shard.id}
                    </h3>
                    <div className="flex items-center">
                        <div
                            className={cn(
                                "mr-2 h-2 w-2 rounded-full",
                                shard.status === Status.Online ? "bg-emerald-500" : 
                                shard.status === Status.Starting ? "bg-amber-500" :
                                shard.status === Status.Offline ? "bg-rose-500" : "bg-slate-500"
                            )}
                        />
                        <span
                            className={cn(
                                "rounded px-1.5 py-0.5 text-xs font-medium",
                                statusClassName
                            )}
                        >
                            {label}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <div className="text-sm text-ctext-light/70">Events Per Second</div>
                    <div className={cn(
                        "font-mono text-lg", 
                        animate ? `text-${accentColor}` : "text-ctext-light"
                    )}>
                        {shard.eventsPerSecond.toFixed(0)}
                    </div>
                </div>
            </div>
            
            {/* Activity indicator bar at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
                <div 
                    className={cn(
                        "h-full transition-all",
                        `bg-${accentColor}`,
                        shard.status === Status.Online ? "w-full opacity-30" : "w-0 opacity-0"
                    )}
                />
            </div>
        </div>
    );
}