// app/admin/users/layout.tsx
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}