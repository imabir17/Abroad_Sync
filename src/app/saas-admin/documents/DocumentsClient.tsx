'use client'

import { useState, useRef } from 'react'
import { FileText, Download, Receipt, Building, Calendar, DollarSign, Loader2, Scissors } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type DocumentType = 'contract' | 'invoice'

export default function DocumentsClient() {
  const [activeTab, setActiveTab] = useState<DocumentType>('contract')
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Form State
  const [agencyName, setAgencyName] = useState('Global Education Agency')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [invoiceDueDate, setInvoiceDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  })
  const [subscriptionFee, setSubscriptionFee] = useState('1500')
  const [setupFee, setSetupFee] = useState('300')
  const [discountAmount, setDiscountAmount] = useState('0')
  const [taxRate, setTaxRate] = useState('10')

  const documentRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return
    
    setIsGenerating(true)
    try {
      const element = documentRef.current
      
      const canvas = await html2canvas(element, {
        scale: 2, 
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
  const discountNum = parseFloat(discountAmount) || 0
  const taxRateNum = parseFloat(taxRate) || 0
  
  const initialSubtotal = subFeeNum + setupFeeNum
  const discountedSubtotal = Math.max(0, initialSubtotal - discountNum)
  const tax = discountedSubtotal * (taxRateNum / 100)
  const total = discountedSubtotal + tax

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4B5563] mb-1">Discount Amount ($)</label>
                  <div className="relative">
                    <Scissors className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E79F2]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B5563] mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E79F2]"
                  />
                </div>
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
          className="bg-white shadow-2xl relative overflow-hidden"
          style={{
            width: '210mm',
            minHeight: '297mm', // A4 height (Contract may overflow and html2canvas handles it, but typically A4 scaling implies 297mm chunks)
            padding: '20mm',
            boxSizing: 'border-box'
          }}
        >
          {/* Subtle Watermark/Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l1.32 1.32-54.628 54.628-1.32-1.32L54.627 0zm-5.32 0l1.32 1.32-49.308 49.308-1.32-1.32L49.307 0zm-5.32 0l1.32 1.32-43.988 43.988-1.32-1.32L43.987 0zm-5.32 0l1.32 1.32-38.668 38.668-1.32-1.32L38.667 0zm-5.32 0l1.32 1.32-33.348 33.348-1.32-1.32L33.347 0zm-5.32 0l1.32 1.32-28.028 28.028-1.32-1.32L28.027 0zm-5.32 0l1.32 1.32-22.708 22.708-1.32-1.32L22.707 0zm-5.32 0l1.32 1.32-17.388 17.388-1.32-1.32L17.387 0zm-5.32 0l1.32 1.32-12.068 12.068-1.32-1.32L12.067 0zm-5.32 0l1.32 1.32-6.748 6.748-1.32-1.32L6.747 0z' fill='%23333FC2' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }}></div>

          {activeTab === 'contract' ? (
            <div className="relative z-10 text-[#202638] font-serif text-[10pt] leading-[1.6]">
              
              {/* Header with Logo */}
              <div className="flex flex-col items-center justify-center mb-10 pb-6 border-b-2 border-[#111827]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6E79F2] to-[#333FC2] flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path d="M2 12L22 4L14 22L11 14L2 12Z" fill="white"/>
                    </svg>
                  </div>
                  <span className="font-sans font-bold text-3xl tracking-tighter text-[#111827]">AbroadSync</span>
                </div>
                <h1 className="text-2xl font-bold uppercase tracking-widest text-[#111827]">Master Subscription Agreement</h1>
              </div>

              <div className="text-justify space-y-4">
                <p>
                  <strong>THIS MASTER SUBSCRIPTION AGREEMENT</strong> (the "Agreement") is made and entered into on this <strong>{formatDate(date)}</strong> (the "Effective Date"), by and between:
                </p>
                <p>
                  <strong>Abroad Sync Inc.</strong>, a Delaware Corporation, hereinafter referred to as the "Provider",
                  <br />AND<br />
                  <strong>{agencyName || '[Agency Name]'}</strong>, hereinafter referred to as the "Customer".
                </p>
                <p className="italic mb-6">
                  Provider and Customer may be referred to individually as a "Party" and collectively as the "Parties."
                </p>

                <h3 className="text-[11pt] font-bold text-[#111827] uppercase mt-6 mb-2">1. Definitions</h3>
                <p>
                  <strong>"Service"</strong> refers to the proprietary Abroad Sync Customer Relationship Management (CRM) platform, accessible via the internet, including all associated software, interfaces, and updates provided by the Provider.
                  <br /><strong>"Customer Data"</strong> means all electronic data, information, leads, and operational materials submitted by or on behalf of the Customer to the Service.
                </p>

                <h3 className="text-[11pt] font-bold text-[#111827] uppercase mt-6 mb-2">2. Grant of License</h3>
                <p>
                  Subject to the terms and conditions of this Agreement and timely payment of all applicable fees, the Provider hereby grants to the Customer a limited, non-exclusive, non-transferable, and revocable right to access and use the Service strictly for the Customer's internal business operations. The Customer shall not license, sublicense, sell, resell, transfer, assign, or distribute the Service to any third party without explicit prior written consent from the Provider.
                </p>

                <h3 className="text-[11pt] font-bold text-[#111827] uppercase mt-6 mb-2">3. Fees and Payment Terms</h3>
                <p>
                  The Customer agrees to pay the fees set forth in the corresponding Invoice. Unless otherwise specified, all fees are quoted and payable in United States Dollars (USD). Subscription fees are billed in advance. If any undisputed invoiced amount is not received by the Provider by the due date, those charges may accrue late interest at the rate of 1.5% of the outstanding balance per month, and the Provider may condition future subscription renewals on payment terms shorter than those specified in this Agreement.
                </p>

                <h3 className="text-[11pt] font-bold text-[#111827] uppercase mt-6 mb-2">4. Data Security and Privacy Policy</h3>
                <p>
                  The Provider is firmly committed to protecting the privacy and security of Customer Data. The Provider shall maintain robust administrative, physical, and technical safeguards engineered to ensure the security, confidentiality, and integrity of Customer Data. The Provider shall not modify, disclose, or access Customer Data except as necessary to provide the Service, prevent or address technical problems, or as compelled by law. 
                </p>
                <p>
                  <strong>Data Ownership:</strong> As between the Parties, the Customer exclusively owns all rights, title, and interest in and to all Customer Data. 
                  <br /><strong>Data Processing:</strong> The Provider acts solely as a data processor on behalf of the Customer. The Customer guarantees that all data provided has been collected in accordance with applicable global privacy laws (including GDPR or equivalent local regulations) and that the Customer possesses the necessary legal basis to process such data.
                </p>

                <h3 className="text-[11pt] font-bold text-[#111827] uppercase mt-6 mb-2">5. Term and Termination</h3>
                <p>
                  This Agreement commences on the Effective Date and continues until all subscriptions hereunder have expired or have been terminated. Either Party may terminate this Agreement for cause if the other Party materially breaches this Agreement and such breach remains uncured for a period of thirty (30) days following written notice. Upon termination, the Provider will make Customer Data available for export for thirty (30) days, after which the Provider shall have no obligation to maintain or provide any Customer Data and shall permanently delete all Customer Data in its systems.
                </p>

                <h3 className="text-[11pt] font-bold text-[#111827] uppercase mt-6 mb-2">6. Limitation of Liability</h3>
                <p>
                  IN NO EVENT SHALL EITHER PARTY'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED THE TOTAL AMOUNT PAID BY CUSTOMER HEREUNDER FOR THE SERVICES GIVING RISE TO THE LIABILITY IN THE TWELVE (12) MONTHS PRECEDING THE FIRST INCIDENT OUT OF WHICH THE LIABILITY AROSE. NEITHER PARTY SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.
                </p>
              </div>
              
              <div className="mt-16 pt-8 border-t border-[#D1D5DB] grid grid-cols-2 gap-12 font-sans">
                <div>
                  <p className="font-bold mb-8 text-[#111827]">For Abroad Sync Inc.</p>
                  <div className="border-b border-[#9CA3AF] mb-2 pb-1 text-sm h-6"></div>
                  <div className="text-xs text-[#6B7280] uppercase tracking-wider mb-4">Authorized Signature</div>
                  
                  <div className="border-b border-[#9CA3AF] mb-2 pb-1 text-sm h-6"></div>
                  <div className="text-xs text-[#6B7280] uppercase tracking-wider mb-4">Printed Name</div>
                  
                  <div className="border-b border-[#9CA3AF] mb-2 pb-1 text-sm h-6"></div>
                  <div className="text-xs text-[#6B7280] uppercase tracking-wider">Date</div>
                </div>
                <div>
                  <p className="font-bold mb-8 text-[#111827]">For {agencyName || '[Agency Name]'}</p>
                  <div className="border-b border-[#9CA3AF] mb-2 pb-1 text-sm h-6"></div>
                  <div className="text-xs text-[#6B7280] uppercase tracking-wider mb-4">Authorized Signature</div>
                  
                  <div className="border-b border-[#9CA3AF] mb-2 pb-1 text-sm h-6"></div>
                  <div className="text-xs text-[#6B7280] uppercase tracking-wider mb-4">Printed Name</div>
                  
                  <div className="border-b border-[#9CA3AF] mb-2 pb-1 text-sm h-6"></div>
                  <div className="text-xs text-[#6B7280] uppercase tracking-wider">Date</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-10 text-[#374151] font-sans text-[11pt]">
              <div className="flex justify-between items-start mb-16">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6E79F2] to-[#333FC2] flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                      <path d="M2 12L22 4L14 22L11 14L2 12Z" fill="white"/>
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold text-3xl tracking-tighter text-[#111827] leading-none block">AbroadSync</span>
                    <span className="text-xs tracking-widest uppercase text-[#6B7280]">B2B Enterprise</span>
                  </div>
                </div>
                <div className="text-right">
                  <h1 className="text-4xl font-black text-[#111827] tracking-tight mb-2">INVOICE</h1>
                  <p className="text-sm font-semibold text-[#4B5563]">INV-{new Date().getFullYear()}-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}</p>
                </div>
              </div>
              
              <div className="flex justify-between mb-16">
                <div>
                  <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Billed To</h3>
                  <p className="font-bold text-xl text-[#111827]">{agencyName || '[Agency Name]'}</p>
                </div>
                <div className="text-right text-sm">
                  <div className="mb-2">
                    <span className="text-[#9CA3AF] uppercase tracking-widest text-xs mr-2">Issue Date:</span>
                    <span className="font-medium text-[#111827]">{formatDate(date)}</span>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] uppercase tracking-widest text-xs mr-2">Due Date:</span>
                    <span className="font-medium text-[#111827]">{formatDate(invoiceDueDate)}</span>
                  </div>
                </div>
              </div>
              
              <table className="w-full mb-12 border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#111827]">
                    <th className="py-4 text-left text-xs font-bold text-[#111827] uppercase tracking-widest">Description of Service</th>
                    <th className="py-4 text-center text-xs font-bold text-[#111827] uppercase tracking-widest w-24">Qty</th>
                    <th className="py-4 text-right text-xs font-bold text-[#111827] uppercase tracking-widest w-32">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#F3F4F6]">
                    <td className="py-5">
                      <p className="font-bold text-[#111827]">Abroad Sync CRM - Professional Plan</p>
                      <p className="text-sm text-[#6B7280] mt-1">Annual Platform Access</p>
                    </td>
                    <td className="py-5 text-center font-medium">1</td>
                    <td className="py-5 text-right font-bold text-[#111827]">{formatMoney(subFeeNum)}</td>
                  </tr>
                  {setupFeeNum > 0 && (
                    <tr className="border-b border-[#F3F4F6]">
                      <td className="py-5">
                        <p className="font-bold text-[#111827]">Onboarding & Setup</p>
                        <p className="text-sm text-[#6B7280] mt-1">One-time provisioning and initialization fee</p>
                      </td>
                      <td className="py-5 text-center font-medium">1</td>
                      <td className="py-5 text-right font-bold text-[#111827]">{formatMoney(setupFeeNum)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              <div className="flex justify-end">
                <div className="w-[300px]">
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-[#6B7280] font-medium">Subtotal</span>
                    <span className="font-bold text-[#111827]">{formatMoney(initialSubtotal)}</span>
                  </div>
                  
                  {discountNum > 0 && (
                    <div className="flex justify-between py-2 text-sm text-[#059669]">
                      <span className="font-medium">Discount Applied</span>
                      <span className="font-bold">-{formatMoney(discountNum)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-2 text-sm border-b border-[#D1D5DB]">
                    <span className="text-[#6B7280] font-medium">Tax ({taxRate}%)</span>
                    <span className="font-bold text-[#111827]">{formatMoney(tax)}</span>
                  </div>
                  
                  <div className="flex justify-between py-4 bg-[#F9FAFB] px-4 -mx-4 mt-2 rounded-lg">
                    <span className="text-lg font-bold text-[#111827]">Total Due</span>
                    <span className="text-xl font-black text-[#333FC2]">{formatMoney(total)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-32 text-center">
                <p className="text-sm font-medium text-[#6B7280]">Thank you for partnering with AbroadSync.</p>
                <p className="text-xs text-[#9CA3AF] mt-1">This is a system generated invoice.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
