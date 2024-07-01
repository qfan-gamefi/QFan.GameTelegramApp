import { updateNetworkController } from "./chains"
import type NetworkController from "./controller"

export class PelagusController {
    public NetworkController: NetworkController
}

export const Pelagus = new PelagusController()

export default async function InitializePelagus() {
    console.log("INITIALIZED WALLET 🚀")
    updateNetworkController()
}
