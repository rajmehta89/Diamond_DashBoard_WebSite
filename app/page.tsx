import { DiamondGrid } from "@/components/diamond-grid"
import { Banner } from "@/components/banner"

export default function Page() {
  return (
    <main>
      <section>
        <Banner />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <DiamondGrid />
      </section>
    </main>
  )
}
