'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function TawkChat() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        // 1. Pre-initialize Tawk_API with user info BEFORE the script loads
        // @ts-ignore
        window.Tawk_API = window.Tawk_API || {};
        // @ts-ignore
        window.Tawk_API.visitor = {
            name: user.shop_name || user.name || 'Seller',
            email: user.email
        };

        // 2. Load the script
        const initTawk = () => {
            if (window.location.host.includes('nxgridpxcnode91')) return;
            
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

        // Delay to allow Auth state to settle
        const timeout = setTimeout(initTawk, 2000);

        return () => clearTimeout(timeout);
    }, [user]);

    useEffect(() => {
        // @ts-ignore
        if (user && window.Tawk_API) {
            const visitorData = {
                'name': user.shop_name || user.name || 'Seller',
                'email': user.email,
                'shop_name': user.shop_name || 'N/A',
                'shop_logo': user.shop_logo || '',
                'seller_id': user._id
            };

            // @ts-ignore
            window.Tawk_API.onLoad = function() {
                // @ts-ignore
                window.Tawk_API.setAttributes(visitorData);
            };

            // If already loaded, update attributes immediately
            // @ts-ignore
            if (typeof window.Tawk_API.setAttributes === 'function') {
                // @ts-ignore
                window.Tawk_API.setAttributes(visitorData);
            }
        }
    }, [user]);

    return null;
}
