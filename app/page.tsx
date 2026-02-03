import { Header } from "@/components/homepage/header"
import { Footer } from "@/components/homepage/footer"
import { Hero } from "@/components/homepage/hero"

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
      </main>
      <Footer />
    </>
  )
}
