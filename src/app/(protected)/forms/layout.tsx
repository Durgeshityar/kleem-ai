export default function FormsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center ">
      <main className="flex-1 w-full">{children}</main>
    </div>
  )
}
