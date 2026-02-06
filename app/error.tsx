'use client'

import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <html>
            <body className="bg-slate-950 text-white flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-red-500">Something went wrong!</h2>
                    <p className="text-slate-400">Application encountered a critical error.</p>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    )
}
