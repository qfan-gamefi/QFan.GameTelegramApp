
import type { Address } from "./index"
import { setActiveAddressByShard } from "./index"
import { storage } from "../storage"
import { QUAI_CONTEXTS } from "@/services/network/chains"


/**
 * Update active shard
 *
 * @param shard Updated active shard
 */
export async function setActiveShard(shard: string) {
  if (!shard) {
    throw new Error("Shard is required")
  }

  // save new active shard
  await storage.set("active_shard", shard)
  await setActiveAddressByShard(shard)
}

export const getQuaiContextForLocation = (latitude: number, longitude: number) => {
  if (longitude >= -168.2 && longitude <= -70.2) {
    // Americas: cyprus-1
    return QUAI_CONTEXTS.find((context) => context.shard === "cyprus-1")
  } else if (longitude > -70.2 && longitude <= -34.8) {
    // Americas: cyprus-2
    return QUAI_CONTEXTS.find((context) => context.shard === "cyprus-2")
  } else if (longitude > -34.8 && longitude <= 0) {
    // Europe & Africa: paxos-1
    return QUAI_CONTEXTS.find((context) => context.shard === "paxos-1")
  } else if (longitude > 0 && longitude <= 34.7) {
    // Europe & Africa: paxos-2
    return QUAI_CONTEXTS.find((context) => context.shard === "paxos-2")
  } else if (longitude > 34.7 && longitude <= 69.2) {
    // Europe & Africa: paxos-3
    return QUAI_CONTEXTS.find((context) => context.shard === "paxos-3")
  } else if (longitude > 69.2 && longitude <= 119.7) {
    // Asia: hydra-1
    return QUAI_CONTEXTS.find((context) => context.shard === "hydra-1")
  } else if (longitude > 119.7 && longitude <= 170.2) {
    // Asia: hydra-2
    return QUAI_CONTEXTS.find((context) => context.shard === "hydra-2")
  } else if (longitude > 170.2 && longitude <= 180) {
    // Asia: hydra-3
    return QUAI_CONTEXTS.find((context) => context.shard === "hydra-3")
  } else {
    throw new Error("Invalid longitude")
  }
}

export const getDefaultQuaiContext = () => QUAI_CONTEXTS.find((context) => context.shard === "cyprus-1");

export const sortAddressesByActiveShard = (
  addresses: Address[],
  activeShard: string
): Address[] => {
  // Split the shard string to get the base name (i.e., "hydra" from "hydra-2")
  const activeBase = activeShard.split("-")[0]

  // Make a copy of the addresses array
  const addressesCopy = addresses.slice()

  // Sort addressesCopy
  return addressesCopy.sort((a, b) => {
    const aBase = a.shard.split("-")[0]
    const bBase = b.shard.split("-")[0]

    // Prioritize active shard
    if (a.shard === activeShard) return -1
    if (b.shard === activeShard) return 1

    // Prioritize shards with same base as active shard
    if (aBase === activeBase && bBase !== activeBase) return -1
    if (bBase === activeBase && aBase !== activeBase) return 1

    // Keep original order for everything else
    return 0
  })
}

const SHARD_COUNTRY_MAPPING: any = {
  "cyprus-1": ["Canada", "United States", "Mexico", "Central America"],
  "cyprus-2": ["South America"],
  "paxos-1": ["Western Africa", "Western Europe"],
  "paxos-2": ["Central Africa", "Eastern Europe"],
  "paxos-3": ["Eastern Africa", "Middle East"],
  "hydra-1": ["South Asia", "Central Asia"],
  "hydra-2": ["East Asia"],
  "hydra-3": ["Australia", "New Zealand"]
}

export const getCountriesForContext = (shard: string) => {
  // return the list of countries for the given shard
  return SHARD_COUNTRY_MAPPING[shard];
}
