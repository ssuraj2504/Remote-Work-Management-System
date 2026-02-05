import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const DashboardSkeleton = () => (
    <div className="dashboard-skeleton">
        <div className="page-header">
            <Skeleton height={40} width={300} />
            <Skeleton height={20} width={200} style={{ marginTop: 8 }} />
        </div>

        <div className="stats-grid">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="stat-card">
                    <Skeleton circle width={60} height={60} />
                    <div style={{ flex: 1, marginLeft: 16 }}>
                        <Skeleton height={20} width={120} />
                        <Skeleton height={32} width={60} style={{ marginTop: 8 }} />
                    </div>
                </div>
            ))}
        </div>

        <div style={{ marginTop: 32 }}>
            <Skeleton height={30} width={200} />
            <div style={{ marginTop: 16 }}>
                {[...Array(3)].map((_, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                        <Skeleton height={120} />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
    <div className="table-skeleton">
        <table>
            <thead>
                <tr>
                    {[...Array(columns)].map((_, i) => (
                        <th key={i}>
                            <Skeleton height={20} />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {[...Array(rows)].map((_, rowIndex) => (
                    <tr key={rowIndex}>
                        {[...Array(columns)].map((_, colIndex) => (
                            <td key={colIndex}>
                                <Skeleton height={20} />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const CardSkeleton = ({ count = 1 }) => (
    <>
        {[...Array(count)].map((_, i) => (
            <div key={i} className="card" style={{ marginBottom: 16 }}>
                <Skeleton height={20} width="60%" />
                <Skeleton height={16} count={2} style={{ marginTop: 12 }} />
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                    <Skeleton height={32} width={100} />
                    <Skeleton height={32} width={100} />
                </div>
            </div>
        ))}
    </>
);

export default {
    DashboardSkeleton,
    TableSkeleton,
    CardSkeleton
};
