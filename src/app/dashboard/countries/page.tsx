import { getUserSession } from '@/lib/auth'
import { getCountries } from '@/app/actions/countries'
import CountriesClient from './CountriesClient'

export default async function CountriesPage() {
  const user = await getUserSession()
  if (!user) return null

  const countries = await getCountries()
  const isAdminOrManager = user.role === 'Super Admin' || user.role === 'Manager'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202638] font-display">Countries & Guidelines</h1>
          <p className="text-[#5C6478] mt-1 text-sm">
            Manage destination countries, requirements, and estimated costs.
          </p>
        </div>
      </div>
      
      <CountriesClient 
        initialCountries={countries || []} 
        isAdminOrManager={isAdminOrManager} 
      />
    </div>
  )
}
