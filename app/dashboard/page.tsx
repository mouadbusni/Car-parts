import { HeroControlPanel } from '@/components/dashboard/HeroControlPanel';
import { NavGrid } from '@/components/dashboard/NavGrid';
import { ProductShowcase } from '@/components/dashboard/ProductShowcase';
import { PerformanceInsights } from '@/components/dashboard/PerformanceInsights';
import { EngagementHub } from '@/components/dashboard/EngagementHub';
import { AdminTools } from '@/components/dashboard/AdminTools';

export default function DashboardPage() {
    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
            {/* Cinematic Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-pulse-glow" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[128px] animate-pulse-glow delay-1000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
                <HeroControlPanel />
                <NavGrid />
                <ProductShowcase />
                <PerformanceInsights />
                <EngagementHub />
                <AdminTools />
            </div>
        </main>
    );
}
