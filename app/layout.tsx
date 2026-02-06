import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'
import "./user-globals.css" // ✅ Corrected filename here
import { Toaster } from "sonner";
import { Suspense } from "react";

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
});

export const metadata: Metadata = {
    title: 'ProDriver - Safety Command Center',
    description: 'ProDriver Dashboard',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-[#020617] text-slate-200`}>

                <Suspense fallback={null}>
                    <NextTopLoader
                        color="#14b8a6"
                        initialPosition={0.08}
                        crawlSpeed={200}
                        height={4}
                        crawl={true}
                        showSpinner={false}
                        easing="ease"
                        speed={200}
                        shadow="0 0 10px #14b8a6,0 0 5px #14b8a6"
                        zIndex={99999}
                    />
                </Suspense>

                {children}

                <Suspense fallback={null}>
                    <Toaster position="top-center" richColors />
                </Suspense>

            </body>
        </html>
    )
}