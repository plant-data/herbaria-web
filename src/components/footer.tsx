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
  { role: 'Coordinator', name: 'Stefano Martellos', email: 'martelst@units.it' },
  { role: 'Secretary', name: 'Jury Nascimbene', email: 'juri.nascimbene@unibo.it' },
]

export function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  const navLinks = [
    { label: t('navbar.home', { defaultValue: 'Home' }), to: '/' as const },
    { label: t('footer.globalSearch', { defaultValue: 'Global Search' }), to: '/search' as const },
    { label: t('footer.contacts', { defaultValue: 'Contacts' }), to: '#contacts' as const },
  ]

  return (
    <footer className="border-border/60 bg-muted/20 text-muted-foreground dark:bg-muted/5 border-t text-sm">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-12 px-4 py-12 md:px-6">
        <section className="grid gap-8 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-6">
            <p className="text-muted-foreground/80 text-center text-xs font-semibold tracking-[0.18em] uppercase">
              {t('footer.partners', { defaultValue: 'University partners' })}
            </p>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-3">
              {UNIVERSITY_LOGOS.map((logo) => (
                <figure key={logo.name} className="flex flex-col items-center gap-3">
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className="h-16 w-full max-w-[8rem] object-contain opacity-80 transition hover:opacity-100"
                    loading="lazy"
                  />
                  <figcaption className="text-muted-foreground/90 text-center text-[11px] leading-snug">
                    {logo.name}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-6">
            <p className="text-muted-foreground/80 text-center text-xs font-semibold tracking-[0.18em] uppercase">
              {t('footer.support', { defaultValue: 'In collaboration with' })}
            </p>
            <div className="flex flex-1 flex-col justify-center gap-6">
              {SUPPORT_LOGOS.map((logo) => (
                <div key={logo.name} className="flex flex-col items-center gap-2">
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className="h-24 w-full max-w-[9rem] object-contain opacity-80 transition hover:opacity-100"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator className="bg-border/40 dark:bg-border/60" />

        <section className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-4">
            <h3 className="text-muted-foreground/80 text-xs font-semibold tracking-[0.18em] uppercase">
              {t('footer.about', { defaultValue: 'About' })}
            </h3>
            <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
              {t('footer.mission', {
                defaultValue:
                  'FlorItaly Herbaria aggregates university collections within the Plant Data Interuniversity Center, providing access to historic and contemporary botanical specimens.',
              })}
            </p>
          </div>

          <nav className="space-y-4">
            <h3 className="text-muted-foreground/80 text-xs font-semibold tracking-[0.18em] uppercase">
              {t('footer.mainPages', { defaultValue: 'Main pages' })}
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-foreground hover:text-primary dark:hover:text-primary text-sm font-medium transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <div className="space-y-2">
                  <span className="text-foreground text-sm font-semibold">
                    {t('footer.herbaria', { defaultValue: 'Herbaria' })}
                  </span>
                  <ul className="space-y-1">
                    {HERBARIA_CONFIG.map((herbarium) => (
                      <li key={herbarium.id}>
                        <Link
                          to="/$herbariaId/"
                          params={{ herbariaId: herbarium.id }}
                          className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm transition"
                        >
                          {t(herbarium.translationKey)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </ul>
          </nav>

          <div id="contacts" className="space-y-4">
            <h3 className="text-muted-foreground/80 text-xs font-semibold tracking-[0.18em] uppercase">
              {t('footer.contacts', { defaultValue: 'Contacts' })}
            </h3>
            <ul className="text-muted-foreground space-y-4 text-sm">
              {CONTACTS.map(({ role, name, email }) => (
                <li key={role} className="space-y-1">
                  <p className="text-muted-foreground/80 text-xs font-semibold tracking-wide uppercase">{role}</p>
                  <p className="text-foreground text-sm">{name}</p>
                  <p className="text-foreground text-sm">{email}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Separator className="bg-border/40 dark:bg-border/60" />

        <div className="text-muted-foreground flex flex-col items-start justify-between gap-4 text-xs sm:flex-row">
          <span>© {currentYear} Plant Data Interuniversity Center</span>
          <span>{t('footer.rights', { defaultValue: 'All rights reserved.' })}</span>
        </div>
      </div>
    </footer>
  )
}
