// app/jobs/layout.tsx
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="jobs-layout">
      {children}
    </div>
  )
}