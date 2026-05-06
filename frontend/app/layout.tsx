import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "EssSmartSeller - Smart E-Commerce Management Platform",
    description: "Comprehensive e-commerce management system with sales analytics, supplier management, and store health monitoring",
    keywords: "e-commerce, sales analytics, supplier management, store health, dashboard",
};

import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    const user = JSON.parse(sessionStorage.getItem('user'));
                                    if (user && user.settings && user.settings.theme === 'dark') {
                                        document.documentElement.classList.add('dark');
                                    } else {
                                        document.documentElement.classList.remove('dark');
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body className="antialiased font-outfit" suppressHydrationWarning>
                <AuthProvider>
                    <LanguageProvider>
                        <Toaster position="top-right" />
                        {children}
                    </LanguageProvider>
                </AuthProvider>
                <Script id="tawk-to" strategy="lazyOnload">
                    {`
                        setTimeout(function(){
                            (function(){
                                if (window.location.host.includes('nxgridpxcnode91')) return;
                                var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                                s1.async=true;
                                s1.src='https://embed.tawk.to/68022bc67bc83f19076d0c8d/1ip47m0r4';
                                s1.charset='UTF-8';
                                s1.setAttribute('crossorigin','*');
                                s0.parentNode.insertBefore(s1,s0);
                            })();
                        }, 3000);
                    `}
                </Script>
            </body>
        </html>
    );
}
