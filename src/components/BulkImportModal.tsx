'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { bulkImportLeads } from '@/app/actions/bulk-import'
import { FileSpreadsheet, Upload, Download, X, Check, Loader2, AlertCircle } from 'lucide-react'

export function BulkImportModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [fileName, setFileName] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [resultSummary, setResultSummary] = useState<any | null>(null)

  if (!isOpen) return null

  // Generate & Download sample Excel template
  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        'Full Name': 'Rahim Ahmed',
        'Email': 'rahim.ahmed@example.com',
        'Phone': '+8801700000000',
        'Last Study Level': 'HSC',
        'Preferred Country': 'United Kingdom',
        'Preferred Course': 'Computer Science',
        'Preferred Intake': 'Fall 2026',
        'English Test Type': 'IELTS',
        'English Test Score': '6.5',
        'Source': 'Facebook Ad',
        'Event Tag': 'DhakaExpo2026',
        'Notes': 'Interested in partial scholarships.',
      },
      {
        'Full Name': 'Nusrat Jahan',
        'Email': 'nusrat.jahan@example.com',
        'Phone': '+8801800000000',
        'Last Study Level': 'Bachelors',
        'Preferred Country': 'Canada',
        'Preferred Course': 'MBA',
        'Preferred Intake': 'Spring 2027',
        'English Test Type': 'PTE',
        'English Test Score': '62',
        'Source': 'Walk-in',
        'Event Tag': 'SylhetFair2026',
        'Notes': 'Needs assistance with SOP formatting.',
      },
    ]

    const worksheet = XLSX.utils.json_to_sheet(sampleData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample_Leads')
    XLSX.writeFile(workbook, 'AbroadSync_Sample_Leads.xlsx')
  }

  // Handle file select & parse
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setErrorMsg(null)
    setResultSummary(null)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheet]
        const rows = XLSX.utils.sheet_to_json(worksheet)

        if (rows.length === 0) {
          setErrorMsg('Uploaded sheet is empty.')
          setParsedRows([])
        } else {
          setParsedRows(rows)
        }
      } catch (err: any) {
        setErrorMsg('Failed to parse Excel file: ' + err.message)
        setParsedRows([])
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // Submit bulk import
  const handleImport = async () => {
    if (parsedRows.length === 0) return
    setIsUploading(true)
    setErrorMsg(null)

    const res = await bulkImportLeads(parsedRows)
    setIsUploading(false)

    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setResultSummary(res)
      if (onSuccess) onSuccess()
    }
  }

  const resetModal = () => {
    setParsedRows([])
    setFileName('')
    setErrorMsg(null)
    setResultSummary(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-[#1E1E1E] text-gray-200 rounded-3xl max-w-3xl w-full p-8 relative shadow-2xl border border-[#3C3C3C]">
        <button
          onClick={resetModal}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#252526] text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#0E639C]/20 text-[#007ACC] flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-display">Bulk Import Leads from Excel</h3>
            <p className="text-xs text-gray-400">Upload `.xlsx`, `.xls`, or `.csv` sheets to batch import student records.</p>
          </div>
        </div>

        {/* Action Header: Download Template & File Input */}
        <div className="my-6 p-4 rounded-2xl bg-[#252526] border border-[#3C3C3C] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-300">
            <span className="font-semibold text-white block mb-0.5">Need a formatted template?</span>
            <span>Download our sample Excel layout with standard lead column headers.</span>
          </div>

          <button
            type="button"
            onClick={downloadSampleTemplate}
            className="px-4 py-2 rounded-xl bg-[#3C3C3C] hover:bg-[#4C4C4C] text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-4 h-4" /> Download Sample .xlsx
          </button>
        </div>

        {/* Success State */}
        {resultSummary ? (
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center my-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Import Complete!</h4>
            <p className="text-xs text-emerald-300">
              Successfully imported <span className="font-bold text-white">{resultSummary.insertedCount}</span> lead records out of {resultSummary.totalRows} rows.
            </p>
            <button
              onClick={() => {
                resetModal()
                window.location.reload()
              }}
              className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
            >
              Done & Refresh Pipeline
            </button>
          </div>
        ) : (
          <>
            {/* File Upload Zone */}
            <div className="relative border-2 border-dashed border-[#3C3C3C] hover:border-[#007ACC] rounded-2xl p-8 text-center transition-all bg-[#252526]/50">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-[#007ACC] mx-auto mb-2" />
              <p className="text-xs font-bold text-white mb-1">
                {fileName ? fileName : 'Click or Drag & Drop Excel file (.xlsx, .csv)'}
              </p>
              <p className="text-[11px] text-gray-400">
                Headers supported: Full Name, Email, Phone, Preferred Country, Preferred Course, Preferred Intake, Event Tag, Source, Notes
              </p>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs font-medium text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center text-xs text-gray-300">
                  <span className="font-bold text-white">Previewing {parsedRows.length} Rows</span>
                  <span className="text-gray-400">Showing first 5 rows</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#3C3C3C] max-h-48">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#252526] text-white font-bold border-b border-[#3C3C3C] sticky top-0">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Full Name</th>
                        <th className="p-2.5">Phone</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Preferred Country</th>
                        <th className="p-2.5">Event Tag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3C3C3C]">
                      {parsedRows.slice(0, 5).map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#252526]">
                          <td className="p-2.5 font-mono text-gray-400">{idx + 1}</td>
                          <td className="p-2.5 font-semibold text-white">
                            {row['Full Name'] || row['Name'] || row['fullName'] || '—'}
                          </td>
                          <td className="p-2.5">{row['Phone'] || row['Mobile'] || row['phone'] || '—'}</td>
                          <td className="p-2.5">{row['Email'] || row['email'] || '—'}</td>
                          <td className="p-2.5">{row['Preferred Country'] || row['Country'] || '—'}</td>
                          <td className="p-2.5">{row['Event Tag'] || row['Event'] || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="w-full py-3 rounded-full border border-[#3C3C3C] text-gray-300 hover:bg-[#252526] font-bold text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={isUploading}
                    className="w-full py-3 rounded-full bg-[#0E639C] hover:bg-[#1177BB] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Importing Leads...
                      </>
                    ) : (
                      `Import ${parsedRows.length} Leads`
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
