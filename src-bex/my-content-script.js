import { bexContent } from 'quasar/wrappers'

export default bexContent((bridge) => {
    console.log("===========1")
    bridge.on('highlight.content', ({ data, respond }) => {
        alert(data)
        const el = document.querySelector(data.selector)
        if (el !== null) {
            el.classList.add('bex-highlight')
        }

        // Let's resolve the `send()` call's promise, this way we can await it on the other side then display a notification.
        respond()
    })
    console.log("===========2")
})
