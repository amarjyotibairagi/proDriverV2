import "../user-globals.css"
import { getSession } from "../actions/auth"
import { ImpersonationBanner } from "@/components/user-dashboard/impersonation-banner"

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const isImpersonating = !!session?.originalAdminId

  return (
    <>
      {isImpersonating && <ImpersonationBanner />}
      {children}
    </>
  )
}
