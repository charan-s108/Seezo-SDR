import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image
            src="/seezo-logo.png"
            alt="Seezo"
            width={36}
            height={36}
          />
          <span>Seezo</span>
        </Link>

        <div className="ml-auto flex items-center gap-6">
        <nav className="hidden gap-6 text-sm md:flex">
        <Link
            href="#"
            className="relative text-muted-foreground hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-foreground after:transition-all hover:after:w-full"
        >
            Case Studies
        </Link>
        <Link
            href="#"
            className="relative text-muted-foreground hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-foreground after:transition-all hover:after:w-full"
        >
            Whitepapers
        </Link>
        <Link
            href="#"
            className="relative text-muted-foreground hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-foreground after:transition-all hover:after:w-full"
        >
            Use Cases
        </Link>
        <Link
            href="#"
            className="relative text-muted-foreground hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-foreground after:transition-all hover:after:w-full"
        >
            Jobs
        </Link>
        </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="cursor-pointer">
            Book a Call
            </Button>
            <Link href="/auth">
            <Button className="cursor-pointer">
                Get Started
                <ArrowRight className="h-4 w-4" />
            </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
