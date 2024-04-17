function initQuasar (bridge, quasarInstance) {
    bridge.send('quasar.detect', {
        version: quasarInstance.version,
        dark: {
            isActive: quasarInstance.dark ? quasarInstance.dark.isActive : void 0
        },
        umd: quasarInstance.umd,
        iconSet: {
            name: quasarInstance.iconSet.name,
            __installed: quasarInstance.iconSet.__installed
        },
        lang: {
            rtl: quasarInstance.lang.rtl
        }
    })
    window.__QUASAR_DEVTOOLS__ = {
        Quasar: quasarInstance
    }
}

export default function detectQuasar (bridge) {
    if (window.Quasar) { // UMD
        initQuasar(bridge, {
            version: window.Quasar.version,
            dark: window.Quasar.Dark,
            ...window.Quasar,
            umd: true
        })
    }
    else { // CLI
        let isVue3 = false
        setTimeout(() => {
            const all = document.querySelectorAll('*')
            let el
            for (let i = 0; i < all.length; i++) {
                if (all[i].__vue__ || all[i].__vue_app__) {
                    el = all[i]
                    isVue3 = all[i].__vue_app__ !== void 0
                    break
                }
            }

            if (el) {
                const Vue = isVue3 ? el.__vue_app__ : Object.getPrototypeOf(el.__vue__).constructor

                const quasar = isVue3 ? Vue.config.globalProperties.$q : Vue.prototype.$q
                if (quasar) {
                    initQuasar(bridge, quasar)
                }
            }
        }, 100)
    }
}
