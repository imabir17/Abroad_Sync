import { getLeadForms } from '@/app/actions/forms'
import FormsClient from './FormsClient'

export default async function FormsDashboardPage() {
  const result = await getLeadForms()

  if (result.error) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold">
        Error loading lead forms: {result.error}
      </div>
    )
  }

  return (
    <FormsClient
      forms={result.forms || []}
      counselors={result.counselors || []}
    />
  )
}
