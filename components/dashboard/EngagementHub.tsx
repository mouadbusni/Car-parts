"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Mail, MessageSquare, PlayCircle } from 'lucide-react';

export const EngagementHub = () => {
    const articles = [
        {
            title: 'Stage 2 Tuning Guide',
            category: 'Tutorial',
            image: 'https://images.unsplash.com/photo-1611016186353-9afbb83e5619?auto=format&fit=crop&w=800&q=80',
            readTime: '5 min read',
        },
        {
            title: 'Track Day Essentials',
            category: 'Guide',
            image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
            readTime: '8 min read',
        },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Blog & Tutorials */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Latest from the Garage</h2>
                    <Button variant="link" className="text-primary">View All <ArrowRight className="ml-2 w-4 h-4" /></Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {articles.map((article, index) => (
                        <Card key={index} className="group overflow-hidden bg-card/50 border-border hover:border-primary/50 transition-colors duration-300">
                            <div className="relative aspect-video overflow-hidden">
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 z-10" />
                                <Image
                                    src={article.image}
                                    alt={article.title}
                                    layout="fill"
                                    className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <Badge className="absolute top-4 left-4 z-20 bg-primary text-primary-foreground">
                                    {article.category}
                                </Badge>
                                <div className="absolute bottom-4 left-4 z-20">
                                    <h3 className="text-lg font-bold text-white mb-1">{article.title}</h3>
                                    <span className="text-xs text-gray-300">{article.readTime}</span>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Community & Newsletter */}
            <div className="space-y-6">
                <Card className="bg-gradient-to-br from-card to-card/50 border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center text-white">
                            <MessageSquare className="w-5 h-5 mr-2 text-neon-purple" />
                            Community Spotlight
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3 p-3 bg-background/30 rounded-lg border border-white/5">
                                <div className="relative w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                    <Image
                                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
                                        alt="User"
                                        layout="fill"
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Alex M.</p>
                                    <p className="text-xs text-muted-foreground">&quot;Just installed the Stage 2 kit. The difference is night and day! 🚀&quot;</p>
                                </div>
                            </div>
                            <Button className="w-full variant-outline border-primary/50 text-primary hover:bg-primary/10">
                                Join the Discussion
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center text-white">
                            <Mail className="w-5 h-5 mr-2 text-primary" />
                            Join the Inner Circle
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Get exclusive deals, tuning tips, and early access to new drops.
                        </p>
                        <div className="flex space-x-2">
                            <Input placeholder="Enter your email" className="bg-background/50 border-white/10" />
                            <Button size="icon" className="bg-primary text-primary-foreground">
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
