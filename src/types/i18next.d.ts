// import i18next from 'i18next'
import 'i18next'
import type translation from '@/../public/locales/en/translation.json'

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom namespace type if you changed it
    defaultNS: 'translation'
    // custom resources type
    resources: {
      translation: typeof translation
    }
  }
}
