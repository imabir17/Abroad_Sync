'use client'

import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import ContractPDF from './ContractPDF'
import InvoicePDF from './InvoicePDF'
import { Download, Loader2 } from 'lucide-react'

interface PDFPreviewProps {
  activeTab: 'contract' | 'invoice'
  data: any
}

export default function PDFPreview({ activeTab, data }: PDFPreviewProps) {
  const DocumentComponent = activeTab === 'contract' 
    ? <ContractPDF {...data} /> 
    : <InvoicePDF {...data} />

  const fileName = `AbroadSync_${activeTab}_${data.agencyName?.replace(/\\s+/g, '_') || 'document'}.pdf`

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex justify-end">
        <PDFDownloadLink
          document={DocumentComponent}
          fileName={fileName}
          className="flex items-center gap-2 bg-[#333FC2] hover:bg-[#28329B] text-white py-2 px-4 rounded-xl font-medium transition-colors"
        >
          {({ loading }) => (
            <>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {loading ? 'Preparing PDF...' : `Download ${activeTab === 'contract' ? 'Contract' : 'Invoice'} PDF`}
            </>
          )}
        </PDFDownloadLink>
      </div>
      
      <div className="flex-1 w-full rounded-xl overflow-hidden border border-[#D1D5DB] shadow-inner bg-white">
        <PDFViewer className="w-full h-full border-none" showToolbar={false}>
          {DocumentComponent}
        </PDFViewer>
      </div>
    </div>
  )
}
