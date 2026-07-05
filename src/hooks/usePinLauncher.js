import { useNavigate } from 'react-router-dom'
import { getLabEntry } from '../labs/labLoader.js'
import { getGameEntry } from '../games/gameLoader.js'
import { useDesktop } from '../components/desktop/DesktopProvider.jsx'

// Opens a pin (course / lab / game / nav) exactly the way the Start Menu does —
// shared so any surface that renders favourites (Start Menu, Home Page, ...)
// stays in sync instead of re-implementing this branching logic per-caller.
export function usePinLauncher() {
  const { openWindow } = useDesktop()
  const navigate = useNavigate()

  const openPin = async (pin) => {
    if (pin.type === 'course' || pin.type === 'nav') {
      if (pin.action === 'game-rules') { window.dispatchEvent(new CustomEvent('oc-game-rules')); return }
      if (pin.path) navigate(pin.path)
      return
    }

    if (pin.type === 'game') {
      if (pin.gameKey) {
        const entry = await getGameEntry(pin.gameKey)
        if (entry?.component) {
          openWindow({ id: pin.gameKey, label: pin.label, emoji: pin.emoji, Component: entry.component, backTo: '/' })
        } else if (entry?.event) {
          window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: entry.event } }))
        }
      } else if (pin.event) {
        window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: pin.event } }))
      }
      return
    }

    if (pin.type === 'lab') {
      if (pin.event) { window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: pin.event } })); return }
      if (pin.path?.startsWith('/web-learn/') || pin.path?.startsWith('/learn/')) { navigate(pin.path); return }
      if (pin.labKey) {
        const entry = await getLabEntry(pin.labKey)
        if (entry?.component) {
          openWindow({ id: pin.labKey, label: pin.label, emoji: pin.emoji, Component: entry.component, backTo: '/' })
          return
        }
      }
      if (pin.path) navigate(pin.path)
    }
  }

  return { openPin }
}
