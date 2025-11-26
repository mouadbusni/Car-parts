"use client";

import React from 'react';
import { Search, Package, ShoppingCart, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const HeroControlPanel = () => {
    return (
        <div className="w-full space-y-6 mb-8">
            {/* Branding Strip */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-bold tracking-tighter text-white">
                        AUTO<span className="text-primary">PRO</span>
                    </h1>
                    <p className="text-muted-foreground tracking-widest uppercase text-sm">
                        Performance Redefined
                    </p>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span>System Operational</span>
                    </div>
                </div>
            </div>

            {/* Quick Search Bar */}
            <div className="relative w-full max-w-3xl mx-auto group">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center bg-card border border-border rounded-lg p-2 shadow-2xl focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-300">
                    <Search className="w-6 h-6 text-muted-foreground ml-3" />
                    <Input
                        type="text"
                        placeholder="Search by part, vehicle, or VIN..."
                        className="border-none bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 h-12"
                    />
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8">
                        SCAN
                    </Button>
                </div>
            </div>

            {/* Live Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <MetricCard
                    icon={<Package className="w-5 h-5 text-neon-blue" />}
                    label="Inventory Count"
                    value="150,000+"
                    trend="+12% this week"
                    color="border-neon-blue/50"
                />
                <MetricCard
                    icon={<ShoppingCart className="w-5 h-5 text-neon-purple" />}
                    label="Active Orders"
                    value="1,248"
                    trend="Processing now"
                    color="border-neon-purple/50"
                />
                <MetricCard
                    icon={<Activity className="w-5 h-5 text-neon-green" />}
                    label="Customer Satisfaction"
                    value="98.5%"
                    trend="Top rated"
                    color="border-neon-green/50"
                />
            </div>
        </div>
    );
};

const MetricCard = ({ icon, label, value, trend, color }: { icon: React.ReactNode, label: string, value: string, trend: string, color: string }) => (
    <Card className={`bg-card/50 backdrop-blur-sm border ${color} p-4 flex items-center justify-between hover:bg-card/80 transition-colors duration-300 group`}>
        <div>
            <p className="text-sm text-muted-foreground group-hover:text-white transition-colors">{label}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
            <p className="text-xs text-primary mt-1">{trend}</p>
        </div>
        <div className="p-3 bg-background/50 rounded-full group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
    </Card>
);
