import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#374151'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: '#333FC2',
    borderRadius: 8,
    marginRight: 12
  },
  logoText: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#111827'
  },
  logoSubtext: {
    fontSize: 8,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  titleGroup: {
    alignItems: 'flex-end'
  },
  invoiceTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 4
  },
  invoiceNumber: {
    fontSize: 10,
    color: '#4B5563',
    fontFamily: 'Helvetica-Bold'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40
  },
  billedToTitle: {
    fontSize: 8,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4
  },
  billedToName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#111827'
  },
  datesGroup: {
    alignItems: 'flex-end'
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  dateLabel: {
    fontSize: 8,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: 8
  },
  dateValue: {
    fontSize: 10,
    color: '#111827',
    fontFamily: 'Helvetica-Bold'
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    paddingBottom: 8,
    marginBottom: 8
  },
  colDesc: { flex: 1 },
  colQty: { width: 50, textAlign: 'center' },
  colAmt: { width: 80, textAlign: 'right' },
  thText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 12
  },
  itemTitle: {
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 2
  },
  itemDesc: {
    fontSize: 9,
    color: '#6B7280'
  },
  itemValue: {
    fontFamily: 'Helvetica-Bold',
    color: '#111827'
  },
  totalsContainer: {
    marginTop: 20,
    alignItems: 'flex-end'
  },
  totalsBox: {
    width: 200
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6
  },
  totalLabel: {
    color: '#6B7280'
  },
  totalValue: {
    fontFamily: 'Helvetica-Bold',
    color: '#111827'
  },
  discountLabel: {
    color: '#059669'
  },
  discountValue: {
    fontFamily: 'Helvetica-Bold',
    color: '#059669'
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB'
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    marginTop: 8,
    borderRadius: 4
  },
  grandTotalLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#111827'
  },
  grandTotalValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#333FC2'
  },
  footer: {
    marginTop: 80,
    textAlign: 'center'
  },
  footerText: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4
  },
  footerSubtext: {
    fontSize: 8,
    color: '#9CA3AF'
  }
})

interface InvoicePDFProps {
  agencyName: string
  date: string
  invoiceDueDate: string
  subscriptionFee: string
  setupFee: string
  discountAmount: string
  taxRate: string
}

const formatDate = (val: string) => {
  if (!val) return ''
  return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

export default function InvoicePDF({
  agencyName,
  date,
  invoiceDueDate,
  subscriptionFee,
  setupFee,
  discountAmount,
  taxRate
}: InvoicePDFProps) {
  const subFeeNum = parseFloat(subscriptionFee) || 0
  const setupFeeNum = parseFloat(setupFee) || 0
  const discountNum = parseFloat(discountAmount) || 0
  const taxRateNum = parseFloat(taxRate) || 0
  
  const initialSubtotal = subFeeNum + setupFeeNum
  const discountedSubtotal = Math.max(0, initialSubtotal - discountNum)
  const tax = discountedSubtotal * (taxRateNum / 100)
  const total = discountedSubtotal + tax

  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        <View style={styles.headerRow}>
          <View style={styles.logoGroup}>
            {/* Simulated Logo Box since we can't easily inline the complex SVG without specific SVG tags in react-pdf */}
            <View style={styles.logoBox} />
            <View>
              <Text style={styles.logoText}>AbroadSync</Text>
              <Text style={styles.logoSubtext}>B2B Enterprise</Text>
            </View>
          </View>
          <View style={styles.titleGroup}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.billedToTitle}>Billed To</Text>
            <Text style={styles.billedToName}>{agencyName || '[Agency Name]'}</Text>
          </View>
          <View style={styles.datesGroup}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Issue Date:</Text>
              <Text style={styles.dateValue}>{formatDate(date)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Due Date:</Text>
              <Text style={styles.dateValue}>{formatDate(invoiceDueDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.thText, styles.colDesc]}>Description of Service</Text>
          <Text style={[styles.thText, styles.colQty]}>Qty</Text>
          <Text style={[styles.thText, styles.colAmt]}>Amount</Text>
        </View>

        <View style={styles.tableRow}>
          <View style={styles.colDesc}>
            <Text style={styles.itemTitle}>Abroad Sync CRM - Professional Plan</Text>
            <Text style={styles.itemDesc}>Annual Platform Access</Text>
          </View>
          <Text style={[styles.itemValue, styles.colQty]}>1</Text>
          <Text style={[styles.itemValue, styles.colAmt]}>{formatMoney(subFeeNum)}</Text>
        </View>

        {setupFeeNum > 0 && (
          <View style={styles.tableRow}>
            <View style={styles.colDesc}>
              <Text style={styles.itemTitle}>Onboarding & Setup</Text>
              <Text style={styles.itemDesc}>One-time provisioning and initialization fee</Text>
            </View>
            <Text style={[styles.itemValue, styles.colQty]}>1</Text>
            <Text style={[styles.itemValue, styles.colAmt]}>{formatMoney(setupFeeNum)}</Text>
          </View>
        )}

        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatMoney(initialSubtotal)}</Text>
            </View>
            
            {discountNum > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.discountLabel}>Discount Applied</Text>
                <Text style={styles.discountValue}>-{formatMoney(discountNum)}</Text>
              </View>
            )}
            
            <View style={styles.taxRow}>
              <Text style={styles.totalLabel}>Tax ({taxRate}%)</Text>
              <Text style={styles.totalValue}>{formatMoney(tax)}</Text>
            </View>
            
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Due</Text>
              <Text style={styles.grandTotalValue}>{formatMoney(total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for partnering with AbroadSync.</Text>
          <Text style={styles.footerSubtext}>This is a system generated invoice.</Text>
        </View>

      </Page>
    </Document>
  )
}
