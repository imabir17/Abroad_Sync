import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function getUserSession() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user || !user.email) {
    return null
  }
  
  // Link the Supabase user to our Prisma user via email
  const prismaUser = await prisma.user.findUnique({
    where: { email: user.email },
    include: {
      company: true // Fetch company details as well
    }
  })
  
  return prismaUser
}
