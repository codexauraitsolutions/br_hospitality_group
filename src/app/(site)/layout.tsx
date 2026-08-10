import { getSiteSettings, getVerticals } from '@/lib/firestore'
import NavBar from '@/components/sections/NavBar'
import Footer from '@/components/sections/Footer'
import WhatsAppFloat from '@/components/sections/WhatsAppFloat'
import ScrollToTop from '@/components/motion/ScrollToTop'

export const revalidate = 60

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, verticals] = await Promise.all([
    getSiteSettings(),
    getVerticals({ onlyLive: true }),
  ])

  return (
    <>
      <NavBar settings={settings} />
      {children}
      <Footer settings={settings} verticals={verticals} />
      {settings.toggles.showWhatsappFloat && <WhatsAppFloat whatsapp={settings.whatsapp} />}
      <ScrollToTop />
    </>
  )
}
