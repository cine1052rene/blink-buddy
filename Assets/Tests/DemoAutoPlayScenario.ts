import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {bb, cardText, freshStart} from "./TestUtil"

/**
 * Extra: the preview-only scripted demo. freshStart() disables demoAutoPlay (as for every scenario);
 * this one turns it back on on purpose to time the whole demo from Focus on to back-to-work.
 */
@component
export class DemoAutoPlayScenario extends Scenario {
  async run(): Promise<void> {
    await freshStart()
    expect(bb().demoAutoPlay).toBe(false)
    bb().demoAutoPlay = true
    const t0 = getTime()
    bb().setFocus(true)
    const seen: {[k: string]: number} = {}
    let backAt = -1
    let last = ""
    for (let i = 0; i < 900 && backAt < 0; i++) {
      await sleep(100)
      const s = bb().state
      if (s !== last) {
        seen[s + (seen[s] !== undefined ? "2" : "")] = getTime() - t0
        last = s
      }
      if (s === "IDLE" && cardText() === "Back to work, eyes refreshed") backAt = getTime() - t0
    }
    print(`[BBDEMO] transitions(s since Focus on): ${JSON.stringify(seen)} back-to-work=${backAt.toFixed(1)}`)
    expect(seen["CUE"] > 3.5 && seen["CUE"] < 4.8).toBe(true) // blink cue at ~4 s
    expect(seen["FLY_OUT"] > 17.5 && seen["FLY_OUT"] < 19).toBe(true) // break at ~18 s
    expect(bb().blinkCount > 0).toBe(true) // the demo logged the cue
    expect(backAt > 55 && backAt < 60).toBe(true)
    bb().demoAutoPlay = false
  }
}
