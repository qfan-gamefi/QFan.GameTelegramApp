import { secureStorage, storage } from "@/storage/storage"
import type { UNIXTime } from "@/storage/types"
import type { EncryptedVault } from "./encryption"
import logger from "./logger"

type SerializedEncryptedVault = {
  timeSaved: UNIXTime
  vault: EncryptedVault
}

type SerializedEncryptedVaults = {
  version: 1
  vaults: SerializedEncryptedVault[]
}

export const VAULT_KEY = "tallyVaults";
export const KEYRING_KEY = "Keyrings";

/**
 * Retrieve all serialized encrypted vaults from extension storage.
 *
 * @returns a schema version and array of serialized vaults
 */
export async function getEncryptedVaults(): Promise<SerializedEncryptedVaults> {
  const data = await storage.get<any>(VAULT_KEY) || {}
  logger.info("Retrieved encrypted vaults from storage", data)
  if (!("tallyVaults" in data)) {
    return {
      version: 1,
      vaults: [],
    }
  }
  const { tallyVaults } = data
  if (
    "version" in tallyVaults &&
    tallyVaults.version === 1 &&
    "vaults" in tallyVaults &&
    Array.isArray(tallyVaults.vaults)
  ) {
    return tallyVaults as SerializedEncryptedVaults
  }
  throw new Error("Encrypted vaults are using an unkown serialization format")
}

function equalVaults(vault1: EncryptedVault, vault2: EncryptedVault): boolean {
  if (vault1.salt !== vault2.salt) {
    return false
  }
  if (vault1.initializationVector !== vault2.initializationVector) {
    return false
  }
  if (vault1.cipherText !== vault2.cipherText) {
    return false
  }
  return true
}

/**
 * Write an encryptedVault to extension storage if and only if it's different
 * than the most recently saved vault.
 *
 * @param encryptedVault - an encrypted keyring vault
 */
export async function writeLatestEncryptedVault(
  encryptedVault: EncryptedVault
): Promise<void> {
  const serializedVaults = await getEncryptedVaults()
  const vaults = [...serializedVaults.vaults]
  const currentLatest = vaults.reduce<SerializedEncryptedVault | null>(
    (newestVault, nextVault) =>
      newestVault && newestVault.timeSaved > nextVault.timeSaved
        ? newestVault
        : nextVault,
    null
  )
  const oldVault = currentLatest && currentLatest.vault
  // if there's been a change, persist the vault
  if (!oldVault || !equalVaults(oldVault, encryptedVault)) {
    await storage.set(VAULT_KEY, {
      tallyVaults: {
        ...serializedVaults,
        vaults: [
          ...serializedVaults.vaults,
          {
            timeSaved: Date.now(),
            vault: encryptedVault,
          },
        ],
      },
    })
  }
}
