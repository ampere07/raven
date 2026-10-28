const STORAGE_KEY = 'little-things-owner'
const KEY_FORMAT = /^[a-f0-9]{64}$/

const createKey = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, '0')).join('')

let fallback: string | undefined

// A random secret that identifies this browser to the server. It is made once and kept, and it is the only thing
// that lets someone read or change the answers saved from here.
export function getOwnerKey(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && KEY_FORMAT.test(stored)) return stored
    const fresh = createKey()
    localStorage.setItem(STORAGE_KEY, fresh)
    return fresh
  } catch {
    // Storage is blocked (some private windows): answers then last only until the page is closed.
    return (fallback ??= createKey())
  }
}
