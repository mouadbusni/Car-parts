"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, Globe, Image, Database } from 'lucide-react';

export const AdminTools = () => {
    return (
        <div className="w-full border-t border-border pt-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center">
                    <Settings className="w-6 h-6 mr-2 text-muted-foreground" />
                    Admin Controls
                </h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Admin Mode</span>
                    <Switch defaultChecked />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AdminCard
                    title="Inventory Management"
                    description="Add/edit parts with live preview cards."
                    icon={<Database className="w-6 h-6 text-neon-blue" />}
                    action="Manage Inventory"
                />
                <AdminCard
                    title="Branding Control"
                    description="Update homepage banners and imagery."
                    icon={<Image className="w-6 h-6 text-neon-purple" />}
                    action="Edit Assets"
                />
                <AdminCard
                    title="Global Settings"
                    description="Multilingual toggle and currency settings."
                    icon={<Globe className="w-6 h-6 text-neon-green" />}
                    action="Configure"
                />
            </div>
        </div>
    );
};

const AdminCard = ({ title, description, icon, action }: { title: string, description: string, icon: React.ReactNode, action: string }) => (
    <Card className="bg-card/30 border-dashed border-border hover:border-primary/50 transition-colors duration-300">
        <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-background/50 rounded-lg">
                    {icon}
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                    <Settings className="w-4 h-4" />
                </Button>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{description}</p>
            <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                {action}
            </Button>
        </CardContent>
    </Card>
);
