"use client"

import { CheckCircle, Play, FileText } from "lucide-react"
import { useEffect, useRef } from "react"

interface ModuleCardProps {
  title: string
  isPending?: boolean
  hasTraining?: boolean
  hasTest?: boolean
  completedDate?: string
  testScore?: string
  index?: number
}

export function ModuleCard({
  title,
  isPending = false,
  hasTraining = false,
  hasTest = false,
  completedDate,
  testScore,
  index = 0,
}: ModuleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    // Staggered fade-in animation
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"
    
    const timeout = setTimeout(() => {
      card.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
      card.style.opacity = "1"
      card.style.transform = "translateY(0)"
    }, index * 100)

    return () => clearTimeout(timeout)
  }, [index])

  if (isPending) {
    return (
      <div 
        ref={cardRef}
        className="bg-gray-100 rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <h3 className="text-gray-900 font-semibold text-sm sm:text-base">{title}</h3>
          <div className="flex gap-2 flex-shrink-0">
            {hasTraining && (
              <button className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30">
                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                Training
              </button>
            )}
            {hasTest && (
              <button className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                Test
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={cardRef}
      className="bg-gray-100 rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="text-gray-900 font-semibold text-sm sm:text-base truncate">{title}</h3>
            {completedDate && (
              <p className="text-gray-500 text-xs sm:text-sm">Completed {completedDate}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-500 text-white text-xs sm:text-sm font-bold uppercase tracking-wide">
            <Play className="w-3 h-3 sm:w-4 sm:h-4" />
            Done
          </div>
          {testScore && (
            <div className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-500 text-white text-xs sm:text-sm font-bold uppercase tracking-wide">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              {testScore}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
