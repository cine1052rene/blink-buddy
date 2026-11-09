import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName} from "Leaf.lspkg/Utils/common/Utils"
import {bb, distFromRoot, focusOnViaToggle, freshStart} from "./TestUtil"

/** Criterion 1: Focus on shows the firefly beside the monitor and the window ~6 m away. */
@component
export class Criterion1Scenario extends Scenario {
  async run(): Promise<void> {
    await freshStart()
    expect(bb().focusOn).toBe(false)
    await focusOnViaToggle()
    expect(bb().focusOn).toBe(true)
    expect(findSceneObjectByName("Firefly").isEnabledInHierarchy).toBe(true)
    expect(findSceneObjectByName("StandInMonitor").isEnabledInHierarchy).toBe(true)
    expect(findSceneObjectByName("StandInWindow").isEnabledInHierarchy).toBe(true)
    const w = distFromRoot("StandInWindow")
    expect(w > 580 && w < 680).toBe(true) // ~6 m (650 cm straight-line: 6 m ahead, 2.5 m to the left)
    const f = distFromRoot("Firefly")
    expect(f > 65 && f < 85).toBe(true)
  }
}
