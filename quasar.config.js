/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js


const { configure } = require('quasar/wrappers');
const path = require('path');
const fs = require("fs");

module.exports = configure(function (ctx) {

  require('dotenv').config()

  //console.log("======>", path.resolve(__dirname, './src/i18n/**'))

  return {


    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    //preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: [
      'i18n',
      'constants'
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: [
      'app.scss'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v5',
      // 'fontawesome-v6',
      'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
      'material-icons-outlined'
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      target: {
        browser: [ 'es2020', 'edge88', 'firefox78', 'chrome87' ],
        node: 'node16'
      },

      viteVuePluginOptions: {
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag.startsWith('webview')
          }
        }
      },

      vueRouterMode: 'hash', // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      //publicPath: '/www/',
      // analyze: true,
      env: {
        BUILD_TIMESTAMP: new Date().toISOString().split('T')[0],
        BACKEND_URL: process.env.BACKEND_URL,

        TABSETS_PWA_URL: process.env.TABSETS_PWA_URL,
        TABSETS_STAGE: process.env.STAGE,

        COUCHDB_PROTOCOL: process.env.COUCHDB_PROTOCOL,
        COUCHDB_URL: process.env.COUCHDB_URL,

        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
        STRIPE_ACCOUNT: process.env.STRIPE_ACCOUNT,
        STRIPE_API_VERSION: process.env.STRIPE_API_VERSION,
        STRIPE_SYNC_PRODUCT_LINK: process.env.STRIPE_SYNC_PRODUCT_LINK,

        LOCALE: process.env.LOCALE,

        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
        FIREBASE_MESSAGING_SENDER_ID:process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_MESSAGING_KEY: process.env.FIREBASE_MESSAGING_KEY,
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
        FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL
      },
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      // !== MIT
      extendViteConf (viteConf) {

          if ((ctx.mode.spa || ctx.mode.pwa || ctx.mode.electron) && viteConf && viteConf.mode === "development") {
            // https://dev.to/richardbray/how-to-fix-the-referenceerror-global-is-not-defined-error-in-sveltekitvite-2i49
            viteConf.define.global = {}
          }
          viteConf.define.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = 'false'

        // this caused an issue with the electron build
        // //if ((ctx.mode.spa || ctx.mode.pwa || ctx.mode.electron) && viteConf && viteConf.mode === "development") {
        // if (!ctx.mode.bex && !ctx.mode.pwa) {
        //   // https://dev.to/richardbray/how-to-fix-the-referenceerror-global-is-not-defined-error-in-sveltekitvite-2i49
        //   viteConf.define.global = {}
        //   //https://stackoverflow.com/questions/77061323/error-pouchdb-on-vite-referenceerror-global-is-not-defined
        //   //viteConf.define.window.global = window.global
        // }
        // viteConf.define.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = 'false'
      },
      // viteVuePluginOptions: {},

      vitePlugins: [
        ['@intlify/unplugin-vue-i18n/vite', {
          include: [path.resolve(__dirname, './src/i18n/**')],
        }],
        ['vite-plugin-package-version' ,{}],
        {
          name: 'vueform',
          async config() {
            return {
              optimizeDeps: {
                include: [
                  'wnumb',
                  'nouislider',
                  'trix',
                  'lodash',
                  'axios',
                ],
              },
              server: {
                watch: {
                  ignored: [`!**/node_modules/@vueform/**`],
                },
              },
            };
          },
        },
      ]
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      // https: true
      open: true // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      config: {},

      iconSet: 'eva-icons',
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: [
        'LocalStorage',
        'Dialog',
        'Meta',
        'Notify',
        'Loading',
        'LoadingBar'
      ]
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: 'all',

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   registerServiceWorker: 'src-pwa/register-service-worker',
    //   serviceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    // },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
                                          // will mess up SSR

      // extendSSRWebserverConf (esbuildConf) {},
      // extendPackageJson (json) {},

      pwa: true,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
                      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        'render' // keep this as last one
      ]
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'generateSW', // or 'injectManifest'
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
      // extendGenerateSWOptions (cfg) {}
      // extendInjectManifestOptions (cfg) {},
      // extendManifestJson (json) {}
      // extendPWACustomSWConf (esbuildConf) {}
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf)
      // extendElectronPreloadConf (esbuildConf)

      inspectPort: 5858,

      bundler: 'builder', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        protocols: [
          {
            name: 'Electron Tabsets',
            schemes: ['electron-tabsets']
          }
        ]

        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'tabsets.net',
        publish: {
          'provider': 'github',
          'private': false,
          'timeout': 480000
        }
      }
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      contentScripts: [
        'content-script',
        'my-content-script',
        'tabsets-content-script',
        'content-script-tab-helper',
        'content-script-thumbnails',
        'clipping',
        'annotation',
        'highlight-annotations'
      ],
      css: ['clipping.css']

      // extendBexScriptsConf (esbuildConf) {}
      // extendBexManifestJson (json) {}
    }
  }
});
