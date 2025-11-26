"use client";

import React from 'react';
import { ShoppingBag, FileText, LifeBuoy, BarChart2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const NavGrid = () => {
    const navItems = [
        {
            title: 'Products',
            description: 'Browse by category, brand, or performance type.',
            icon: <ShoppingBag className="w-8 h-8 text-neon-blue" />,
            color: 'hover:border-neon-blue/50',
            bg: 'hover:bg-neon-blue/5',
            link: '/products',
        },
        {
            title: 'Orders',
            description: 'Track, manage, and return items.',
            icon: <FileText className="w-8 h-8 text-neon-purple" />,
            color: 'hover:border-neon-purple/50',
            bg: 'hover:bg-neon-purple/5',
            link: '/orders',
        },
        {
            title: 'Support',
            description: 'Direct access to FAQs, live chat, and expert hotline.',
            icon: <LifeBuoy className="w-8 h-8 text-neon-green" />,
            color: 'hover:border-neon-green/50',
            bg: 'hover:bg-neon-green/5',
            link: '/support',
        },
        {
            title: 'Analytics',
            description: 'Sales trends, top-performing parts, customer insights.',
            icon: <BarChart2 className="w-8 h-8 text-neon-red" />,
            color: 'hover:border-neon-red/50',
            bg: 'hover:bg-neon-red/5',
            link: '/analytics',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {navItems.map((item, index) => (
                <Card
                    key={index}
                    className={`group relative overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all duration-500 ${item.color} ${item.bg} hover:-translate-y-1 hover:shadow-2xl`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 pointer-events-none" />

                    <CardHeader className="relative z-10 pb-2">
                        <div className="mb-4 p-3 bg-background/50 rounded-xl w-fit group-hover:scale-110 transition-transform duration-500">
                            {item.icon}
                        </div>
                        <CardTitle className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                            {item.title}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="relative z-10">
                        <p className="text-muted-foreground text-sm mb-6 group-hover:text-gray-300 transition-colors">
                            {item.description}
                        </p>

                        <Button variant="ghost" className="p-0 h-auto text-primary group-hover:translate-x-2 transition-transform duration-300">
                            Access Module <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </CardContent>

                    {/* Decorative background element */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
                </Card>
            ))}
        </div>
    );
};
