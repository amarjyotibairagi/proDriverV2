'use client'

import { useEffect } from 'react'

export default function UserError({
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
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-white">
            <h2 className="text-xl font-bold text-teal-500">Dashboard Error</h2>
            <p className="text-slate-400 text-sm">We couldn't load your dashboard data.</p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors text-sm font-bold"
            >
                Retry
            </button>
        </div>
    )
}
