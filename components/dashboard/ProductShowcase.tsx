"use client";

import React, { useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Heart, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ProductShowcase = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
    const [activeFilter, setActiveFilter] = useState('all');

    const scrollPrev = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const products = [
        {
            id: 1,
            name: 'Titanium Exhaust System',
            category: 'performance',
            price: '$1,299',
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1567863786971-489829674631?auto=format&fit=crop&w=800&q=80',
            specs: ['Lightweight', '+15 HP', 'Deep Tone'],
        },
        {
            id: 2,
            name: 'Carbon Fiber Spoiler',
            category: 'exterior',
            price: '$899',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80',
            specs: ['Aerodynamic', 'Gloss Finish', 'Easy Install'],
        },
        {
            id: 3,
            name: 'Brembo Brake Kit',
            category: 'performance',
            price: '$2,450',
            rating: 5.0,
            image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
            specs: ['6-Piston', 'Ceramic Pads', 'Vented Rotors'],
        },
        {
            id: 4,
            name: 'LED Headlight Assembly',
            category: 'lighting',
            price: '$650',
            rating: 4.7,
            image: 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=800&q=80',
            specs: ['Matrix LED', 'Sequential', 'Plug & Play'],
        },
        {
            id: 5,
            name: 'Turbocharger Kit',
            category: 'performance',
            price: '$3,200',
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1527383418406-f85a3b94637d?auto=format&fit=crop&w=800&q=80',
            specs: ['Twin Scroll', 'Intercooler', 'ECU Tune'],
        },
    ];

    const filteredProducts = activeFilter === 'all'
        ? products
        : products.filter(p => p.category === activeFilter);

    return (
        <div className="w-full mb-16">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Featured Upgrades</h2>
                    <p className="text-muted-foreground">High-performance parts curated for your build.</p>
                </div>

                <Tabs defaultValue="all" className="mt-4 md:mt-0" onValueChange={setActiveFilter}>
                    <TabsList className="bg-card/50 border border-border">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="exterior">Exterior</TabsTrigger>
                        <TabsTrigger value="lighting">Lighting</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="relative group">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex -ml-4">
                        {filteredProducts.map((product) => (
                            <div className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-4 min-w-0" key={product.id}>
                                <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 group/card h-full flex flex-col">
                                    <div className="relative aspect-video overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-700"
                                        />
                                        <Badge className="absolute top-4 right-4 z-20 bg-primary text-primary-foreground font-bold">
                                            {product.category}
                                        </Badge>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-white group-hover/card:text-primary transition-colors">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center text-yellow-500">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="ml-1 text-sm font-medium">{product.rating}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {product.specs.map((spec, i) => (
                                                <span key={i} className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
                                            <span className="text-2xl font-bold text-white">{product.price}</span>
                                            <div className="flex space-x-2">
                                                <Button size="icon" variant="ghost" className="hover:text-primary hover:bg-primary/10">
                                                    <Heart className="w-5 h-5" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="hover:text-primary hover:bg-primary/10">
                                                    <BarChart2 className="w-5 h-5" />
                                                </Button>
                                                <Button size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                                    <ShoppingCart className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm border-border hover:bg-primary hover:text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                    onClick={scrollPrev}
                >
                    <ChevronLeft className="w-6 h-6" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm border-border hover:bg-primary hover:text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                    onClick={scrollNext}
                >
                    <ChevronRight className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
};
