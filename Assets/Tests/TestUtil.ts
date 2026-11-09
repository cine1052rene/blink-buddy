import {BlinkBuddy} from "../Scripts/BlinkBuddy"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {findInteractableByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"

export const bb = (): BlinkBuddy => BlinkBuddy.instance

/** Disable the scripted demo, drop any head override, and start from Focus off. */
export async function freshStart(): Promise<void> {
  await sleep(1200)
  const b = bb()
  b.demoAutoPlay = false
  b.headPosOverride = null
  if (b.focusOn) b.setFocus(false)
  await sleep(300)
}

export async function focusOnViaToggle(): Promise<void> {
  const it = new DefaultLeafInteractor()
  await it.trigger(findInteractableByName("FocusToggle"))
  await sleep(500)
}

export function rootPos(): vec3 {
  return findSceneObjectByName("BlinkBuddyRoot").getTransform().getWorldPosition()
}

export function distFromRoot(name: string): number {
  return findSceneObjectByName(name).getTransform().getWorldPosition().distance(rootPos())
}

export function cardText(): string {
  return (findSceneObjectByName("Card").getComponent("Component.Text") as Text).text
}
