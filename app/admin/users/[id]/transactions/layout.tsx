// app/admin/users/[id]/transactions/layout.tsx
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function UserTransactionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}