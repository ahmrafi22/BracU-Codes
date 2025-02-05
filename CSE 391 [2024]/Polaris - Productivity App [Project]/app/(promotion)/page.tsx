import { Footer } from "./_components/footer"
import { Heading } from "./_components/heading"
import { Heroes } from "./_components/heros"

const PromotionPage = ()=> {
  return (
    <div className="min-h-[calc(100vh-9rem)] flex flex-col">
        <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-6 pb-10">
            <Heading />
            <Heroes />
            <Footer />
        </div>
    </div>
  )
}
export default PromotionPage