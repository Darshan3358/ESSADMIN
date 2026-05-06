'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function TawkChat() {
    const { user } = useAuth();
    const scriptLoaded = useRef(false);

    useEffect(() => {
        // Initialize Tawk_API globally
        // @ts-ignore
        window.Tawk_API = window.Tawk_API || {};
        // @ts-ignore
        window.Tawk_LoadStart = new Date();

        const initTawk = () => {
            if (scriptLoaded.current) return;
            
            const s1 = document.createElement("script");
            const s0 = document.getElementsByTagName("script")[0];
            s1.async = true;
            s1.src = 'https://embed.tawk.to/68022bc67bc83f19076d0c8d/1ip47m0r4';
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin', '*');
            
            if (s0 && s0.parentNode) {
                s0.parentNode.insertBefore(s1, s0);
            } else {
                document.head.appendChild(s1);
            }
            scriptLoaded.current = true;
        };

        // Load immediately
        initTawk();
    }, []);

    useEffect(() => {
        // Update User Identity whenever user state changes
        // @ts-ignore
        if (user && window.Tawk_API) {
            const visitorData = {
                'name': user.shop_name || user.name || 'Seller',
                'email': user.email,
                'shop_name': user.shop_name || 'N/A',
                'shop_logo': user.shop_logo || '',
                'seller_id': user._id
            };

            // Set visitor object for identification
            // @ts-ignore
            window.Tawk_API.visitor = {
                name: visitorData.name,
                email: visitorData.email
            };

            // Set attributes if Tawk is already loaded
            // @ts-ignore
            if (typeof window.Tawk_API.setAttributes === 'function') {
                // @ts-ignore
                window.Tawk_API.setAttributes(visitorData);
            } else {
                // Otherwise set it to run onLoad
                // @ts-ignore
                window.Tawk_API.onLoad = function() {
                    // @ts-ignore
                    window.Tawk_API.setAttributes(visitorData);
                };
            }
        }
    }, [user]);

    return null;
}
