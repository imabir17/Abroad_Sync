'use client'

import { useState } from 'react'
import { FileText, Receipt, Building, Calendar, DollarSign, Scissors } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import the PDF viewer to avoid SSR issues with react-pdf
const PDFPreview = dynamic(() => import('./PDFPreview'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white rounded-xl shadow-inner border border-[#D1D5DB]">
      <div className="flex flex-col items-center gap-4 text-[#6B7280]">
        <div className="w-8 h-8 border-4 border-[#333FC2] border-t-transparent rounded-full animate-spin"></div>
        <p>Loading PDF engine...</p>
      </div>
    </div>
  )
})

type DocumentType = 'contract' | 'invoice'

export default function DocumentsClient() {
  const [activeTab, setActiveTab] = useState<DocumentType>('contract')
  
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

  const documentData = {
    agencyName,
    date,
    invoiceDueDate,
    subscriptionFee,
    setupFee,
    discountAmount,
    taxRate
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-120px)]">
      {/* Left Column - Controls */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6 overflow-y-auto pr-2">
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
        </div>
      </div>

      {/* Right Column - PDF Viewer */}
      <div className="flex-1 bg-[#E5E7EB] p-4 lg:p-8 rounded-2xl flex flex-col">
        <PDFPreview activeTab={activeTab} data={documentData} />
      </div>
    </div>
  )
}
