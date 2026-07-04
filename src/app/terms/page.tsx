import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms & Conditions | AbroadSync',
  description: 'Terms and Conditions for AbroadSync CRM',
}

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#202638] font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm font-semibold text-[#5C6478] hover:text-blue-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>
        
        <div className="neo-raised bg-[#E7ECF3] rounded-3xl p-8 md:p-12 shadow-[12px_12px_24px_#AEB9C9,-12px_-12px_24px_#FFFFFF]">
          <h1 className="text-3xl md:text-4xl font-black text-[#202638] mb-4 tracking-tight">Terms & Conditions</h1>
          <p className="text-sm font-bold text-[#5C6478] mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8 text-base text-[#5C6478] leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#202638] mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing or using the AbroadSync CRM application, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, then you may not access the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#202638] mb-4">2. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive property of AbroadSync and its licensors. The application is protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#202638] mb-4">3. User Accounts & Responsibilities</h2>
              <p className="mb-2">When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You are responsible for safeguarding the password that you use to access the Service.</li>
                <li>You agree not to disclose your password to any third party.</li>
                <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
                <li>You are responsible for ensuring that the data you input (such as student leads) complies with local privacy regulations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#202638] mb-4">4. Acceptable Use</h2>
              <p>
                You agree not to use the application to collect or store sensitive personal information unlawfully. The CRM is intended solely for managing educational consultancy leads, applications, and related internal business processes. Any misuse, unauthorized scraping, or reverse engineering of the application is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#202638] mb-4">5. Limitation of Liability</h2>
              <p>
                In no event shall AbroadSync, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#202638] mb-4">6. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
