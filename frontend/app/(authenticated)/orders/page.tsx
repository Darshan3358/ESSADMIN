'use client';

import { useState, useEffect, Suspense } from 'react';
import { ShoppingCart, Search, Filter, MoreHorizontal, Eye, Truck, CheckCircle, Clock, XCircle, Plus, Minus, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslate } from '@/hooks/useTranslate';

function OrdersPageInner() {
    const { t } = useTranslate();
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlKeyword = searchParams?.get('keyword') || searchParams?.get('search') || '';
    const [orders, setOrders] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        counts: {
            all: 0,
            pending: 0,
            delivered: 0,
            cancelled: 0
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState(urlKeyword);
    const [debouncedSearch, setDebouncedSearch] = useState(urlKeyword);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    useEffect(() => {
        setSearchTerm(urlKeyword);
        setDebouncedSearch(urlKeyword);
        setCurrentPage(1);
    }, [urlKeyword]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 250);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const [currentPage, setCurrentPage] = useState(1);
    const ORDERS_PER_PAGE = 8;

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const url = `/orders/myorders?status=${statusFilter}&page=${currentPage}&limit=${ORDERS_PER_PAGE}${debouncedSearch ? `&keyword=${encodeURIComponent(debouncedSearch.trim())}` : ''}`;
                const response = await api.get(url);
                if (response.success) {
                    setOrders(response.orders || []);
                    setStats(response.stats || { counts: { all: 0, pending: 0, delivered: 0, cancelled: 0 } });
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user, statusFilter, debouncedSearch, currentPage]);

    if (authLoading || (!user)) return null;

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t('Orders')}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('Track and manage your customer orders, fulfillment and delivery status')}</p>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: t('All Orders'), count: stats?.counts?.all || 0, icon: ShoppingCart, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/40 border-primary-100 dark:border-primary-900/40' },
                        { label: t('Pending'), count: stats?.counts?.pending || 0, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40' },
                        { label: t('Delivered'), count: stats?.counts?.delivered || 0, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40' },
                        { label: t('Cancelled'), count: stats?.counts?.cancelled || 0, icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/40' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900/80 rounded-2xl p-4 md:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all">
                            <div className={`p-3 rounded-xl border ${stat.bg} shrink-0`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div className="text-left min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">{stat.label}</p>
                                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5">{stat.count}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Orders Card Container */}
                <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                    {/* Search & Status Filters */}
                    <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
                        <div className="relative w-full lg:w-[440px] text-left">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('Search by store, client name, amount, date...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                            {['all', 'pending', 'processing', 'delivered', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${statusFilter === status
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                                        }`}
                                >
                                    {t(status)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── MOBILE TABLE (hidden on md+) ── */}
                    <div className="block md:hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('Order ID')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('Customer')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('Status')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">{t('Action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {isLoading ? (
                                    <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500 text-sm font-medium">{t('Loading orders...')}</td></tr>
                                ) : orders?.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500 text-sm font-medium">{t('No orders found.')}</td></tr>
                                ) : (
                                    (orders || []).map((order) => {
                                        const isExpanded = expandedRows.has(order._id);
                                        const last4 = (order.order_code || '').slice(-6);
                                        const isDelivered = order.status === 'delivered';
                                        const isPending = order.status === 'pending' || order.status === 'processing';
                                        return (
                                            <>
                                                <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                    <td className="px-4 py-3.5">
                                                        <span className="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-md border border-primary-100 dark:border-primary-900/40">
                                                            #{last4}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">{order.customer_name}</p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[120px]">{order.customer_phone || order.customer_email || '—'}</p>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap border ${
                                                            isDelivered
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                                : isPending
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                                                        }`}>
                                                            {t(order.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => router.push(`/orders/${order._id}`)}
                                                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-all"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => toggleRow(order._id)}
                                                                className={`p-1.5 rounded-lg transition-all ${isExpanded ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                                                            >
                                                                {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr key={`${order._id}-expanded`} className="bg-slate-50/70 dark:bg-slate-800/40">
                                                        <td colSpan={4} className="px-4 py-3">
                                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                                <div className="text-left">
                                                                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('Total Amount')}</span>
                                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">${parseFloat(order.order_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                                </div>
                                                                <div className="text-left">
                                                                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('Store / Supplier')}</span>
                                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">{order.supplier_name || 'EssSmart Storehouse'}</p>
                                                                </div>
                                                                <div className="text-left">
                                                                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('Date')}</span>
                                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                                                                        {new Date(order.status === 'delivered' && order.deliveredAt ? order.deliveredAt : order.createdAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                                <div className="text-left">
                                                                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('Pickup')}</span>
                                                                    <p className={`text-xs font-semibold mt-1 ${order.pick_up_status === 'Picked-Up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                                        {order.pick_up_status === 'Unpicked-Up' ? t('Unpicked') : (order.pick_up_status || t('Unpicked'))}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── DESKTOP TABLE (hidden on mobile) ── */}
                    <div className="hidden md:block overflow-x-auto text-left">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('Order ID')}</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('Client Name')}</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('Date')}</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('Amount')}</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('Store / Supplier')}</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('Status')}</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('Pickup')}</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">{t('Loading orders...')}</td>
                                    </tr>
                                ) : orders?.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">{t('No orders found.')}</td>
                                    </tr>
                                ) : (
                                    (orders || []).map((order) => {
                                        const isDelivered = order.status === 'delivered';
                                        const isPending = order.status === 'pending' || order.status === 'processing';
                                        const orderDate = new Date(isDelivered && order.deliveredAt ? order.deliveredAt : order.createdAt);
                                        return (
                                            <tr key={order._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                                                <td className="px-5 py-4">
                                                    <span className="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-md border border-primary-100 dark:border-primary-900/40 whitespace-nowrap">
                                                        #{order.order_code}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">{order.customer_name}</p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[190px]">{order.customer_email || order.customer_phone || '—'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                        {orderDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                        {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
                                                        ${parseFloat(order.order_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                        <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span className="truncate max-w-[180px]">{order.supplier_name || 'EssSmart Storehouse'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap border ${
                                                        isDelivered
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                            : isPending
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                                                    }`}>
                                                        {t(order.status)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border ${
                                                        order.pick_up_status === 'Picked-Up'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                                                    }`}>
                                                        {order.pick_up_status === 'Unpicked-Up' ? t('Unpicked') : (order.pick_up_status || t('Unpicked'))}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => router.push(`/orders/${order._id}`)}
                                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all"
                                                            title={t('View Details')}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="p-4 md:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {t('Showing')} <span className="font-semibold text-slate-800 dark:text-slate-200">{orders.length}</span> {t('of')} <span className="font-semibold text-slate-800 dark:text-slate-200">{stats?.counts?.all || 0}</span> {t('orders')}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-400 transition-all border border-slate-200 dark:border-slate-700"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs">
                                {currentPage}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={orders.length < ORDERS_PER_PAGE || isLoading}
                                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-400 transition-all border border-slate-200 dark:border-slate-700"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function OrdersWrapper() {
    const searchParams = useSearchParams();
    const key = searchParams ? searchParams.toString() : '';
    return <OrdersPageInner key={key} />;
}

export default function OrdersPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <OrdersWrapper />
        </Suspense>
    );
}
