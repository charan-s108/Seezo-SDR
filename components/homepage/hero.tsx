import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section className="py-4">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Security Design Reviews for every feature your team builds
            </h1>

            <p className="mt-6 text-sm text-muted-foreground uppercase">
              Seezo provides context-specific security <br /> requirements to developers before they start coding
            </p>

            <div className="mt-10 flex gap-4">
              <Link href="/auth">
              <Button size="lg" className="gap-2 cursor-pointer">
                  Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              </Link>
              <Link href="/demo/seezo-demo.mp4" target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="cursor-pointer">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex-1">
            <Image
              src="/code-review.png"
              alt="Code Review"
              width={600}
              height={400}
              className="w-full h-auto opacity-80"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
