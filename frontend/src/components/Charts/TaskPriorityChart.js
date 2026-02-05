import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const TaskPriorityChart = ({ tasks }) => {
    // Calculate priority distribution
    const priorityCounts = tasks.reduce((acc, task) => {
        const priority = task.priority || 'medium';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
    }, {});

    const data = [
        { name: 'Low', count: priorityCounts.low || 0, fill: '#6b7280' },
        { name: 'Medium', count: priorityCounts.medium || 0, fill: '#f59e0b' },
        { name: 'High', count: priorityCounts.high || 0, fill: '#ef4444' }
    ];

    return (
        <div className="chart-container">
            <h3 className="chart-title">Tasks by Priority</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Number of Tasks">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TaskPriorityChart;
