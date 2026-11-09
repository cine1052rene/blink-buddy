import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import {Criterion1Scenario} from "./Criterion1Scenario"
import {Criterion2Scenario} from "./Criterion2Scenario"
import {Criterion3Scenario} from "./Criterion3Scenario"
import {Criterion4Scenario} from "./Criterion4Scenario"
import {Criterion5Scenario} from "./Criterion5Scenario"
import {Criterion6Scenario} from "./Criterion6Scenario"
import {DemoAutoPlayScenario} from "./DemoAutoPlayScenario"

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {id: "c1-focus-on-shows-firefly-and-window", typename: Criterion1Scenario.getTypeName()},
    {id: "c2-blink-cue-and-pinch-count", typename: Criterion2Scenario.getTypeName()},
    {id: "c3-skip-starts-break-20s-timer", typename: Criterion3Scenario.getTypeName()},
    {id: "c4-figure-eight-then-back-to-work", typename: Criterion4Scenario.getTypeName()},
    {id: "c5-walking-fades-and-pauses", typename: Criterion5Scenario.getTypeName()},
    {id: "c6-focus-off-hides-everything", typename: Criterion6Scenario.getTypeName()},
    {id: "x7-demo-autoplay-timeline", typename: DemoAutoPlayScenario.getTypeName()},
  ]
}
