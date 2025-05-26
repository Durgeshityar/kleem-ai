const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-black">
      <div className="absolute w-full h-full opacity-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400/20 via-transparent to-transparent pointer-events-none"></div>
      {children}
    </div>
  )
}

export default AuthLayout
