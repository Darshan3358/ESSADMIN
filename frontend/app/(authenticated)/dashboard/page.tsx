'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const UserPerformanceChart = dynamic(() => import('@/components/dashboard/UserPerformanceChart'), { ssr: false });
const FeaturedProductsCarousel = dynamic(() => import('@/components/products/FeaturedProductsCarousel'), { ssr: false });
const StorehouseCarousel = dynamic(() => import('@/components/dashboard/StorehouseCarousel'), { ssr: false });

const AmountReceivablesCard = dynamic(() => import('@/components/dashboard/MetricCard').then(mod => mod.AmountReceivablesCard));
const TotalLifetimeSalesCard = dynamic(() => import('@/components/dashboard/MetricCard').then(mod => mod.TotalLifetimeSalesCard));
const TodaySalesCard = dynamic(() => import('@/components/dashboard/MetricCard').then(mod => mod.TodaySalesCard));
const ThisMonthSalesCard = dynamic(() => import('@/components/dashboard/MetricCard').then(mod => mod.ThisMonthSalesCard));
const LastMonthSalesCard = dynamic(() => import('@/components/dashboard/MetricCard').then(mod => mod.LastMonthSalesCard));
import { ChartDataPoint, DateRange } from '@/types';
import { TrendingUp, Package, Zap, Sparkles, Activity, ArrowUpRight, Globe, CheckCircle2, Heart, Eye, Gem, Shield, Clock, ArrowRight, X, Star, Box, ChevronRight, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user, isLoading: authLoading, updateUser } = useAuth();
    const router = useRouter();

    // Original Stats from DB
    const [stats, setStats] = useState({
        amountReceivables: 0,
        totalLifetimeSales: 0,
        todaySales: 0,
        todayChange: 0,
        thisMonthSales: 0,
        thisMonthChange: 0,
        lastMonthSales: 0,
        netProfit: 0,
        netProfitMargin: 0,
        planName: 'Free Plan',
        productLimit: 0,
        totalProducts: 0,
        remainingProducts: 0,
        views: 0,
        usedViews: 0,
        remainingViews: 0,
        planFeatures: [] as string[],
        categoryCounts: [] as any[]
    });

    const [planDisplayData, setPlanDisplayData] = useState<any>({
        plan_title: 'Loading...',
        used_text: '0',
        remaining_text: '0',
        views_text: '0',
        features: []
    });

    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showHealthModal, setShowHealthModal] = useState(false);



    const mapStats = (dbStats: any) => ({
        totalLifetimeSales: dbStats.totalSales || 0,
        amountReceivables: dbStats.receivables || 0,
        todaySales: dbStats.todaySales || 0,
        thisMonthSales: dbStats.thisMonthSales || 0,
        lastMonthSales: dbStats.lastMonthSales || 0,
        netProfit: dbStats.netProfit || 0,
        netProfitMargin: dbStats.netProfitMargin || 0,
        planName: dbStats.planName || 'Free Plan',
        productLimit: dbStats.productLimit || 0,
        totalProducts: dbStats.totalProducts || 0,
        remainingProducts: dbStats.remainingProducts || 0,
        views: dbStats.views || 0,
        usedViews: dbStats.used_views || 0,
        remainingViews: dbStats.remaining_views || 0,
        planFeatures: dbStats.planFeatures || [],
        categoryCounts: dbStats.categoryCounts || []
    });

    const refetchChartData = async (range: DateRange) => {
        let days = 7;
        if (range === '30days' || range === '1M') days = 30;
        if (range === '6months' || range === '6M') days = 180;
        if (range === '12months' || range === '1Y') days = 365;
        if (range === 'ytd') days = 365; // Handle YTD as 1 year for now

        try {
            const statsRes = await api.get(`/sellers/stats?days=${days}`);
            if (statsRes.success && statsRes.stats) {
                setStats(prev => ({ ...prev, ...mapStats(statsRes.stats) }));
                if (statsRes.stats.chartData) {
                    setChartData(statsRes.stats.chartData);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Fetch original stats from Database
    useEffect(() => {
        const fetchData = async () => {
            if (!user?._id) return;

            setIsLoading(true);
            try {
                // Fetch all data in parallel for maximum speed
                const [statsRes, productsRes] = await Promise.all([
                    api.get('/sellers/stats'),
                    api.get('/products/featured')
                ]);

                // 2. Update Stats
                if (statsRes.success) {
                    const dbStats = statsRes.stats;
                    setStats(prev => ({
                        ...prev,
                        ...mapStats(dbStats)
                    }));
                    if (dbStats.chartData) {
                        setChartData(dbStats.chartData);
                    }
                }

                // 3. Update Featured Products
                if (productsRes.success) {
                    setFeaturedProducts(productsRes.data || []);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user?._id) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id]);

    // Optimized Loading: Show Shell immediately to feel fast
    if (authLoading) return null;
    if (!user) return null;

    return (
        <>
            <div className="space-y-5 sm:space-y-10 pb-10 sm:pb-20 max-w-[1600px] mx-auto transition-all duration-500">


                {/* Hero Welcome Section - Two Separate Cards */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
                    {/* Left: Welcome Banner */}
                    <div className="lg:col-span-7 xl:col-span-8 relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 via-primary-600 to-indigo-700 shadow-[0_20px_50px_rgba(37,99,235,0.25)] p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between group">
                        {/* Ambient Glows */}
                        <div className="absolute top-[-20%] right-[10%] w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-[-20%] left-[10%] w-60 h-60 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>

                        {/* Content Container */}
                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                            {/* Text & Action */}
                            <div className="space-y-4 max-w-xl text-left flex-1">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/15 backdrop-blur-md rounded-full border border-white/20 shadow-inner">
                                    <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white">Live Store Intelligence</span>
                                </div>

                                <div>
                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                                        Hello, <span className="text-yellow-300">{(user.shop_name || user.name || 'DMT').toUpperCase()}</span> !
                                    </h1>
                                    <p className="text-sm sm:text-base text-blue-50/90 font-medium mt-3 leading-relaxed max-w-md">
                                        Welcome back to your dashboard. All systems are online and running smoothly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Store Health Card */}
                    <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 rounded-[2rem] p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 flex flex-col justify-between text-left relative overflow-hidden">
                        {/* Header Row */}
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <span className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">Store Health</span>
                            </div>
                            <span className="text-[11px] font-bold text-[#16a34a] bg-[#eefaf2] px-3 py-1 rounded-full border border-[#dcfce7] flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-[#16a34a] rounded-full animate-pulse"></span>
                                {user.store_status || 'ACTIVE'}
                            </span>
                        </div>

                        {/* Middle: Performance & Gauge */}
                        <div className="grid grid-cols-[1fr_auto] gap-4 items-center my-3">
                            <div>
                                <h4 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                                    {user.store_health ?? 0}%
                                </h4>
                                <p className="text-xs font-semibold text-slate-400 mt-2">Performance</p>
                                <p className="text-sm font-black text-blue-600 dark:text-blue-400 mt-0.5">
                                    {user.store_performance || 'Initial State'}
                                </p>
                            </div>

                            {/* Circular Gauge */}
                            <div
                                onClick={() => setShowHealthModal(true)}
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-blue-100 dark:border-slate-800 flex flex-col items-center justify-center relative shadow-xs cursor-pointer hover:scale-105 transition-transform"
                                title="Click to view health details"
                            >
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                                    <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <span className="text-[9px] font-extrabold text-slate-600 dark:text-slate-300 mt-1">Healthy</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5"></span>
                            </div>
                        </div>

                        {/* Show Detail Button (placed under % as requested) */}
                        <div className="w-full my-1">
                            <button
                                onClick={() => setShowHealthModal(true)}
                                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-[#22c55e] text-[#16a34a] dark:text-[#22c55e] bg-transparent hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 rounded-xl font-bold text-xs transition-all active:scale-95"
                            >
                                <Eye className="w-3.5 h-3.5 text-[#22c55e]" />
                                <span>Show Detail</span>
                            </button>
                        </div>

                        {/* Bottom: 3 Metric Tiles */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            {/* Total Views */}
                            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 flex flex-col items-center text-center">
                                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                    <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Eye className="w-3 h-3" />
                                    </div>
                                    <span className="text-[10px] font-bold">Total Views</span>
                                </div>
                                <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1.5">
                                    {stats.views.toLocaleString()}
                                </p>
                            </div>

                            {/* Orders */}
                            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 flex flex-col items-center text-center">
                                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                    <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <ShoppingCart className="w-3 h-3" />
                                    </div>
                                    <span className="text-[10px] font-bold">Orders</span>
                                </div>
                                <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1.5">
                                    {(stats as any).orders || (stats as any).totalOrders || 0}
                                </p>
                            </div>

                            {/* Response Time */}
                            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 flex flex-col items-center text-center">
                                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                    <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Zap className="w-3 h-3" />
                                    </div>
                                    <span className="text-[10px] font-bold">Response Time</span>
                                </div>
                                <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1.5">
                                    -
                                </p>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Main Stats Grid */}
                <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 animate-slide-up stagger-1">
                    <div className="sm:col-span-2 lg:col-span-2">
                        <AmountReceivablesCard amount={stats.amountReceivables} />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-2">
                        <TotalLifetimeSalesCard amount={stats.totalLifetimeSales} />
                    </div>
                    <div className="col-span-2 sm:col-span-2 sm:col-start-1 md:col-start-auto lg:col-span-1">
                        <TodaySalesCard amount={stats.todaySales} change={stats.todayChange} />
                    </div>
                </section>

                {/* Sub Stats & Net Profit Row */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 animate-slide-up stagger-2">
                    <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-6">
                        <ThisMonthSalesCard amount={stats.thisMonthSales} change={stats.thisMonthChange} />
                        <LastMonthSalesCard amount={stats.lastMonthSales} />
                    </div>

                    <div className="premium-card relative overflow-hidden group/profit min-h-[250px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-success-600 to-emerald-700 group-hover:scale-110 transition-transform duration-700 opacity-95"></div>
                        <div className="relative z-10 p-4 sm:p-6 md:p-8 h-full flex flex-col justify-between text-white text-left">
                            <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0">
                                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-success-200 truncate">Total Net Profit</p>
                                    <h3 className="text-2xl sm:text-4xl md:text-5xl font-black mt-2 leading-none truncate">
                                        ${stats.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                    </h3>
                                </div>
                                <div className="p-3 md:p-4 bg-white/20 rounded-2xl shadow-xl backdrop-blur-md group-hover/profit:rotate-12 transition-transform shrink-0">
                                    <TrendingUp className="w-8 h-8 md:w-10 md:h-10" />
                                </div>
                            </div>

                            <div className="mt-3 md:mt-8 pt-3 md:pt-8 border-t border-white/20">
                                <div className="flex justify-between items-end gap-2 text-left">
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider truncate">Margin Percentage</p>
                                        <p className="text-2xl md:text-3xl font-black text-yellow-300">{stats.netProfitMargin}%</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="flex items-center gap-1 text-success-300 font-bold justify-end">
                                            <ArrowUpRight className="w-4 h-4" />
                                            <span className="text-xs md:text-sm">Active</span>
                                        </div>
                                        <p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-widest font-bold">Data Status</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Plan and Category Split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up stagger-3">
                    {/* Premium Plan Card */}
                    <section className="text-left">
                        <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.2)] transition-all duration-500 h-full" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #EC4899 100%)' }}>
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                            <div className="relative z-10 p-5 md:p-8 flex flex-col h-full">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Current Plan</p>
                                            <p className="text-xs font-bold text-white/70">Premium subscription</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-white bg-white/20 border border-white/30 px-4 py-1.5 rounded-full tracking-[0.15em] backdrop-blur-md uppercase">ACTIVE</span>
                                </div>

                                {/* Central Diamond */}
                                <div className="flex flex-col items-center mb-8">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.2)] border border-white/30 mb-6 relative">
                                        <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl scale-75"></div>
                                        <Gem className="w-10 h-10 text-white drop-shadow-2xl relative z-10" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-md text-center">{stats.planName}</h3>
                                </div>

                                {/* Features List */}
                                <div className="flex flex-wrap justify-center gap-2 mb-6">
                                    {stats.planFeatures && stats.planFeatures.length > 0 ? (
                                        stats.planFeatures.map((f: string, i: number) => (
                                            <span key={i} className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-[10px] font-bold text-white backdrop-blur-md flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3 h-3 text-blue-200" /> {f}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-[10px] font-bold text-white backdrop-blur-md">
                                            Standard Selling Features
                                        </span>
                                    )}
                                </div>

                                {/* UI Elements from Image */}
                                <div className="space-y-6 mt-auto">
                                    <button onClick={() => router.push('/packages')} className="w-full flex items-center justify-center gap-2 py-4 bg-white text-primary-700 rounded-2xl font-black text-sm tracking-uppercase transition-all shadow-xl active:scale-95 shadow-white/10">
                                        Upgrade Level <ArrowRight className="w-4 h-4" />
                                    </button>

                                    <div className="grid grid-cols-2 gap-4 text-center pt-4 border-t border-white/10">
                                        <div>
                                            <p className="text-lg font-black text-white">
                                                {stats.usedViews.toLocaleString()}
                                            </p>
                                            <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-0.5">Total Product Use</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-white">
                                                {stats.remainingViews.toLocaleString()}
                                            </p>
                                            <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-0.5">Remaining</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>                    {/* Products by Category Card */}
                    <section className="text-left">
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] h-full p-6 md:p-10 flex flex-col">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Products by Category</h3>

                            <div className="space-y-6 overflow-y-auto max-h-[450px] pr-2 custom-scrollbar">
                                {stats.categoryCounts && stats.categoryCounts.length > 0 ? (
                                    stats.categoryCounts.sort((a: any, b: any) => b.count - a.count).map((cat: any, i: number) => {
                                        const percentage = Math.round((cat.count / stats.totalProducts) * 100) || 0;
                                        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
                                        const color = colors[i % colors.length];

                                        return (
                                            <div key={i} className="flex flex-col gap-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[15px] font-bold text-slate-700 capitalize">{cat._id || 'Uncategorized'}</span>
                                                    <span className="text-[15px] font-black text-slate-900">{cat.count} ({percentage}%)</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-1000"
                                                        style={{ width: `${percentage}%`, backgroundColor: color }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-40 text-slate-300 gap-3">
                                        <Package className="w-12 h-12 opacity-20" />
                                        <p className="text-sm font-bold">No category data available</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-8 border-t border-slate-50 flex justify-between items-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Inventory</p>
                                <p className="text-2xl font-black text-slate-900">{stats.totalProducts} <span className="text-[10px] font-bold opacity-30">ITEMS</span></p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Analytics Split */}
                {/* Performance & Analytics Section - Full Width */}
                <section className="animate-slide-up stagger-4">
                    <UserPerformanceChart data={chartData} onRangeChange={refetchChartData} />
                </section>

                {/* New Storehouse Discovery Carousel */}
                <section className="animate-slide-up stagger-5">
                    <StorehouseCarousel
                        onProductAdded={async () => {
                            // Refresh featured products when a new product is added to store
                            const productsRes = await api.get('/products/featured');
                            if (productsRes.success) {
                                setFeaturedProducts(productsRes.data || []);
                            }
                        }}
                    />
                </section>

                {/* Additional Analytics Section below Featured Products
                <section className="animate-slide-up stagger-6">
                    <UserPerformanceChart data={chartData} onRangeChange={refetchChartData} />
                </section> */}


                {/* Footer */}
                <footer className="text-center pt-16 mt-16 border-t border-gray-100 dark:border-slate-800">
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-400 dark:text-slate-500">
                            © 2026 <span className="gradient-text font-black tracking-tighter">SmartSeller Pro</span>.
                            All systems operational.
                        </p>
                    </div>
                </footer>
            </div >

            {/* Premium Store Health Detail Modal */}
            {showHealthModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-left">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in"
                        onClick={() => setShowHealthModal(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] overflow-hidden border border-white/20 dark:border-white/10 animate-scale-in">
                        {/* Header Gradient */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-10"></div>

                        <div className="relative p-5 md:p-8 space-y-6 md:space-y-8">
                            {/* Close Button */}
                            <button
                                onClick={() => setShowHealthModal(false)}
                                className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>

                            {/* Header Section */}
                            <div className="flex items-center gap-5 pt-2">
                                <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                                    <Activity className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Store Intelligence</h3>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Granular performance analysis</p>
                                </div>
                            </div>

                            {/* Main Score & Status */}
                            <div className="flex items-center justify-between p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Current Protocol</p>
                                    <h4 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{user.store_health ?? 0}% <span className="text-sm font-bold opacity-40">{user.store_health ? 'OPTIMIZED' : 'INITIAL'}</span></h4>
                                </div>
                                <div className="text-right">
                                    <span className="px-4 py-2 bg-emerald-500 text-white rounded-full text-xs font-black shadow-md">
                                        {user.store_status || 'ACTIVE'}
                                    </span>
                                </div>
                            </div>

                            {/* Detailed Metrics List */}
                            <div className="space-y-4">
                                {[
                                    {
                                        label: 'Order Fulfillment',
                                        value: user.diagnostics?.fulfillment || '0%',
                                        sub: parseInt(user.diagnostics?.fulfillment || '0') >= 90 ? 'Perfect' : (parseInt(user.diagnostics?.fulfillment || '0') > 0 ? 'Improving' : 'Initial State'),
                                        icon: CheckCircle2,
                                        color: 'text-emerald-500'
                                    },
                                    {
                                        label: 'Customer Rating',
                                        value: user.diagnostics?.rating || '0/5',
                                        sub: parseFloat(user.diagnostics?.rating || '0') >= 4.5 ? 'Elite' : (parseFloat(user.diagnostics?.rating || '0') > 0 ? 'Good' : 'Initial State'),
                                        icon: Star,
                                        color: 'text-amber-500'
                                    },
                                    {
                                        label: 'Response Time',
                                        value: user.diagnostics?.responseTime || 'N/A',
                                        sub: user.diagnostics?.responseTime && user.diagnostics.responseTime !== 'N/A' ? 'Active' : 'Initial State',
                                        icon: Clock,
                                        color: 'text-blue-500'
                                    },
                                    {
                                        label: 'Quality Score',
                                        value: user.diagnostics?.qualityScore || '0%',
                                        sub: parseInt(user.diagnostics?.qualityScore || '0') >= 90 ? 'Premium' : (parseInt(user.diagnostics?.qualityScore || '0') > 0 ? 'Standard' : 'Initial State'),
                                        icon: Shield,
                                        color: 'text-blue-500'
                                    }
                                ].map((m, i) => (
                                    <div key={i} className="flex items-center justify-between group p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50 ${m.color}`}>
                                                <m.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{m.label}</p>
                                                <p className="text-[10px] font-bold text-slate-400">{m.sub}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{m.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Action */}
                            <button
                                onClick={() => setShowHealthModal(false)}
                                className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-sm tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-200 dark:shadow-none"
                            >
                                CLOSE ANALYSIS
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style jsx global>{`
                @keyframes float-premium {
                    0%, 100% { transform: translateY(0) scale(1) rotate(0); }
                    50% { transform: translateY(-15px) scale(1.02) rotate(2deg); }
                }
                .animate-float-premium {
                    animation: float-premium 6s ease-in-out infinite;
                }
                @keyframes scale-in {
                    0% { opacity: 0; transform: scale(0.95); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-scale-in {
                    animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </>
    );
}
