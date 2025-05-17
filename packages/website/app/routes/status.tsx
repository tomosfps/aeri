import { useState, useEffect } from "react";
import GetShards, { type Shard, Status } from "~/requests/getShards";
import "~/styles/status.css";

export function meta() {
    return [{ title: "Status | Aeri" }];
}

export default function StatusPage() {
    const [statusData, setStatusData] = useState<Shard[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchShardData = async () => {
            setLoading(true);
            try {
                const shards = await GetShards();
                setStatusData(shards);
            } catch (error) {
                setStatusData([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchShardData();
        
        const interval = setInterval(fetchShardData, 10000);
        return () => clearInterval(interval);
    }, []);

    const statusCounts = {
        online: statusData.filter(shard => shard.status === Status.Online).length,
        starting: statusData.filter(shard => shard.status === Status.Starting).length,
        offline: statusData.filter(shard => shard.status === Status.Offline).length,
        unknown: statusData.filter(shard => shard.status === Status.Unknown).length,
    };

    const totalEventsPerSecond = statusData.reduce((total, shard) => total + shard.eventsPerSecond, 0);

    return (
        <div className="status-page">
        <div className="status-decoration-top"></div>
        <div className="status-circles">
            <div className="status-circle circle-1"></div>
            <div className="status-circle circle-2"></div>
            <div className="status-circle circle-3"></div>
        </div>

        <div className="status-container">
            <div className="status-header">
            <h1 className="status-title">
                <span className="aeri-status-name-wrapper">
                <span className="kawaii-letter">A</span>
                <span className="kawaii-letter">e</span>
                <span className="kawaii-letter">r</span>
                <span className="kawaii-letter">i</span>
                </span> Status
                <span className="title-emoji">💫</span>
            </h1>
            <p className="status-subtitle">
                Real-time monitoring of our gateway shards
            </p>
            </div>

            <div className="status-overview">
            <div className={`status-card ${loading ? 'loading' : ''}`}>
                <div className="status-number-container">
                <div className="pastel-number">{loading ? '...' : statusData.length}</div>
                <div className="status-sparkles">
                    <div className="status-sparkle"></div>
                </div>
                </div>
                <div className="status-label">Total Shards</div>
            </div>
            
            <div className={`status-card ${loading ? 'loading' : ''}`}>
                <div className="status-number-container">
                <div className="pastel-number">{loading ? '...' : statusCounts.online}</div>
                <div className="status-sparkles">
                    <div className="status-sparkle"></div>
                </div>
                </div>
                <div className="status-label">Online Shards</div>
            </div>
            
            <div className={`status-card ${loading ? 'loading' : ''}`}>
                <div className="status-number-container">
                <div className="pastel-number">{loading ? '...' : totalEventsPerSecond.toFixed(2)}</div>
                <div className="status-sparkles">
                    <div className="status-sparkle"></div>
                </div>
                </div>
                <div className="status-label">Events Per Second</div>
            </div>
            </div>

            <div className="status-detail-section">
            <h2 className="detail-title">Shard Status</h2>
            <div className="shard-grid">
                {loading ? (
                    Array(6).fill(0).map((_, index) => (
                        <div key={`loading-${index}`} className="shard-card loading">
                            <div className="shard-header">
                                <div className="shard-id">Loading...</div>
                                <div className="shard-status-indicator">
                                    <span className="status-dot"></span>
                                    <span className="status-text">Loading...</span>
                                </div>
                            </div>
                            <div className="shard-stats">
                                <div className="shard-stat">
                                    <div className="stat-value">...</div>
                                    <div className="stat-name">events/sec</div>
                                </div>
                            </div>
                            <div className="shard-decoration"></div>
                        </div>
                    ))
                ) : (
                    statusData.map((shard) => (
                        <div key={shard.id} className={`shard-card shard-status-${shard.status}`}>
                            <div className="shard-header">
                            <div className="shard-id">Shard #{shard.id}</div>
                            <div className={`shard-status-indicator ${shard.status}`}>
                                <span className="status-dot"></span>
                                <span className="status-text">{shard.status}</span>
                            </div>
                            </div>
                            <div className="shard-stats">
                            <div className="shard-stat">
                                <div className="stat-value">{shard.eventsPerSecond.toFixed(2)}</div>
                                <div className="stat-name">events/sec</div>
                            </div>
                            </div>
                            <div className="shard-decoration"></div>
                        </div>
                    ))
                )}
            </div>
            </div>

            <div className="status-footer">
            <div className="status-update-message">
                <span className="update-icon">🔄</span>
                Updates automatically every 10 seconds
            </div>
            </div>
        </div>
        <div className="status-decoration-bottom"></div>
        </div>
    );
}