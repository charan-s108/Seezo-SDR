import {
  Bot,
  FileSearch,
  ShieldCheck,
  Send,
} from "lucide-react"

export default function AuthCard({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-5xl rounded-xl border shadow-sm grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        
        {/* Left: Product Context */}
        <div className="hidden lg:flex flex-col justify-center bg-muted/40 p-10">
          <h2 className="text-3xl font-bold leading-tight">
            Security Design Reviews,
            <br />
            done right.
          </h2>

          <p className="text-muted-foreground mt-4 mb-8 max-w-sm">
            Get 100% Security Design Review coverage without
            scaling your security team.
          </p>

          <ul className="space-y-5 text-sm">
            <li className="flex gap-4 items-start">
              <Bot className="h-6 w-6 text-primary" />
              <span>Automate manual AppSec workflows using GenAI</span>
            </li>

            <li className="flex gap-4 items-start">
              <FileSearch className="h-6 w-6 text-primary" />
              <span>Scan architecture diagrams and design documents</span>
            </li>

            <li className="flex gap-4 items-start">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span>
                Generate security requirements with compliance mapping
              </span>
            </li>

            <li className="flex gap-4 items-start">
              <Send className="h-6 w-6 text-primary" />
              <span>Deliver clear, actionable guidance to developers</span>
            </li>
          </ul>
        </div>

        {/* Right: Auth Form */}
        <div className="p-8 flex items-center justify-center">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
