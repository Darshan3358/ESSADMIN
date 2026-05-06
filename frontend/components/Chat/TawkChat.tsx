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

            s1.onload = () => {
                // @ts-ignore
                if (window.Tawk_API && typeof window.Tawk_API.showWidget === 'function') {
                    // @ts-ignore
                    window.Tawk_API.showWidget();
                }
            };
            
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
        if (!user || !window.Tawk_API) return;

        const visitorName = user.shop_name 
            ? `${user.shop_name} (${user.name || 'Seller'})` 
            : (user.name || 'Seller');

        const visitorData = {
            name: visitorName,
            email: user.email || '',
        };

        // Guard: ensure all required fields are non-null strings
        if (!visitorData.name || !visitorData.email) return;

        // Set visitor object BEFORE script loads (Tawk reads this on init)
        // @ts-ignore
        window.Tawk_API.visitor = visitorData;

        // Always use onLoad to safely set attributes
        // @ts-ignore
        const prevOnLoad = window.Tawk_API.onLoad;
        // @ts-ignore
        window.Tawk_API.onLoad = function () {
            if (typeof prevOnLoad === 'function') prevOnLoad();
            // @ts-ignore
            if (typeof window.Tawk_API.setAttributes === 'function') {
                // @ts-ignore
                window.Tawk_API.setAttributes(visitorData, function (error: unknown) {
                    if (error) console.warn('[TawkChat] setAttributes error:', error);
                });
            }
        };

        // If Tawk is already fully loaded, call setAttributes directly
        // @ts-ignore
        if (typeof window.Tawk_API.setAttributes === 'function' &&
            // @ts-ignore
            typeof window.Tawk_API.getStatus === 'function' && 
            // @ts-ignore
            window.Tawk_API.getStatus() !== 'loading') {
            // @ts-ignore
            window.Tawk_API.setAttributes(visitorData, function (error: unknown) {
                if (error) console.warn('[TawkChat] setAttributes error:', error);
            });
        }
    }, [user]);

    return null;
}
