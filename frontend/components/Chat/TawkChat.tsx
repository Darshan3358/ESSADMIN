'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function TawkChat() {
    const { user } = useAuth();

    useEffect(() => {
        // Tawk.to Initialization
        const initTawk = () => {
            if (window.location.host.includes('nxgridpxcnode91')) return;
            
            // @ts-ignore
            window.Tawk_API = window.Tawk_API || {};
            // @ts-ignore
            window.Tawk_LoadStart = new Date();

            const s1 = document.createElement("script");
            const s0 = document.getElementsByTagName("script")[0];
            s1.async = true;
            s1.src = 'https://embed.tawk.to/68022bc67bc83f19076d0c8d/1ip47m0r4';
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin', '*');
            s0.parentNode?.insertBefore(s1, s0);
        };

        // Delay initialization to improve page load speed
        const timeout = setTimeout(initTawk, 3000);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        // Update User Identity when user object changes
        // @ts-ignore
        if (user && window.Tawk_API) {
            const visitorData = {
                'name': user.shop_name || user.name || 'Seller',
                'email': user.email,
                'shop_name': user.shop_name || 'N/A',
                'shop_logo': user.shop_logo || '',
                'seller_id': user._id
            };

            // Set visitor object for early identification
            // @ts-ignore
            window.Tawk_API.visitor = {
                name: visitorData.name,
                email: visitorData.email
            };

            // @ts-ignore
            window.Tawk_API.onLoad = function() {
                // @ts-ignore
                window.Tawk_API.setAttributes(visitorData, function(error: any) {
                    if (error) console.error('Tawk error:', error);
                });
            };

            // If already loaded, set immediately
            // @ts-ignore
            if (typeof window.Tawk_API.setAttributes === 'function') {
                // @ts-ignore
                window.Tawk_API.setAttributes(visitorData);
            }
        }
    }, [user]);

    return null; // This component doesn't render anything
}
