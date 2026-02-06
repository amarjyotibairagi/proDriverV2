"use client"

import { useState, useRef } from "react"
import { X, Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2, Table } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getImportPresignedUrl, processUserImport } from "@/app/actions/user-import"
import { toast } from "sonner"

interface CSVImportWizardProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

type Step = 'upload' | 'mapping' | 'preview' | 'processing' | 'complete'

const DATABASE_FIELDS = [
    { key: 'employee_id', label: 'Employee ID', required: true },
    { key: 'full_name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email Address', required: false },
    { key: 'mobile_number', label: 'Mobile Number', required: false },
    { key: 'company', label: 'Company', required: false },
    { key: 'role', label: 'Role (BASIC/ADMIN)', required: false },
    { key: 'department', label: 'Department Name', required: false },
    { key: 'location', label: 'Assigned Location', required: false },
    { key: 'home_location', label: 'Home Depot', required: false },
]

export function CSVImportWizard({ isOpen, onClose, onSuccess }: CSVImportWizardProps) {
    const [step, setStep] = useState<Step>('upload')
    const [file, setFile] = useState<File | null>(null)
    const [headers, setHeaders] = useState<string[]>([])
    const [rawRows, setRawRows] = useState<string[][]>([])
    const [mapping, setMapping] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [importResult, setImportResult] = useState<{ createdCount: number, errors: string[] } | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!isOpen) return null

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv')) {
                toast.error("Please upload a CSV file")
                return
            }
            setFile(selectedFile)
            readCSVHeaders(selectedFile)
        }
    }

    const readCSVHeaders = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result as string
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== "")
            if (lines.length > 0) {
                const headerRow = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
                setHeaders(headerRow)

                const rows = lines.slice(1, 6).map(line =>
                    line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
                )
                setRawRows(rows)

                // Auto-map based on exact or close matches
                const initialMapping: Record<string, string> = {}
                DATABASE_FIELDS.forEach(field => {
                    const match = headerRow.find(h =>
                        h.toLowerCase() === field.key.toLowerCase() ||
                        h.toLowerCase() === field.label.toLowerCase()
                    )
                    if (match) initialMapping[field.key] = match
                })
                setMapping(initialMapping)
            }
        }
        reader.readAsText(file)
    }

    const handleUploadToR2 = async () => {
        if (!file) return
        setLoading(true)

        try {
            const res = await getImportPresignedUrl(file.name, file.type)
            if (res.success && res.url) {
                // Perform actual upload
                const uploadRes = await fetch(res.url, {
                    method: 'PUT',
                    body: file,
                    headers: { 'Content-Type': file.type }
                })

                if (uploadRes.ok) {
                    toast.success("File uploaded to safe storage")
                    setStep('mapping')
                } else {
                    toast.error("R2 Upload failed")
                }
            } else {
                toast.error(res.error || "Failed to get upload URL")
            }
        } catch (error) {
            toast.error("Connectivity error during upload")
        } finally {
            setLoading(false)
        }
    }

    const startImport = async () => {
        setStep('processing')
        setLoading(true)

        try {
            // Read the WHOLE file for processing
            const reader = new FileReader()
            reader.onload = async (e) => {
                const text = e.target?.result as string
                const lines = text.split(/\r?\n/).filter(line => line.trim() !== "")
                const csvHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
                const dataLines = lines.slice(1)

                const mappedData = dataLines.map(line => {
                    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
                    const obj: any = {}
                    DATABASE_FIELDS.forEach(field => {
                        const csvHeader = mapping[field.key]
                        if (csvHeader) {
                            const index = csvHeaders.indexOf(csvHeader)
                            if (index !== -1) obj[field.key] = cols[index]
                        }
                    })
                    return obj
                })

                const result = await processUserImport(mappedData)
                if (result.success) {
                    const res = result as any;
                    setImportResult({ createdCount: res.createdCount, errors: res.errors })
                    setStep('complete')
                    if (onSuccess) onSuccess()
                } else {
                    toast.error(result.error || "Import failed")
                    setStep('mapping')
                }
                setLoading(false)
            }
            reader.readAsText(file!)
        } catch (error) {
            toast.error("Processing error")
            setLoading(false)
            setStep('mapping')
        }
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-4xl bg-[#0f172a]/95 border border-white/10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20">
                            <Upload className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase italic tracking-widest">Import <span className="text-teal-400">Personnel</span></h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Data Pipeline: {step.toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-white transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {/* STEP 1: UPLOAD */}
                        {step === 'upload' && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col items-center justify-center py-20 gap-8"
                            >
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full max-w-lg border-2 border-dashed border-white/10 rounded-[3rem] p-16 flex flex-col items-center justify-center gap-4 hover:border-teal-500/40 hover:bg-teal-500/5 transition-all cursor-pointer group"
                                >
                                    <div className="p-6 rounded-[2rem] bg-slate-900 border border-white/5 group-hover:scale-110 transition-transform">
                                        <FileText className="w-10 h-10 text-slate-500 group-hover:text-teal-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-black text-slate-300 uppercase tracking-widest italic">{file ? file.name : "Select CSV to Synchronize"}</p>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-2">Maximum file size: 10MB</p>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                                </div>

                                {file && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleUploadToR2}
                                        disabled={loading}
                                        className="px-10 py-5 bg-teal-500 text-slate-950 rounded-3xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-teal-500/20 flex items-center gap-3 italic"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                        Initialize Upload
                                    </motion.button>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 2: MAPPING */}
                        {step === 'mapping' && (
                            <motion.div
                                key="mapping"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {DATABASE_FIELDS.map((field) => (
                                        <div key={field.key} className="p-5 bg-black/40 border border-white/5 rounded-3xl flex flex-col gap-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    {field.label}
                                                    {field.required && <span className="text-rose-500">*</span>}
                                                </label>
                                                {mapping[field.key] ? (
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                                                ) : (
                                                    <AlertCircle className="w-3.5 h-3.5 text-slate-700" />
                                                )}
                                            </div>
                                            <select
                                                value={mapping[field.key] || ""}
                                                onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white uppercase italic outline-none focus:border-teal-500/50 appearance-none"
                                            >
                                                <option value="">-- Ignore Field --</option>
                                                {headers.map(h => (
                                                    <option key={h} value={h}>{h}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center bg-white/5 p-6 rounded-[2rem] border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
                                            <Table className="w-4 h-4 text-teal-400" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Sample Verification Pending</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setStep('upload')} className="px-6 py-3 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest">Back</button>
                                        <button
                                            onClick={() => setStep('preview')}
                                            disabled={!mapping.employee_id || !mapping.full_name}
                                            className="px-8 py-4 bg-teal-500 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
                                        >
                                            Next Stage <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: PREVIEW */}
                        {step === 'preview' && (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                <div className="overflow-x-auto rounded-[2rem] border border-white/5 bg-black/40">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 border-b border-white/5">
                                            <tr>
                                                {DATABASE_FIELDS.filter(f => mapping[f.key]).map(f => (
                                                    <th key={f.key} className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">{f.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rawRows.map((row, ridx) => (
                                                <tr key={ridx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                    {DATABASE_FIELDS.filter(f => mapping[f.key]).map(f => {
                                                        const csvIdx = headers.indexOf(mapping[f.key])
                                                        return <td key={f.key} className="px-6 py-4 text-[11px] font-bold text-slate-300 uppercase italic">{row[csvIdx] || "N/A"}</td>
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex items-center gap-4">
                                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                    <p className="text-[10px] text-amber-200/70 font-bold uppercase tracking-widest leading-relaxed">
                                        Verify the mapped data carefully. Employee IDs must be unique. Accounts will be created as <span className="text-amber-400">INACTIVE</span> until a password is set.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <button onClick={() => setStep('mapping')} className="px-6 py-3 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest">Back to Mapping</button>
                                    <button
                                        onClick={startImport}
                                        className="px-10 py-5 bg-teal-500 text-slate-950 rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-teal-500/20 flex items-center gap-3 italic"
                                    >
                                        Execute Batch Sync
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: PROCESSING */}
                        {step === 'processing' && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-32 gap-8"
                            >
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-white/5 border-t-teal-500 animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Table className="w-8 h-8 text-teal-500 animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-black text-white uppercase tracking-widest italic animate-pulse">Synchronizing Data Buffer...</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-3">Writing records to database matrix</p>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: COMPLETE */}
                        {step === 'complete' && (
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-20 gap-10"
                            >
                                <div className="p-8 rounded-[3rem] bg-teal-500/10 border border-teal-500/20 shadow-2xl shadow-teal-500/10 relative">
                                    <CheckCircle2 className="w-16 h-16 text-teal-400" />
                                    <div className="absolute -top-2 -right-2 px-4 py-1.5 bg-teal-500 text-slate-950 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-xl">SUCCESS</div>
                                </div>

                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Batch Synchronization <span className="text-teal-400">Complete</span></h2>
                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.4em]">{importResult?.createdCount} Users successfully registered</p>
                                </div>

                                {importResult?.errors && importResult.errors.length > 0 && (
                                    <div className="w-full max-w-lg bg-rose-500/5 border border-rose-500/10 rounded-[2rem] p-6 max-h-48 overflow-y-auto custom-scrollbar">
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4">Conflict Logs ({importResult.errors.length})</p>
                                        <ul className="space-y-2">
                                            {importResult.errors.map((err, i) => (
                                                <li key={i} className="text-[9px] text-rose-300/50 font-medium font-mono leading-relaxed">{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <button
                                    onClick={onClose}
                                    className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-3xl text-xs font-black uppercase tracking-widest transition-all border border-white/5 italic"
                                >
                                    Return to Command Terminal
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 20px;
                    }
                `}</style>
            </motion.div>
        </div>
    )
}
