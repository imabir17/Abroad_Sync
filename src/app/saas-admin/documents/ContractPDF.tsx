import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: 'Times-Roman',
    fontSize: 10,
    lineHeight: 1.6,
    color: '#202638'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    paddingBottom: 20,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#111827',
  },
  bold: {
    fontFamily: 'Times-Bold',
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify'
  },
  italic: {
    fontFamily: 'Times-Italic',
    marginBottom: 20
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginTop: 20,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  signatureSection: {
    flexDirection: 'row',
    marginTop: 60,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    paddingTop: 30,
    justifyContent: 'space-between'
  },
  signatureBox: {
    width: '45%'
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF',
    marginBottom: 5,
    marginTop: 20,
    height: 20
  },
  signatureLabel: {
    fontSize: 8,
    color: '#6B7280',
    textTransform: 'uppercase',
    fontFamily: 'Helvetica'
  }
})

interface ContractPDFProps {
  agencyName: string
  date: string
  subscriptionFee: string
}

const formatDate = (val: string) => {
  if (!val) return ''
  return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

export default function ContractPDF({ agencyName, date, subscriptionFee }: ContractPDFProps) {
  const subFeeNum = parseFloat(subscriptionFee) || 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        <View style={styles.header}>
          <Image src="/logo.jpg" style={styles.logoImage} />
          <Text style={styles.title}>Master Subscription Agreement</Text>
        </View>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>THIS MASTER SUBSCRIPTION AGREEMENT</Text> (the "Agreement") is made and entered into on this <Text style={styles.bold}>{formatDate(date)}</Text> (the "Effective Date"), by and between:
        </Text>
        
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Abroad Sync Inc.</Text>, a Delaware Corporation, hereinafter referred to as the "Provider",
        </Text>
        <Text style={styles.paragraph}>AND</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{agencyName || '[Agency Name]'}</Text>, hereinafter referred to as the "Customer".
        </Text>
        
        <Text style={styles.italic}>
          Provider and Customer may be referred to individually as a "Party" and collectively as the "Parties."
        </Text>

        <Text style={styles.sectionTitle}>1. Definitions</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>"Service"</Text> refers to the proprietary Abroad Sync Customer Relationship Management (CRM) platform, accessible via the internet, including all associated software, interfaces, and updates provided by the Provider.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>"Customer Data"</Text> means all electronic data, information, leads, and operational materials submitted by or on behalf of the Customer to the Service.
        </Text>

        <Text style={styles.sectionTitle}>2. Grant of License</Text>
        <Text style={styles.paragraph}>
          Subject to the terms and conditions of this Agreement and timely payment of all applicable fees, the Provider hereby grants to the Customer a limited, non-exclusive, non-transferable, and revocable right to access and use the Service strictly for the Customer's internal business operations. The Customer shall not license, sublicense, sell, resell, transfer, assign, or distribute the Service to any third party without explicit prior written consent from the Provider.
        </Text>

        <Text style={styles.sectionTitle}>3. Fees and Payment Terms</Text>
        <Text style={styles.paragraph}>
          The Customer agrees to pay the fees set forth in the corresponding Invoice. Unless otherwise specified, all fees are quoted and payable in United States Dollars (USD). Subscription fees are billed in advance. If any undisputed invoiced amount is not received by the Provider by the due date, those charges may accrue late interest at the rate of 1.5% of the outstanding balance per month, and the Provider may condition future subscription renewals on payment terms shorter than those specified in this Agreement. The current subscription fee is agreed at {formatMoney(subFeeNum)}.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Security and Privacy Policy</Text>
        <Text style={styles.paragraph}>
          The Provider is firmly committed to protecting the privacy and security of Customer Data. The Provider shall maintain robust administrative, physical, and technical safeguards engineered to ensure the security, confidentiality, and integrity of Customer Data. The Provider shall not modify, disclose, or access Customer Data except as necessary to provide the Service, prevent or address technical problems, or as compelled by law.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Data Ownership:</Text> As between the Parties, the Customer exclusively owns all rights, title, and interest in and to all Customer Data.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Data Processing:</Text> The Provider acts solely as a data processor on behalf of the Customer. The Customer guarantees that all data provided has been collected in accordance with applicable global privacy laws (including GDPR or equivalent local regulations) and that the Customer possesses the necessary legal basis to process such data.
        </Text>

        <Text style={styles.sectionTitle}>5. Term and Termination</Text>
        <Text style={styles.paragraph}>
          This Agreement commences on the Effective Date and continues until all subscriptions hereunder have expired or have been terminated. Either Party may terminate this Agreement for cause if the other Party materially breaches this Agreement and such breach remains uncured for a period of thirty (30) days following written notice. Upon termination, the Provider will make Customer Data available for export for thirty (30) days, after which the Provider shall have no obligation to maintain or provide any Customer Data and shall permanently delete all Customer Data in its systems.
        </Text>

        <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          IN NO EVENT SHALL EITHER PARTY'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED THE TOTAL AMOUNT PAID BY CUSTOMER HEREUNDER FOR THE SERVICES GIVING RISE TO THE LIABILITY IN THE TWELVE (12) MONTHS PRECEDING THE FIRST INCIDENT OUT OF WHICH THE LIABILITY AROSE. NEITHER PARTY SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.
        </Text>

        <View style={styles.signatureSection} wrap={false}>
          <View style={styles.signatureBox}>
            <Text style={styles.bold}>For Abroad Sync Inc.</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Authorized Signature</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Printed Name</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Date</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.bold}>For {agencyName || '[Agency Name]'}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Authorized Signature</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Printed Name</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Date</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
