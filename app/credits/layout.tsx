// app/credits/layout.tsx
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function CreditsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}