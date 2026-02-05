import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    completed: '#10b981'
};

const TaskStatusChart = ({ stats }) => {
    const data = [
        { name: 'Pending', value: stats.pending, color: COLORS.pending },
        { name: 'In Progress', value: stats.inProgress, color: COLORS.in_progress },
        { name: 'Completed', value: stats.completed, color: COLORS.completed }
    ].filter(item => item.value > 0); // Only show non-zero values

    if (data.length === 0) {
        return (
            <div className="chart-empty">
                <p>No task data available</p>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <h3 className="chart-title">Task Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TaskStatusChart;
