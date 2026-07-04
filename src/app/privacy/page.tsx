import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | AbroadSync',
  description: 'Privacy Policy for AbroadSync CRM',
}

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl md:text-4xl font-black text-[#202638] mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-sm font-bold text-[#5C6478] mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8 text-base text-[#5C6478] leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-[#202638] mb-4">1. Introduction</h2>
              <p>
                Welcome to AbroadSync ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy applies to all information collected through our CRM application and related services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#202638] mb-4">2. Information We Collect</h2>
              <p className="mb-2">We collect personal information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services, or otherwise contact us. The personal information that we collect depends on the context of your interactions with us and the application, the choices you make, and the products and features you use.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Personal Data:</strong> Name, email address, phone number, and account credentials.</li>
                <li><strong>Client Data (Leads):</strong> Information about students/leads inputted into the CRM by users, including academic records, preferences, and contact details.</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our application.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#202638] mb-4">3. How We Use Your Information</h2>
              <p className="mb-2">We use personal information collected via our application for a variety of business purposes described below:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>To facilitate account creation and logon process.</li>
                <li>To provide and manage your CRM workspace and team assignments.</li>
                <li>To send administrative information to you.</li>
                <li>To protect our application and user data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#202638] mb-4">4. Data Sharing and Disclosure</h2>
              <p>
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We do not sell your personal or lead data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#202638] mb-4">5. Data Security</h2>
              <p>
                We have implemented appropriate technical and organizational security measures (including Row Level Security via Supabase) designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#202638] mb-4">6. Contact Us</h2>
              <p>
                If you have questions or comments about this policy, you may contact your system administrator or the agency owner operating this workspace.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
