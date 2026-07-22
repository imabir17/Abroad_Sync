import { getPublicLeadForm } from '@/app/actions/forms'
import PublicFormClient from './PublicFormClient'

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params
  const result = await getPublicLeadForm(formId)

  if (result.error || !result.form) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 text-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm border border-[#E5E7EB]">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-4">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-2">Form Not Available</h2>
          <p className="text-sm text-[#6B7280]">
            {result.error || 'This inquiry form is inactive or no longer available.'}
          </p>
        </div>
      </div>
    )
  }

  return <PublicFormClient form={result.form} />
}
