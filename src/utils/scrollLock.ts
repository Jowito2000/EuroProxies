let lockCount = 0
let prevOverflow = ''
let prevPad = ''

export function lockScroll() {
  if (typeof document === 'undefined') return
  if (lockCount === 0) {
    prevOverflow = document.body.style.overflow
    prevPad = document.body.style.paddingRight
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarW > 0) {
      document.body.style.paddingRight = `${scrollbarW}px`
    }
  }
  lockCount++
}

export function unlockScroll() {
  if (typeof document === 'undefined') return
  lockCount--
  if (lockCount <= 0) {
    lockCount = 0
    document.body.style.overflow = prevOverflow
  }
}
