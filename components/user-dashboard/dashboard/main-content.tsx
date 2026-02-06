"use client"

import { useEffect, useRef } from "react"
import { ModuleCard } from "./module-card"

interface MainContentProps {
  activeTab: "pending" | "completed"
  setActiveTab: (tab: "pending" | "completed") => void
}

const pendingModules = [
  { id: 1, title: "Fatigue Management", hasTraining: true, hasTest: true },
  { id: 2, title: "Journey Management", hasTraining: true, hasTest: true },
  { id: 3, title: "Vehicle Inspection", hasTraining: true, hasTest: false },
]

const completedModules = [
  { id: 1, title: "Defensive Driving", completedDate: "Jan 15, 2024", testScore: "90/100" },
  { id: 2, title: "Hazard Perception", completedDate: "Jan 12, 2024", testScore: "92/100" },
  { id: 3, title: "Emergency Response", completedDate: "Jan 10, 2024", testScore: "85/100" },
  { id: 4, title: "Load Security", completedDate: "Jan 8, 2024", testScore: "88/100" },
  { id: 5, title: "Speed Management", completedDate: "Jan 5, 2024", testScore: "94/100" },
]

export function MainContent({ activeTab, setActiveTab }: MainContentProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    const tabs = tabsRef.current

    if (card) {
      card.style.opacity = "0"
      card.style.transform = "translateY(30px)"
      setTimeout(() => {
        card.style.transition = "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)"
        card.style.opacity = "1"
        card.style.transform = "translateY(0)"
      }, 200)
    }

    if (tabs) {
      tabs.style.opacity = "0"
      tabs.style.transform = "scale(0.9)"
      setTimeout(() => {
        tabs.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
        tabs.style.opacity = "1"
        tabs.style.transform = "scale(1)"
      }, 500)
    }
  }, [])

  return (
    <div 
      ref={cardRef}
      className="rounded-2xl bg-black/30 backdrop-blur-lg border border-[#D4AF37]/40 overflow-hidden"
      style={{ boxShadow: '0 0 30px rgba(212, 175, 55, 0.12), 0 0 60px rgba(212, 175, 55, 0.06), 0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
    >
      {/* Section Header */}
      <div className="px-3 sm:px-4 pt-3 sm:pt-4 flex items-center justify-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
        <span className="text-[#D4AF37] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
          HSSE Modules
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#D4AF37]/30 to-transparent" />
      </div>

      {/* Segmented Tabs */}
      <div className="p-3 sm:p-4 pb-0">
        <div ref={tabsRef} className="flex gap-1 sm:gap-2 p-1 bg-black/40 rounded-full w-fit mx-auto">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === "pending"
                ? "bg-[#2BB5A8] text-black shadow-lg shadow-[#2BB5A8]/30"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === "completed"
                ? "bg-[#2BB5A8] text-black shadow-lg shadow-[#2BB5A8]/30"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Scrollable Module List */}
      <div className="p-3 sm:p-4 max-h-[320px] sm:max-h-[400px] overflow-y-auto custom-scrollbar">
        <div className="space-y-3">
          {activeTab === "pending"
            ? pendingModules.map((module, idx) => (
                <ModuleCard
                  key={module.id}
                  title={module.title}
                  isPending
                  hasTraining={module.hasTraining}
                  hasTest={module.hasTest}
                  index={idx}
                />
              ))
            : completedModules.map((module, idx) => (
                <ModuleCard
                  key={module.id}
                  title={module.title}
                  completedDate={module.completedDate}
                  testScore={module.testScore}
                  index={idx}
                />
              ))}
        </div>
      </div>
    </div>
  )
}
