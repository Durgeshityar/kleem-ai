import 'reactflow/dist/style.css'

export default function PublicFormLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="h-[100dvh] w-full">{children}</div>
}
