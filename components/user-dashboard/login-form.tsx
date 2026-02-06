"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LANGUAGES, translations } from "@/lib/languages"
import { Eye, EyeOff, ShieldCheck, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { loginUser, registerUser, setLanguageCookie } from "@/app/actions/auth"
import { getUserDetailsForSignup } from "@/app/actions/user"
import { getSignupOptions } from "@/app/actions/signup-options"

// --- Input Component ---
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    isRtl: boolean;
}

const InputField = ({ isRtl, className, ...props }: InputFieldProps) => (
    <div className="relative group/input">
        <input
            className={`w-full h-[55px] sm:h-[65px] px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:bg-teal-500/[0.03] transition-all duration-300 tracking-widest text-sm italic ${isRtl ? "text-right" : "text-left"
                } ${className || ""}`}
            dir={isRtl ? "rtl" : "ltr"}
            {...props}
        />
        {/* Input Focus Glow */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
    </div>
)

// --- Main Form Component ---
export function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Language Logic
    const langCode = searchParams.get("lang") || "en"
    const t = translations[langCode] || translations["en"]
    const currentLang = LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0]
    const isRtl = currentLang.dir === "rtl"

    // UI States
    const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
    const [status, setStatus] = useState<"idle" | "loading">("idle")
    const [isRedirecting, setIsRedirecting] = useState(false)
    const [serverError, setServerError] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showActiveUserModal, setShowActiveUserModal] = useState(false) // NEW State

    // Form States
    const [loginId, setLoginId] = useState("")
    const [loginPass, setLoginPass] = useState("")

    const [signupData, setSignupData] = useState({
        id: "",
        company: "Mowasalat",
        designation: "",
        customDesignation: "", // Keeping for potentially handling 'Others' later, currently unused backend-wise for creation validation
        depot: "",
        assignedArea: "",
        name: "",
        email: "",
        mobile: "",
        pass: "",
        confirm: "",
    })

    // Dropdown Data
    const [options, setOptions] = useState<{
        designations: { id: string, name: string }[],
        depots: { id: string, name: string }[], // Home Locations
        assignedLocations: { id: string, name: string }[] // Assigned Locations
    }>({
        designations: [],
        depots: [],
        assignedLocations: []
    })

    const [showIdInfo, setShowIdInfo] = useState(false)
    const [showCompanyInfo, setShowCompanyInfo] = useState(false)

    // --- Effects ---
    useEffect(() => {
        const fetchOptions = async () => {
            const res = await getSignupOptions()
            if (res.success) {
                setOptions({
                    designations: res.designations,
                    depots: res.depots,
                    assignedLocations: res.assignedLocations
                })
            }
        }
        fetchOptions()
    }, [])

    // New Autofill Effect
    useEffect(() => {
        const checkUser = setTimeout(async () => {
            if (activeTab === 'signup' && signupData.id.length >= 4) {
                const res = await getUserDetailsForSignup(signupData.id)
                if (res.success && typeof res.isActive !== 'undefined') {
                    if (res.isActive) {
                        setShowActiveUserModal(true)
                        return // Stop autofill if active
                    }
                }

                if (res.success && res.user) {
                    setSignupData(prev => ({
                        ...prev,
                        name: res.user?.full_name || prev.name,
                        email: res.user?.email || prev.email,
                        mobile: res.user?.mobile_number || prev.mobile,
                        company: res.user?.company || prev.company,
                        // Only map if IDs exist in our options (optional safety, but direct ID map is fine usually)
                        designation: res.user?.designation_id || prev.designation,
                        depot: res.user?.home_location_id || prev.depot,
                        assignedArea: res.user?.assigned_location_id || prev.assignedArea,
                    }))
                }
            }
        }, 800) // 800ms debounce

        return () => clearTimeout(checkUser)
    }, [signupData.id, activeTab])

    // --- Logic ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setServerError("")
        setStatus("loading")

        try {
            if (activeTab === "login") {
                // Validation
                if (!loginId || !loginPass) {
                    throw new Error(t.error || "Please enter ID and Password")
                }

                // Server Action
                await setLanguageCookie(langCode); // Persist language
                const result = await loginUser(loginId, loginPass)

                if (!result.success) {
                    throw new Error(result.error || "Invalid Credentials")
                }

                // --- SUCCESS: Trigger Loader ---
                setIsRedirecting(true)

                if (result.role === "ADMIN") {
                    router.push("/admin")
                } else {
                    router.push(`/dashboard?lang=${langCode}`)
                }

            } else {
                // Signup Logic
                if (!signupData.id || !signupData.name || !signupData.pass || !signupData.company || !signupData.designation || !signupData.depot || !signupData.email || !signupData.assignedArea) {
                    throw new Error(t.errMissingFields || "Fill all fields")
                }
                if (signupData.pass !== signupData.confirm) {
                    throw new Error(t.errPassMismatch || "Passwords match error")
                }

                const result = await registerUser({
                    id: signupData.id,
                    name: signupData.name,
                    company: signupData.company,
                    designation: signupData.designation,
                    depot: signupData.depot,
                    assignedArea: signupData.assignedArea,
                    email: signupData.email,
                    mobile: signupData.mobile,
                    pass: signupData.pass
                })

                if (!result.success) {
                    throw new Error(result.error || "Registration failed")
                }

                alert(t.alertAccountCreated || "Account Created! Please Login.")

                // Auto login success
                setIsRedirecting(true)
                router.push(`/dashboard?lang=${langCode}`)
            }
        } catch (err: any) {
            setServerError(err.message)
            setStatus("idle")
            setIsRedirecting(false)
        }
    }

    // Helper to check for "Others" designation
    const isOtherDesignation = options.designations.find(d => d.id === signupData.designation)?.name === "Others"

    // --- 1. RENDER: LOADER SCREEN (If Redirecting) ---
    if (isRedirecting) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
                <div className="flex flex-col items-center justify-center p-12 text-center">
                    {/* Shield Icon Pulse */}
                    <div className="relative mb-8">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-teal-500 blur-2xl rounded-full"
                        />
                        <div className="relative z-10 p-5 rounded-2xl bg-[#0f172a] border border-teal-500/20 shadow-2xl">
                            <ShieldCheck className="w-12 h-12 text-teal-500 animate-pulse" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">
                        {t.loginSuccessful || "Login Successful"}
                    </h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-8">
                        {t.redirecting || "Accessing Dashboard..."}
                    </p>

                    {/* Professional Spinner */}
                    <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-teal-500 animate-spin" />
                </div>
            </div>
        )
    }

    // --- 2. RENDER: LOGIN FORM (Normal State) ---
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Premium Tabs */}
            <div className="flex h-16 sm:h-20 border-b border-white/5 flex-shrink-0 relative overflow-hidden bg-black/20">
                <button
                    onClick={() => { setActiveTab("login"); setServerError("") }}
                    className={`flex-1 font-black text-[11px] tracking-[0.4em] uppercase transition-all duration-500 relative z-10 italic ${activeTab === "login" ? "text-teal-400" : "text-slate-500 hover:text-slate-300"
                        }`}
                >
                    {activeTab === "login" && (
                        <motion.div layoutId="authTab" className="absolute inset-x-0 bottom-0 h-1 bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]" />
                    )}
                    {t.login || "LOGIN"}
                </button>
                <button
                    onClick={() => { setActiveTab("signup"); setServerError("") }}
                    className={`flex-1 font-black text-[11px] tracking-[0.4em] uppercase transition-all duration-500 relative z-10 italic ${activeTab === "signup" ? "text-teal-400" : "text-slate-500 hover:text-slate-300"
                        }`}
                >
                    {activeTab === "signup" && (
                        <motion.div layoutId="authTab" className="absolute inset-x-0 bottom-0 h-1 bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]" />
                    )}
                    {t.signup || "SIGN UP"}
                </button>
            </div>

            {/* Form Fields Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/40 p-6">
                <form id="auth-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {activeTab === "login" ? (
                        <>
                            <InputField
                                isRtl={isRtl}
                                placeholder={t.empNum || "Employee ID"}
                                value={loginId}
                                className="uppercase"
                                onChange={(e) => setLoginId(e.target.value.toUpperCase())}
                            />
                            <div className="relative">
                                <InputField
                                    isRtl={isRtl}
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t.pass || "Password"}
                                    value={loginPass}
                                    onChange={(e) => setLoginPass(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute top-1/2 -translate-y-1/2 text-white/40 hover:text-[#2BB5A8] ${isRtl ? "left-4" : "right-4"
                                        }`}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="text-[#2BB5A8] text-xs font-black uppercase hover:underline text-center mt-2"
                            >
                                {t.forgot || "Forgot Password?"}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Signup Inputs */}
                            <div className="relative group">
                                <label className="text-[#2BB5A8] text-xs font-bold mb-1 block">
                                    {t.lblId || "Employee ID / Qatar ID"}
                                </label>
                                <InputField
                                    isRtl={isRtl}
                                    placeholder={t.lblId || "ID"}
                                    value={signupData.id}
                                    className="uppercase"
                                    onChange={(e) => setSignupData({ ...signupData, id: e.target.value.toUpperCase() })}
                                    onFocus={() => setShowIdInfo(true)}
                                    onBlur={() => setShowIdInfo(false)}
                                />
                                {showIdInfo && (
                                    <div className="absolute top-full mt-2 left-0 w-full bg-slate-900 border border-teal-500/30 p-4 rounded-2xl shadow-2xl z-[100] text-[10px] animate-in fade-in slide-in-from-top-4 backdrop-blur-3xl">
                                        <p className="text-teal-400 font-black mb-3 italic tracking-widest uppercase">{t.instrTitle}</p>
                                        <div className="space-y-4">
                                            <div>
                                                <span className="text-white font-black block mb-1 uppercase tracking-wider">{t.instrStaffTitle}</span>
                                                <span className="text-slate-500 italic font-bold leading-relaxed">{t.instrStaffText}</span>
                                            </div>
                                            <div className="pt-2 border-t border-white/5">
                                                <span className="text-white font-black block mb-1 uppercase tracking-wider">{t.instrOthersTitle}</span>
                                                <span className="text-slate-500 italic font-bold leading-relaxed">{t.instrOthersText}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative group">
                                <label className="text-[#2BB5A8] text-xs font-bold mb-1 block">
                                    {t.phCompany || "Company"}
                                </label>
                                <div className="relative">
                                    <select
                                        value={signupData.company === "Mowasalat" ? "Mowasalat" : (signupData.company ? "Others" : "")}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === "Mowasalat") {
                                                setSignupData({ ...signupData, company: "Mowasalat" });
                                            } else {
                                                setSignupData({ ...signupData, company: "" });
                                            }
                                        }}
                                        className={`w-full h-[55px] sm:h-[65px] px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500/50 outline-none text-[11px] font-black uppercase tracking-widest italic appearance-none transition-all ${signupData.company ? "text-white bg-teal-500/[0.03]" : "text-slate-600"
                                            } ${isRtl ? "text-right" : "text-left"}`}
                                        dir={isRtl ? "rtl" : "ltr"}
                                    >
                                        <option value="" disabled className="bg-slate-900">{t.phSelectCompany || "Select Company"}</option>
                                        <option value="Mowasalat" className="bg-slate-900 text-white">Mowasalat</option>
                                        <option value="Others" className="bg-slate-900 text-white">{t.phOthersSpecify || "Others (Specify)"}</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                                {signupData.company !== "Mowasalat" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="mt-3"
                                    >
                                        <InputField
                                            isRtl={isRtl}
                                            value={signupData.company === "Mowasalat" ? "" : signupData.company}
                                            placeholder={t.phEnterCompanyName || "Enter Company Name"}
                                            className="uppercase"
                                            onChange={(e) => setSignupData({ ...signupData, company: e.target.value })}
                                            onFocus={() => setShowCompanyInfo(true)}
                                            onBlur={() => setShowCompanyInfo(false)}
                                        />
                                    </motion.div>
                                )}
                                {showCompanyInfo && (
                                    <div className="absolute top-full mt-2 left-0 w-full bg-slate-900 border border-teal-500/30 p-2 rounded-xl text-[10px] text-teal-400 font-bold z-20 animate-in fade-in slide-in-from-top-2 italic uppercase">
                                        {t.companyInstr || "Specify your organization node"}
                                    </div>
                                )}
                            </div>

                            {/* Dropdowns */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Designation */}
                                <div className="relative">
                                    <select
                                        value={signupData.designation}
                                        onChange={(e) => setSignupData({ ...signupData, designation: e.target.value })}
                                        className={`w-full h-[55px] sm:h-[65px] px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500/50 outline-none text-[11px] font-black uppercase tracking-widest italic appearance-none transition-all ${signupData.designation ? "text-white bg-teal-500/[0.03]" : "text-slate-600"
                                            } ${isRtl ? "text-right" : "text-left"}`}
                                        dir={isRtl ? "rtl" : "ltr"}
                                    >
                                        <option value="" disabled className="bg-slate-900">{t.phDesignation || "Designation"}</option>
                                        {options.designations.map(d => (
                                            <option key={d.id} value={d.id} className="bg-slate-900 text-white">{d.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>

                                {/* Depot (Home Location) */}
                                <div className="relative">
                                    <select
                                        value={signupData.depot}
                                        onChange={(e) => setSignupData({ ...signupData, depot: e.target.value })}
                                        className={`w-full h-[55px] sm:h-[65px] px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500/50 outline-none text-[11px] font-black uppercase tracking-widest italic appearance-none transition-all ${signupData.depot ? "text-white bg-teal-500/[0.03]" : "text-slate-600"
                                            } ${isRtl ? "text-right" : "text-left"}`}
                                        dir={isRtl ? "rtl" : "ltr"}
                                    >
                                        <option value="" disabled className="bg-slate-900">{t.phDepot || "Home Location"}</option>
                                        {options.depots.map(d => (
                                            <option key={d.id} value={d.id} className="bg-slate-900 text-white">{d.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                            </div>

                            {/* Assigned Area Dropdown - FULL WIDTH */}
                            <div className="relative">
                                <select
                                    value={signupData.assignedArea}
                                    onChange={(e) => setSignupData({ ...signupData, assignedArea: e.target.value })}
                                    className={`w-full h-[55px] sm:h-[65px] px-6 rounded-2xl bg-white/5 border border-white/10 focus:border-teal-500/50 outline-none text-[11px] font-black uppercase tracking-widest italic appearance-none transition-all ${signupData.assignedArea ? "text-white bg-teal-500/[0.03]" : "text-slate-600"
                                        } ${isRtl ? "text-right" : "text-left"}`}
                                    dir={isRtl ? "rtl" : "ltr"}
                                >
                                    <option value="" disabled className="bg-slate-900">{t.phAssignedArea || "Assigned Area"}</option>
                                    {options.assignedLocations.map(d => (
                                        <option key={d.id} value={d.id} className="bg-slate-900 text-white">{d.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                                    <ChevronRight className="w-4 h-4 rotate-90" />
                                </div>
                            </div>

                            {isOtherDesignation && (
                                <InputField
                                    isRtl={isRtl}
                                    placeholder={t.phCustomDesignation || "Enter Designation"}
                                    value={signupData.customDesignation}
                                    className="uppercase"
                                    onChange={(e) => setSignupData({ ...signupData, customDesignation: e.target.value })}
                                />
                            )}

                            <InputField
                                isRtl={isRtl}
                                placeholder={t.empName || "Full Name"}
                                value={signupData.name}
                                className="uppercase"
                                onChange={(e) => setSignupData({ ...signupData, name: e.target.value.toUpperCase() })}
                            />

                            {/* NEW: Email Field */}
                            <InputField
                                isRtl={isRtl}
                                placeholder={t.phEmail || "Email Address"}
                                type="email"
                                value={signupData.email}
                                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                            />

                            <InputField
                                isRtl={isRtl}
                                placeholder={t.mobile || "Mobile"}
                                type="tel"
                                value={signupData.mobile}
                                onChange={(e) => setSignupData({ ...signupData, mobile: e.target.value })}
                            />
                            <InputField
                                isRtl={isRtl}
                                placeholder={t.pass || "Password"}
                                type="password"
                                value={signupData.pass}
                                onChange={(e) => setSignupData({ ...signupData, pass: e.target.value })}
                            />
                            <InputField
                                isRtl={isRtl}
                                placeholder={t.confirmPass || "Confirm"}
                                type="password"
                                value={signupData.confirm}
                                onChange={(e) => setSignupData({ ...signupData, confirm: e.target.value })}
                            />
                        </>
                    )}

                    {serverError && (
                        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-xs font-bold text-center">
                            ⚠ {serverError}
                        </div>
                    )}
                </form>
            </div>

            {/* Footer Action */}
            <div className="p-10 pt-4 flex flex-col items-center gap-6 bg-black/40 border-t border-white/5 rounded-b-[2.2rem]">
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={status === "loading" || isRedirecting}
                    className={`w-full group relative overflow-hidden py-5 rounded-[2rem] font-black text-sm tracking-[0.5em] uppercase transition-all duration-500 ${status === "loading" || isRedirecting
                        ? "bg-white/5 text-slate-700 cursor-wait"
                        : "bg-slate-100 text-slate-950 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]"
                        }`}
                >
                    <div className="relative z-10 italic">
                        {status === "loading" || isRedirecting ? (t.btnWait || "WAIT...") : (activeTab === "login" ? (t.btnLogin || "Start Training") : (t.btnSignup || "Create Account"))}
                    </div>
                    {status !== "loading" && !isRedirecting && (
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}
                </motion.button>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">
                    {t.plzLoginDashboard || "Please login to access your dashboard"}
                </p>
            </div>

            {/* Active User Modal */}
            <AnimatePresence>
                {showActiveUserModal && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                            onClick={() => setShowActiveUserModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-slate-900 border border-teal-500/30 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
                        >
                            <div className="bg-teal-500/20 py-4 text-center border-b border-white/5">
                                <span className="text-teal-400 font-black uppercase tracking-[0.2em] text-[10px] italic">User Already Exists</span>
                            </div>
                            <div className="p-10 text-center space-y-6">
                                <p className="text-white font-bold text-sm uppercase leading-relaxed italic">
                                    This Employee ID is already active and operational.
                                </p>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                    Please login with your password.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setShowActiveUserModal(false)
                                        setActiveTab("login")
                                        setLoginId(signupData.id) // Pre-fill login ID
                                    }}
                                    className="w-full py-4 bg-teal-500 text-slate-950 font-black rounded-2xl hover:bg-teal-400 transition-colors uppercase text-[11px] tracking-[0.4em] italic shadow-lg shadow-teal-500/20"
                                >
                                    Login Now
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Support Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
                        >
                            <div className="bg-teal-500/20 py-4 text-center border-b border-white/5">
                                <span className="text-teal-400 font-black uppercase tracking-[0.4em] text-[10px] italic">{t.forgot}</span>
                            </div>
                            <div className="p-10 text-center space-y-6">
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed italic">{t.contactSupport || "Contact Support"}</p>
                                <a href="https://wa.me/97466700820" target="_blank" className="block text-white text-2xl font-black italic tracking-tighter hover:text-teal-400 transition-colors">+974 66700820</a>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowModal(false)}
                                    className="w-full py-4 bg-white/5 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-colors uppercase text-[10px] tracking-[0.4em] italic border border-white/5"
                                >
                                    {t.cancel || "Cancel"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}