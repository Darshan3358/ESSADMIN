import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:5001/api/:path*',
            },
            {
                source: '/backend/:path*',
                destination: 'http://localhost:5001/api/:path*',
            },
            {
                source: '/uploads/:path*',
                destination: 'http://localhost:5001/uploads/:path*',
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5001',
                pathname: '/uploads/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'smartseller-backend.vercel.app',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: '*.vercel.app',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: '*.ess-pvt.net',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: '*.ess-pvt.net',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
        ],
    },
    // Ignore ESLint errors during production build
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Ignore TypeScript errors during production build
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
