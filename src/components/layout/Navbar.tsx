import { createServer } from '@/lib/supabase/server'
import { NavbarClient } from './NavbarClient'

export default async function Navbar() {
  const supabase = await createServer()
  const { data: { session } } = await supabase.auth.getSession()

  let role = null
  if (session?.user) {
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()
    role = data?.role
  }

  return <NavbarClient session={session} role={role} />
}
