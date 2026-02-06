"use client"

import { useState } from "react"
import { ModuleCard } from "./module-card"
import { motion, AnimatePresence } from "framer-motion"
import { translations } from "@/lib/languages"

// Define the shape of data coming from your getDriverTrainings action
interface TrainingData {
  id: string
  training_status: string
  test_status: string
  assigned_date: Date | string
  completed_date?: Date | string | null
  marks_obtained?: number | null
  module: {
    id: number
    title: string
    content?: any
    description?: string | null
    total_marks: number
  }
}

interface MainContentProps {
  trainings: any[]
  lang?: string
}

export function MainContent({ trainings, lang = 'en' }: MainContentProps) {
  // We manage the tab state here internally
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending")
  const t = translations[lang] || translations["en"]
  const [filter, setFilter] = useState('')
  // 1. Filter Data based on Status
  // PENDING = 'NOT_STARTED' or 'ONGOING' (or training incomplete OR test incomplete)
  const pendingModules = trainings.filter(t => {
    const isTrainingComplete = t.training_status === 'COMPLETED';
    const isTestComplete = ['PASSED', 'FAILED'].includes(t.test_status);
    return !isTrainingComplete || !isTestComplete;
  })

  // COMPLETED = 'COMPLETED' AND ('PASSED' or 'FAILED')
  const completedModules = trainings.filter(t => {
    const isTrainingComplete = t.training_status === 'COMPLETED';
    const isTestComplete = ['PASSED', 'FAILED'].includes(t.test_status);
    return isTrainingComplete && isTestComplete;
  })

  return (
    <div
      className="rounded-2xl bg-black/30 backdrop-blur-lg border border-[#D4AF37]/40 overflow-hidden"
      style={{ boxShadow: '0 0 30px rgba(212, 175, 55, 0.12), 0 0 60px rgba(212, 175, 55, 0.06), 0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
    >
      {/* Section Header */}
      <div className="px-3 sm:px-4 pt-3 sm:pt-4 flex items-center justify-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
        <span className="text-[#D4AF37] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
          {t.hsseModules || "Training Modules"}
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#D4AF37]/30 to-transparent" />
      </div>

      {/* Segmented Tabs */}
      <div className="p-3 sm:p-4 pb-0">
        <div className="flex gap-1 sm:gap-2 p-1 bg-black/40 rounded-full w-fit mx-auto max-w-full overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === "pending"
              ? "bg-[#2BB5A8] text-black shadow-lg shadow-[#2BB5A8]/30"
              : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
          >
            {t.pending || "Pending"} ({pendingModules.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === "completed"
              ? "bg-[#2BB5A8] text-black shadow-lg shadow-[#2BB5A8]/30"
              : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
          >
            {t.completed || "Completed"} ({completedModules.length})
          </button>
        </div>
      </div>

      {/* Scrollable Module List */}
      <div className="p-3 sm:p-4 max-h-[320px] sm:max-h-[400px] overflow-y-auto custom-scrollbar">
        <div className="space-y-3">

          {/* PENDING VIEW */}
          {activeTab === "pending" && (
            pendingModules.length > 0 ? (
              pendingModules.map((item, idx) => (
                <ModuleCard
                  key={item.id}
                  title={item.module.title}
                  moduleId={item.module.id}
                  isPending
                  trainingStatus={item.training_status}
                  testStatus={item.test_status}
                  moduleContent={item.module.content}
                  // In a real app, determine these based on the module type or DB flag
                  hasTraining={true}
                  hasTest={true}
                  lang={lang}
                  index={idx}
                />
              ))
            ) : (
              <div className="text-center py-8 text-white/30 text-xs uppercase tracking-widest">
                {t.noPendingTraining || "No pending training"}
              </div>
            )
          )}

          {/* COMPLETED VIEW */}
          {activeTab === "completed" && (
            completedModules.length > 0 ? (
              completedModules.map((item, idx) => (
                <ModuleCard
                  key={item.id}
                  title={item.module.title}
                  isPending={false}
                  trainingStatus={item.training_status}
                  testStatus={item.test_status}
                  moduleContent={item.module.content}
                  lang={lang}
                  // Format the DB Date
                  completedDate={item.completed_date
                    ? new Date(item.completed_date).toLocaleDateString(lang === 'ar' ? 'ar-QA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : "Completed"
                  }
                  // Show Score if it exists, else default
                  testScore={item.marks_obtained !== null ? `${item.marks_obtained}/${item.module.total_marks}` : undefined}
                  index={idx}
                />
              ))
            ) : (
              <div className="text-center py-8 text-white/30 text-xs uppercase tracking-widest">
                {t.noCompletedHistory || "No completed history"}
              </div>
            )
          )}

        </div>
      </div>
    </div>
  )
}