import {createI18n} from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'

// @ts-ignore
export default ({app}) => {
  const i18n = createI18n({
    locale: navigator.language.split('-')[0],
    //locale: 'ja',
    fallbackLocale: 'en',
    // missingWarn: false,
    // fallbackWarn: false,
    allowComposition: true,
    messages
  })
  app.use(i18n)
}
