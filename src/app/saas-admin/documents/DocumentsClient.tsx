'use client'

import { useState, useRef } from 'react'
import { FileText, Download, Receipt, Building, Calendar, DollarSign, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type DocumentType = 'contract' | 'invoice'

export default function DocumentsClient() {
  const [activeTab, setActiveTab] = useState<DocumentType>('contract')
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Form State
  const [agencyName, setAgencyName] = useState('Agency Name')
  const [agencyAddress, setAgencyAddress] = useState('123 Global Way\\nCity, State, Zip')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [invoiceDueDate, setInvoiceDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  })
  const [subscriptionFee, setSubscriptionFee] = useState('1500')
  const [setupFee, setSetupFee] = useState('300')
  const [taxRate, setTaxRate] = useState('10')

  const documentRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return
    
    setIsGenerating(true)
    try {
      const element = documentRef.current
      
      // We temporarily adjust styling to ensure crisp PDF rendering
      // The element needs to be visible but can be absolutely positioned if needed
      // Here we just capture it as is because it's already styled to look like A4
      
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      
      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`AbroadSync_${activeTab}_${agencyName.replace(/\\s+/g, '_')}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Calculations for Invoice
  const subFeeNum = parseFloat(subscriptionFee) || 0
  const setupFeeNum = parseFloat(setupFee) || 0
  const taxRateNum = parseFloat(taxRate) || 0
  const subtotal = subFeeNum + setupFeeNum
  const tax = subtotal * (taxRateNum / 100)
  const total = subtotal + tax

  // Format currency
  const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
  // Format Date
  const formatDate = (val: string) => {
    if (!val) return ''
    return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column - Controls */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
          <h2 className="text-xl font-bold mb-6 text-[#202638]">Document Details</h2>
          
          <div className="flex gap-2 mb-6 p-1 bg-[#F3F4F6] rounded-xl">
            <button
              onClick={() => setActiveTab('contract')}
              className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg font-medium transition-all ${activeTab === 'contract' ? 'bg-white text-[#333FC2] shadow-sm' : 'text-[#6B7280] hover:text-[#374151]'}`}
            >
              <FileText className="w-4 h-4" /> Contract
            </button>
            <button
              onClick={() => setActiveTab('invoice')}
              className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg font-medium transition-all ${activeTab === 'invoice' ? 'bg-white text-[#333FC2] shadow-sm' : 'text-[#6B7280] hover:text-[#374151]'}`}
            >
              <Receipt className="w-4 h-4" /> Invoice
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Agency Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E79F2] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Agency Address</label>
              <textarea
                value={agencyAddress}
                onChange={(e) => setAgencyAddress(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E79F2] focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#4B5563] mb-1">Issue Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6E79F2]"
                  />
                </div>
              </div>
              
              {activeTab === 'invoice' && (
                <div>
                  <label className="block text-sm font-medium text-[#4B5563] mb-1">Due Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={invoiceDueDate}
                      onChange={(e) => setInvoiceDueDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6E79F2]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#4B5563] mb-1">Subscription Fee ($)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={subscriptionFee}
                    onChange={(e) => setSubscriptionFee(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E79F2]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#4B5563] mb-1">Setup Fee ($)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={setupFee}
                    onChange={(e) => setSetupFee(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E79F2]"
                  />
                </div>
              </div>
            </div>
            
            {activeTab === 'invoice' && (
              <div>
                <label className="block text-sm font-medium text-[#4B5563] mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E79F2]"
                />
              </div>
            )}
          </div>
          
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="w-full mt-8 flex items-center justify-center gap-2 bg-[#333FC2] hover:bg-[#28329B] text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-70"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isGenerating ? 'Generating PDF...' : `Download ${activeTab === 'contract' ? 'Contract' : 'Invoice'} PDF`}
          </button>
        </div>
      </div>

      {/* Right Column - Preview Wrapper */}
      <div className="w-full lg:w-2/3 flex justify-center bg-[#E5E7EB] p-8 rounded-2xl overflow-auto shadow-inner min-h-[800px]">
        {/* A4 Paper Container */}
        <div 
          ref={documentRef}
          className="bg-white shadow-xl relative"
          style={{
            width: '210mm',
            minHeight: '297mm', // A4 height
            padding: '20mm',
            boxSizing: 'border-box'
          }}
        >
          {activeTab === 'contract' ? (
            <div className="text-[#374151] font-sans text-[11pt] leading-relaxed">
              <h1 className="text-2xl font-bold text-center mb-8 text-[#111827]">SOFTWARE AS A SERVICE (SAAS) AGREEMENT</h1>
              <p className="mb-8"><strong>Date:</strong> {formatDate(date)}</p>
              
              <p className="mb-4">This Software as a Service (SaaS) Agreement (the "Agreement") is entered into by and between:</p>
              
              <div className="mb-4">
                <strong>Abroad Sync</strong> (hereinafter referred to as the "Provider")
              </div>
              
              <p className="mb-4">AND</p>
              
              <div className="mb-8">
                <strong>{agencyName || '[Agency Name]'}</strong> (hereinafter referred to as the "Customer"), located at:<br/>
                <span className="whitespace-pre-line">{agencyAddress || '[Agency Address]'}</span>
              </div>
              
              <p className="mb-8 italic">Hereinafter collectively referred to as the "Parties."</p>
              
              <hr className="border-t border-[#D1D5DB] mb-8" />
              
              <h3 className="text-lg font-bold text-[#111827] mb-2">1. Provision of Service</h3>
              <p className="mb-6 text-justify">The Provider agrees to grant the Customer a non-exclusive, non-transferable right to access and use the <strong>Abroad Sync CRM</strong> (the "Service") solely for the Customer's internal business operations.</p>
              
              <h3 className="text-lg font-bold text-[#111827] mb-2">2. Subscription Fees and Payment</h3>
              <ul className="list-disc pl-5 mb-6 space-y-2">
                <li><strong>Fees:</strong> The Customer agrees to pay the subscription fees as outlined in the corresponding invoice. The subscription fee is <strong>{formatMoney(subFeeNum)}</strong>.</li>
                <li><strong>Payment Terms:</strong> Fees are payable in advance. Invoices are due within 14 days of the invoice date.</li>
                <li><strong>Late Payments:</strong> The Provider reserves the right to suspend access to the Service if payments are not received by the due date.</li>
              </ul>
              
              <h3 className="text-lg font-bold text-[#111827] mb-2">3. Customer Data and Privacy</h3>
              <ul className="list-disc pl-5 mb-6 space-y-2">
                <li><strong>Ownership:</strong> The Customer retains all rights and ownership of the data they enter into the CRM ("Customer Data").</li>
                <li><strong>Security:</strong> The Provider will implement reasonable industry-standard security measures to protect Customer Data.</li>
                <li><strong>Confidentiality:</strong> The Provider will not share, sell, or disclose Customer Data to third parties except as required by law.</li>
              </ul>
              
              <h3 className="text-lg font-bold text-[#111827] mb-2">4. Term and Termination</h3>
              <ul className="list-disc pl-5 mb-8 space-y-2">
                <li><strong>Term:</strong> This Agreement begins on the date stated above and continues on an Annual basis.</li>
                <li><strong>Termination for Convenience:</strong> Either party may terminate this Agreement by providing 30 days written notice prior to the end of the current billing cycle.</li>
              </ul>
              
              <div className="mt-16 grid grid-cols-2 gap-12">
                <div>
                  <p className="font-bold mb-8">For Abroad Sync</p>
                  <div className="border-b border-[#374151] mb-2 pb-1">Signature:</div>
                  <div className="border-b border-[#374151] mb-2 pb-1">Name:</div>
                  <div className="border-b border-[#374151] mb-2 pb-1">Title:</div>
                  <div className="border-b border-[#374151] pb-1">Date:</div>
                </div>
                <div>
                  <p className="font-bold mb-8">For {agencyName || '[Agency Name]'}</p>
                  <div className="border-b border-[#374151] mb-2 pb-1">Signature:</div>
                  <div className="border-b border-[#374151] mb-2 pb-1">Name:</div>
                  <div className="border-b border-[#374151] mb-2 pb-1">Title:</div>
                  <div className="border-b border-[#374151] pb-1">Date:</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[#374151] font-sans text-[11pt]">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h1 className="text-4xl font-bold text-[#333FC2] tracking-tight mb-2">INVOICE</h1>
                  <p className="text-sm text-[#6B7280]">Invoice Date: {formatDate(date)}</p>
                  <p className="text-sm text-[#6B7280]">Due Date: {formatDate(invoiceDueDate)}</p>
                  <p className="text-sm font-medium mt-2">Invoice #: INV-{new Date().getFullYear()}-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6E79F2] to-[#333FC2] flex items-center justify-center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12L22 4L14 22L11 14L2 12Z" fill="white"/>
                      </svg>
                    </div>
                    <span className="font-bold text-xl text-[#202638]">AbroadSync</span>
                  </div>
                  <p className="text-sm">123 SaaS Avenue</p>
                  <p className="text-sm">Tech City, TC 10010</p>
                  <p className="text-sm">billing@abroadsync.com</p>
                </div>
              </div>
              
              <div className="mb-12">
                <h3 className="text-sm font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Billed To</h3>
                <p className="font-bold text-lg text-[#111827]">{agencyName || '[Agency Name]'}</p>
                <p className="whitespace-pre-line text-sm mt-1">{agencyAddress || '[Agency Address]'}</p>
              </div>
              
              <table className="w-full mb-12 border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#111827]">
                    <th className="py-3 text-left text-sm font-bold text-[#111827] uppercase tracking-wider">Description</th>
                    <th className="py-3 text-center text-sm font-bold text-[#111827] uppercase tracking-wider w-24">Qty</th>
                    <th className="py-3 text-right text-sm font-bold text-[#111827] uppercase tracking-wider w-32">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#E5E7EB]">
                    <td className="py-4">
                      <p className="font-semibold text-[#111827]">Abroad Sync CRM - Professional Plan</p>
                      <p className="text-sm text-[#6B7280] mt-1">Annual Subscription</p>
                    </td>
                    <td className="py-4 text-center">1</td>
                    <td className="py-4 text-right font-medium">{formatMoney(subFeeNum)}</td>
                  </tr>
                  <tr className="border-b border-[#E5E7EB]">
                    <td className="py-4">
                      <p className="font-semibold text-[#111827]">One-Time Onboarding & Setup Fee</p>
                      <p className="text-sm text-[#6B7280] mt-1">Includes data migration and team training</p>
                    </td>
                    <td className="py-4 text-center">1</td>
                    <td className="py-4 text-right font-medium">{formatMoney(setupFeeNum)}</td>
                  </tr>
                </tbody>
              </table>
              
              <div className="flex justify-end">
                <div className="w-1/2">
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-[#6B7280]">Subtotal:</span>
                    <span className="font-medium text-[#111827]">{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm border-b border-[#D1D5DB]">
                    <span className="text-[#6B7280]">Tax ({taxRate}%):</span>
                    <span className="font-medium text-[#111827]">{formatMoney(tax)}</span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span className="text-lg font-bold text-[#111827]">Total Due:</span>
                    <span className="text-xl font-bold text-[#333FC2]">{formatMoney(total)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-24 pt-8 border-t border-[#E5E7EB] text-sm">
                <h3 className="font-bold text-[#111827] mb-2">Payment Instructions</h3>
                <p className="text-[#6B7280] mb-4">Please remit payment by the due date to ensure uninterrupted access to the CRM.</p>
                <div className="grid grid-cols-2 gap-4 bg-[#F9FAFB] p-4 rounded-lg border border-[#F3F4F6]">
                  <div>
                    <span className="text-[#9CA3AF] block text-xs uppercase tracking-wider mb-1">Bank Name</span>
                    <span className="font-medium">Global Tech Bank</span>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] block text-xs uppercase tracking-wider mb-1">Account Name</span>
                    <span className="font-medium">Abroad Sync Inc.</span>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] block text-xs uppercase tracking-wider mb-1">Account Number</span>
                    <span className="font-medium">1234567890</span>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] block text-xs uppercase tracking-wider mb-1">Routing / SWIFT</span>
                    <span className="font-medium">ABCSWIFTXX</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
