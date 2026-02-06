"use client"

import { CheckCircle, Play, FileText } from "lucide-react"


interface ModuleCardProps {
  title: string
  isPending?: boolean
  hasTraining?: boolean
  hasTest?: boolean
  completedDate?: string
  testScore?: string
  index?: number
  moduleId?: number
  lang?: string
  trainingStatus?: string
  testStatus?: string
  moduleContent?: any
}

export function ModuleCard({
  title,
  isPending = false,
  hasTraining = false,
  hasTest = false,
  completedDate,
  testScore,
  index = 0,
  moduleId,
  lang = 'en',
  trainingStatus,
  testStatus,
  moduleContent
}: ModuleCardProps) {
  // 1. Get Localized Title
  const localizedTitle = moduleContent?.translations?.[lang]?.title || title;

  // 2. Status Badge Helper
  const getStatusBadge = () => {
    if (!isPending) return null;

    if (trainingStatus === 'ONGOING' || testStatus === 'ONGOING') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
          In Progress
        </span>
      );
    }
    if (trainingStatus === 'NOT_STARTED') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
          Not Started
        </span>
      );
    }
    return null;
  };

  // ... (animation/hooks if any)

  if (isPending) {
    return (
      <div
        className="bg-gray-100 rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="space-y-1">
            <h3 className="text-gray-900 font-semibold text-sm sm:text-base">{localizedTitle}</h3>
            {getStatusBadge()}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {hasTraining && (
              <a
                href={moduleId ? `/play/${moduleId}?mode=training&lang=${lang}` : '#'}
                className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white text-xs sm:text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg ${trainingStatus === 'COMPLETED'
                  ? 'bg-green-500 hover:bg-green-600 hover:shadow-green-500/30'
                  : 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/30'
                  }`}
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                Training
              </a>
            )}
            {hasTest && (
              <a
                href={moduleId && trainingStatus === 'COMPLETED' ? `/play/${moduleId}?mode=test&lang=${lang}` : '#'}
                onClick={(e) => {
                  if (trainingStatus !== 'COMPLETED') {
                    e.preventDefault();
                    alert("Please complete the Training module first before attempting the Test.");
                  }
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white text-xs sm:text-sm font-bold uppercase tracking-wide transition-all duration-300 ${['PASSED', 'FAILED'].includes(testStatus || '')
                  ? 'bg-green-500 hover:bg-green-600 hover:shadow-green-500/30'
                  : trainingStatus === 'COMPLETED'
                    ? 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/30 hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed opacity-70'
                  }`}
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                Test
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-gray-100 rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="text-gray-900 font-semibold text-sm sm:text-base truncate">{localizedTitle}</h3>
            {completedDate && (
              <p className="text-gray-500 text-[10px] sm:text-xs">Completed {completedDate}</p>
            )}
            {testStatus === 'FAILED' && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-bold uppercase tracking-wider">
                Attempt Failed
              </span>
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
