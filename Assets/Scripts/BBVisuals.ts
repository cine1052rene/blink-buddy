// Small helpers that build the Blink Buddy stand-ins from primitives.
// Light, warm colours only: the Specs display is additive (black = transparent).
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"

export class Builder {
  constructor(
    private sphere: RenderMesh,
    private box: RenderMesh,
    private baseMat: Material,
  ) {}

  obj(name: string, parent: SceneObject, pos: vec3 = vec3.zero(), scale: vec3 = vec3.one()): SceneObject {
    const o = global.scene.createSceneObject(name)
    o.setParent(parent)
    o.getTransform().setLocalPosition(pos)
    o.getTransform().setLocalScale(scale)
    return o
  }

  private visual(o: SceneObject, mesh: RenderMesh, color: vec4): RenderMeshVisual {
    const v = o.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    v.mesh = mesh
    const m = this.baseMat.clone()
    m.mainPass.baseColor = color
    v.mainMaterial = m
    return v
  }

  ball(name: string, parent: SceneObject, pos: vec3, diameter: number, color: vec4): SceneObject {
    const o = this.obj(name, parent, pos, new vec3(diameter, diameter, diameter))
    this.visual(o, this.sphere, color)
    return o
  }

  slab(name: string, parent: SceneObject, pos: vec3, size: vec3, color: vec4): SceneObject {
    const o = this.obj(name, parent, pos, size)
    this.visual(o, this.box, color)
    return o
  }

  /** Thin rectangular outline made of four slabs, centred on pos, facing +Z. */
  outline(name: string, parent: SceneObject, pos: vec3, w: number, h: number, t: number, color: vec4): SceneObject {
    const g = this.obj(name, parent, pos)
    this.slab(name + "_T", g, new vec3(0, h / 2, 0), new vec3(w + t, t, t), color)
    this.slab(name + "_B", g, new vec3(0, -h / 2, 0), new vec3(w + t, t, t), color)
    this.slab(name + "_L", g, new vec3(-w / 2, 0, 0), new vec3(t, h, t), color)
    this.slab(name + "_R", g, new vec3(w / 2, 0, 0), new vec3(t, h, t), color)
    return g
  }

  text(name: string, parent: SceneObject, pos: vec3, str: string, size: number, color: vec4, w = 40, h = 8): Text {
    const o = this.obj(name, parent, pos)
    const st = o.createComponent("Component.ScreenTransform") as ScreenTransform
    void st
    const t = o.createComponent("Component.Text") as Text
    t.text = str
    t.size = size
    t.textFill.color = color
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Wrap
    t.worldSpaceRect = Rect.create(-w / 2, w / 2, -h / 2, h / 2)
    return t
  }

  /** Adds a sphere collider + SIK Interactable; calls onPinch when the target is pinched/clicked. */
  pinchable(o: SceneObject, radius: number, onPinch: () => void): Interactable {
    const col = o.createComponent("Physics.ColliderComponent") as ColliderComponent
    const s = Shape.createSphereShape()
    s.radius = radius
    col.shape = s
    col.intangible = true
    const it = o.createComponent(Interactable.getTypeName()) as Interactable
    it.onTriggerEnd.add(() => onPinch())
    return it
  }

  /** Box-shaped collider variant for flat buttons. */
  pinchableBox(o: SceneObject, size: vec3, onPinch: () => void): Interactable {
    const col = o.createComponent("Physics.ColliderComponent") as ColliderComponent
    const s = Shape.createBoxShape()
    s.size = size
    col.shape = s
    col.intangible = true
    const it = o.createComponent(Interactable.getTypeName()) as Interactable
    it.onTriggerEnd.add(() => onPinch())
    return it
  }
}

export const WARM = new vec4(1.0, 0.82, 0.3, 1)
export const SOFT = new vec4(0.85, 0.95, 1.0, 1)
export const OUTLINE = new vec4(0.45, 0.8, 1.0, 1)
export const HILL = new vec4(0.7, 0.9, 1.0, 1)
export const WHITE = new vec4(1, 1, 1, 1)
