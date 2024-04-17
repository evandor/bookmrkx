// @ts-ignore
import {bexContent} from 'quasar/wrappers'


class Clipper {

  clippingArea: any
  clickedX = 0
  clickedY = 0
  left = 0
  top = 0
  width = 0
  height = 0
  private readonly crossHair: Crosshair
  private keydownCheck: KeydownCheck

  constructor() {
    this.crossHair = new Crosshair(this)
    this.keydownCheck = new KeydownCheck(this.crossHair, this)
  }

  start() {
    this.crossHair.addListener()
    document.addEventListener('mousedown', this.mousedown)
    this.keydownCheck.addListener()
  }

  mouseMoved = (e: any) => {
   // console.log("moved", e)
    this.left = (e.clientX > this.clickedX ? this.clickedX : e.clientX - 1)
    this.top = (e.clientY > this.clickedY ? this.clickedY : e.clientY - 1)
    this.width = Math.abs(e.clientX - this.clickedX)
    this.height = Math.abs(e.clientY - this.clickedY)

    this.clippingArea.style.left = this.left + 'px'
    this.clippingArea.style.top = this.top + 'px'
    this.clippingArea.style.width = this.width + 'px'
    this.clippingArea.style.height = this.height + 'px'
  }

  mouseUp = () => {
    console.log("tabsets: about to send message!")
    const msg = {
      msg: 'captureClipping',
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
      dpr: window.devicePixelRatio
    }
    console.log("sending", msg)
    chrome.runtime.sendMessage(msg, (callback) => {
      if (chrome.runtime.lastError) {
        console.warn("got runtime error", chrome.runtime.lastError)
      }
    })
    this.crossHair.remove()
    this.remove()
    this.keydownCheck.removeListener()
  }

  mousedown = (e: any) => {
    console.log("mousedown event", e)
    e.stopPropagation()
    e.preventDefault()
    this.clippingArea = document.createElement('div')
    this.clippingArea.setAttribute('class', 'clipping-area')

    this.clickedX = e.clientX
    this.clickedY = e.clientY

    document.addEventListener('mousemove', this.mouseMoved)
    document.addEventListener('mouseup', this.mouseUp)
    document.body.appendChild(this.clippingArea)
  }

  remove() {
    document.removeEventListener('mousedown', this.mousedown)
    document.removeEventListener('mousemove', this.mouseMoved)
    document.removeEventListener('mouseup', this.mouseUp)
    if (this.clippingArea && this.clippingArea.parentNode) {
      this.clippingArea.parentNode.removeChild(this.clippingArea)
    }
  }
}


class KeydownCheck {
  private ch: Crosshair
  private mt: Clipper

  constructor(ch: Crosshair, mt: Clipper) {
    this.ch = ch
    this.mt = mt
  }

  keydownEvent = (e: any) => {
    console.log("keydown", e, e.keyCode)
    if (e.keyCode === 27) {
      this.ch.remove()
      this.mt.remove()
      this.removeListener()
    }
  }

  addListener() {
    window.addEventListener('keydown', this.keydownEvent)
  }

  removeListener() {
    window.removeEventListener('keydown', this.keydownEvent)
  }
}


class Crosshair {

  //vertocal line: box starting top left with width e.clientX and border-right
  vLine: HTMLDivElement

  // horizontal line: box starting top left with height e.clientY and border-bottom
  hLine: HTMLDivElement

  guide3: HTMLDivElement

  constructor(public mt: Clipper) {
    this.vLine = document.createElement('div')
    this.hLine = document.createElement('div')
    this.guide3 = document.createElement('div')
    this.vLine.setAttribute('class', 'v-crosshair')
    this.hLine.setAttribute('class', 'h-crosshair')
    document.body.appendChild(this.guide3)
    document.body.appendChild(this.vLine)
    document.body.appendChild(this.hLine)
  }

  mouseMovedCrosshair = (e: any) => {
    const length = 20
    this.vLine.style.width = e.clientX + 'px'
    this.vLine.style.top = Math.max(0, (e.clientY - length)) + 'px'
    this.vLine.style.height = (2*length)+"px"

    this.hLine.style.height = e.clientY + 'px'
    this.hLine.style.left = Math.max(0, (e.clientX - length)) + 'px'
    this.hLine.style.width = (2*length)+"px"
  }

  addListener() {
    document.addEventListener('mousemove', this.mouseMovedCrosshair)
  }

  remove() {
    document.removeEventListener('mousemove', this.mouseMovedCrosshair)
    this.removeDiv(this.vLine)
    this.removeDiv(this.hLine)
   // this.removeDiv(this.guide3)
    this.mt.remove()
  }

  private removeDiv(element: any) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element)
    }
  }

}

export default bexContent((bridge: any) => {
  console.log("tabsets: initializing content script for clipping")
  const clipper = new Clipper()
  try {
    clipper.remove()
  } catch (e) {
  }
  clipper.start()

})
