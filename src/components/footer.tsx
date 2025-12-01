import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Separator } from '@/components/ui/separator'
import { HERBARIA_CONFIG } from '@/features/search/constants/herbaria'
import { BASE_PATH } from '@/config'

const LOGO_BASE_PATH = `${BASE_PATH}images/uni-loghi/`
const ORGANIZATION_BASE_PATH = `${BASE_PATH}images/org-loghi/`

const UNIVERSITY_LOGOS = [
  { name: 'Università degli Studi di Trieste', src: `${LOGO_BASE_PATH}units.png` },
  { name: 'Sapienza Università di Roma', src: `${LOGO_BASE_PATH}sap-full.png` },
  { name: 'Università di Camerino', src: `${LOGO_BASE_PATH}cam-full.png` },
  { name: 'Università di Perugia', src: `${LOGO_BASE_PATH}perugia-full.svg` },
  { name: 'Università di Bologna', src: `${LOGO_BASE_PATH}unibo.png` },
  { name: 'Università di Pisa', src: `${LOGO_BASE_PATH}pisa-full.png` },
]

const SUPPORT_LOGOS = [{ name: 'LifeWatch Italia', src: `${ORGANIZATION_BASE_PATH}lw-ita.png` }]

const MAIN_LOGO = { name: 'Plant Data Interuniversity Center', src: `${ORGANIZATION_BASE_PATH}plantdata.png` }

const CONTACTS = [
  { roleKey: 'footer.coordinator' as const, name: 'Stefano Martellos', email: 'martelst@units.it' },
  { roleKey: 'footer.secretary' as const, name: 'Jury Nascimbene', email: 'juri.nascimbene@unibo.it' },
]

interface Logo {
  name: string
  src: string
}

export function Footer() {
  return (
    <footer className="border-border/60 bg-muted/20 text-muted-foreground dark:bg-muted/40 @container/footer mt-16 border-t text-sm">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-12 px-4 py-12 @md/footer:px-6">
        <PartnersSection />
        <Separator className="bg-border/40 dark:bg-border/60" />
        <section className="mx-auto grid gap-10 @2xl/footer:grid-cols-[3fr_3fr_2fr]">
          <AboutSection />
          <NavigationSection />
          <ContactsSection />
        </section>
        <Separator className="bg-border/40 dark:bg-border/60" />
        <FooterBottom />
      </div>
    </footer>
  )
}

function LogoGrid({ logos, title }: { logos: Array<Logo>; title: string }) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground/80 text-center text-xs font-semibold tracking-[0.18em] uppercase">{title}</p>
      <div className="grid grid-cols-2 gap-6 @4xl/footer:grid-cols-3">
        {logos.map((logo) => (
          <figure key={logo.name} className="flex flex-col items-center gap-3">
            <img
              src={logo.src}
              alt={logo.name}
              className="h-16 w-full max-w-32 object-contain opacity-100 transition hover:opacity-80"
              loading="lazy"
            />
            <figcaption className="text-muted-foreground/90 text-center text-[11px] leading-snug">
              {logo.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

function SupportLogos({ logos, title }: { logos: Array<Logo>; title: string }) {
  return (
    <div className="flex flex-col space-y-6">
      <p className="text-muted-foreground/80 text-center text-xs font-semibold tracking-[0.18em] uppercase">{title}</p>
      <div className="flex flex-1 flex-col justify-center gap-6">
        {logos.map((logo) => (
          <div key={logo.name} className="flex flex-col items-center gap-2">
            <img
              src={logo.src}
              alt={logo.name}
              className="h-24 w-full max-w-36 object-contain opacity-100 transition hover:opacity-80"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function PartnersSection() {
  const { t } = useTranslation()

  return (
    <section className="grid gap-16 @4xl/footer:grid-cols-[4fr_2fr] @4xl/footer:gap-8">
      <LogoGrid logos={UNIVERSITY_LOGOS} title={t('footer.partners', { defaultValue: 'University partners' })} />
      <SupportLogos logos={SUPPORT_LOGOS} title={t('footer.support', { defaultValue: 'In collaboration with' })} />
    </section>
  )
}

function AboutSection() {
  return (
    <div className="mt-1 flex w-full items-start justify-center">
      <img
        src={MAIN_LOGO.src}
        alt={MAIN_LOGO.name}
        className="h-30 object-contain opacity-100 transition hover:opacity-80 dark:invert-100"
        loading="lazy"
      />
    </div>
  )
}

function NavigationSection() {
  const { t } = useTranslation()

  return (
    <nav className="space-y-4">
      <h3 className="text-muted-foreground/80 text-xs font-semibold tracking-[0.18em] uppercase">
        {t('footer.mainPages', { defaultValue: 'Navigate' })}
      </h3>

      <ul className="space-y-1">
        {/* home */}
        <li>
          <Link to="/" className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm transition">
            {t('footer.home', { defaultValue: 'Home' })}
          </Link>
        </li>
        <li>
          <Link
            to="/$herbariaId/images"
            params={{ herbariaId: 'all' }}
            className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm transition"
          >
            {t('footer.allHerbaria', { defaultValue: 'All Herbaria' })}
          </Link>
        </li>
        {HERBARIA_CONFIG.map((herbarium) => (
          <li key={herbarium.id}>
            <Link
              to="/$herbariaId"
              params={{ herbariaId: herbarium.id }}
              className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm transition"
            >
              {t(herbarium.translationKey)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function ContactsSection() {
  const { t } = useTranslation()

  return (
    <div id="contacts" className="space-y-4">
      <h3 className="text-muted-foreground/80 text-xs font-semibold tracking-[0.18em] uppercase">
        {t('footer.contacts', { defaultValue: 'Contacts' })}
      </h3>
      <ul className="text-muted-foreground space-y-4 text-sm">
        {CONTACTS.map(({ roleKey, name, email }) => (
          <li key={roleKey} className="space-y-1">
            <p className="text-muted-foreground/80 text-xs font-semibold tracking-wide uppercase">{t(roleKey)}</p>
            <p className="text-foreground/80 text-sm">{name}</p>
            <p className="text-foreground/80 text-sm">{email}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FooterBottom() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="text-muted-foreground flex w-full items-center justify-center gap-1 text-xs">
      <span>{currentYear} Plant Data Interuniversity Center</span>
    </div>
  )
}
