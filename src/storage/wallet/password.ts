import { storage } from "../storage"
import { getKeyfiles, getWallets } from "./index"


/**
 * Unlock wallets and save decryption key
 *
 * **Warning**: SHOULD ONLY BE CALLED FROM THE AUTH VIEW / VIEWS
 *
 * @param password Password for unlocking
 */
export async function unlock(password: string) {
  // validate password
  if (!(await checkPassword(password))) {
    return false
  }

  // save decryption key
  await storage.set("decryption_key", password)
  await storage.set("signed_in", true)

  return true
}

/**
 * Check password against decryption key
 * or try to decrypt with it.
 *
 * @param password Password to check
 */
export async function checkPassword(password: string) {
  // try to check it agains the decryption key
  const oldDecryptionKey = await storage.get("decryption_key")
  await storage.set("decryption_key", password)

  // try decrypting
  const keyfiles = await getKeyfiles()

  // No keyfiles means password did not work
  if (keyfiles.length === 0) {
    await storage.set("decryption_key", oldDecryptionKey)
    return false
  }

  try {
    return true
  } catch {
    await storage.remove("decryption_key")
    await storage.set("decryption_key", oldDecryptionKey)
    return false
  }
}

export async function signOut() {
  await storage.remove("decryption_key")
  await storage.remove("signed_in")
}
