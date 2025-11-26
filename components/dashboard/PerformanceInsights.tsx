"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, AlertTriangle, CheckCircle } from 'lucide-react';

const salesData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 2000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
    { name: 'Jul', sales: 3490 },
];

const categoryData = [
    { name: 'Performance', value: 400, color: '#00f3ff' },
    { name: 'Exterior', value: 300, color: '#00ff9d' },
    { name: 'Lighting', value: 300, color: '#bc13fe' },
    { name: 'Interior', value: 200, color: '#ff003c' },
];

export const PerformanceInsights = () => {
    return (
        <div className="w-full mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Performance Insights</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <KPICard
                    title="Total Revenue"
                    value="$124,500"
                    trend="+15.2%"
                    icon={<TrendingUp className="w-5 h-5 text-neon-blue" />}
                    color="border-neon-blue/20"
                />
                <KPICard
                    title="New Customers"
                    value="1,429"
                    trend="+8.1%"
                    icon={<Users className="w-5 h-5 text-neon-green" />}
                    color="border-neon-green/20"
                />
                <KPICard
                    title="Warranty Claims"
                    value="12"
                    trend="-2.5%"
                    icon={<AlertTriangle className="w-5 h-5 text-neon-red" />}
                    color="border-neon-red/20"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader>
                        <CardTitle className="text-white">Sales Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="name" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#00f3ff" fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader>
                        <CardTitle className="text-white">Category Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            {categoryData.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm text-muted-foreground">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, trend, icon, color }: { title: string, value: string, trend: string, icon: React.ReactNode, color: string }) => (
    <Card className={`bg-card/50 backdrop-blur-sm border ${color} p-6`}>
        <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground font-medium">{title}</span>
            <div className="p-2 bg-background/50 rounded-lg">
                {icon}
            </div>
        </div>
        <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white">{value}</h3>
            <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-neon-green' : 'text-neon-red'}`}>
                {trend}
            </span>
        </div>
    </Card>
);
