"use client"

import { Renderer, Program, Mesh, Color, Triangle, RenderTarget } from "ogl"
import { useEffect, useRef, type CSSProperties } from "react"

import "./strands.css"

import {
  MAX_STRANDS,
  MAX_COLORS,
  VERT,
  FRAG,
  GLASS_FRAG,
} from "./strands.shaders"
import { releaseWebGL } from "./webgl-lifecycle"
export interface StrandsProps {
  colors?: string[]
  count?: number
  speed?: number
  amplitude?: number
  waviness?: number
  thickness?: number
  glow?: number
  taper?: number
  spread?: number
  hueShift?: number
  intensity?: number
  saturation?: number
  opacity?: number
  scale?: number
  glass?: boolean
  refraction?: number
  dispersion?: number
  glassSize?: number
  className?: string
  style?: CSSProperties
}

const buildPalette = (colors: string[]): number[][] => {
  const filled = colors && colors.length ? colors : ["#ffffff"]
  const padded: number[][] = []
  for (let i = 0; i < MAX_COLORS; i++) {
    const hex = filled[i] ?? filled[filled.length - 1] ?? "#ffffff"
    const c = new Color(hex)
    padded.push([c.r, c.g, c.b])
  }
  return padded
}

export default function Strands({
  colors = ["#059669", "#6366f1", "#d97706"],
  count = 3,
  speed = 0.5,
  amplitude = 1,
  waviness = 1,
  thickness = 0.7,
  glow = 2.6,
  taper = 3,
  spread = 1,
  hueShift = 0,
  intensity = 0.6,
  saturation = 1.5,
  opacity = 1,
  scale = 1.5,
  glass = false,
  refraction = 1,
  dispersion = 1,
  glassSize = 1,
  className = "",
  style,
}: StrandsProps) {
  const propsRef = useRef<Required<Omit<StrandsProps, "className" | "style">>>({
    colors,
    count,
    speed,
    amplitude,
    waviness,
    thickness,
    glow,
    taper,
    spread,
    hueShift,
    intensity,
    saturation,
    opacity,
    scale,
    glass,
    refraction,
    dispersion,
    glassSize,
  })
  useEffect(() => {
    propsRef.current = {
      colors,
      count,
      speed,
      amplitude,
      waviness,
      thickness,
      glow,
      taper,
      spread,
      hueShift,
      intensity,
      saturation,
      opacity,
      scale,
      glass,
      refraction,
      dispersion,
      glassSize,
    }
  })

  const ctnDom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctn = ctnDom.current
    if (!ctn) return

    let renderer: Renderer
    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        powerPreference: "low-power",
      })
    } catch {
      ctn.dataset.gpu = "unavailable"
      return
    }
    if (
      typeof WebGL2RenderingContext === "undefined" ||
      !(renderer.gl instanceof WebGL2RenderingContext)
    ) {
      releaseWebGL(renderer.gl)
      return
    }
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.canvas.style.backgroundColor = "transparent"

    const geometry = new Triangle(gl)
    if (geometry.attributes.uv) {
      delete geometry.attributes.uv
    }

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
      uColors: { value: buildPalette(propsRef.current.colors) },
      uColorCount: {
        value: Math.min(propsRef.current.colors.length, MAX_COLORS),
      },
      uStrandCount: { value: Math.min(propsRef.current.count, MAX_STRANDS) },
      uSpeed: { value: speed },
      uAmplitude: { value: amplitude },
      uWaviness: { value: waviness },
      uThickness: { value: thickness },
      uGlow: { value: glow },
      uTaper: { value: taper },
      uSpread: { value: spread },
      uHueShift: { value: hueShift },
      uIntensity: { value: intensity },
      uOpacity: { value: opacity },
      uScale: { value: scale },
      uSaturation: { value: saturation },
    }
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: uniforms,
    })

    const mesh = new Mesh(gl, { geometry, program })

    const renderTarget = new RenderTarget(gl, {
      width: ctn.offsetWidth,
      height: ctn.offsetHeight,
    })

    const glassUniforms = {
      uScene: { value: renderTarget.texture },
      uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
      uRadius: { value: 0.46 * glassSize },
      uRefraction: { value: refraction },
      uDispersion: { value: dispersion },
    }
    const glassProgram = new Program(gl, {
      vertex: VERT,
      fragment: GLASS_FRAG,
      uniforms: glassUniforms,
    })
    const glassMesh = new Mesh(gl, { geometry, program: glassProgram })

    ctn.appendChild(gl.canvas)

    function resize() {
      if (!ctn) return
      const width = ctn.offsetWidth
      const height = ctn.offsetHeight
      renderer.setSize(width, height)
      uniforms.uResolution.value = [width, height]
      renderTarget.setSize(width, height)
      glassUniforms.uResolution.value = [width, height]
    }
    const sizeObserver = new ResizeObserver(resize)
    sizeObserver.observe(ctn)
    resize()

    let animateId = 0
    let visible = false
    let lost = false
    let clock = 0,
      last = 0
    // Offscreen and background tabs perform no rendering work.

    const update = (t: number) => {
      animateId = 0
      if (!visible || document.hidden || lost) return
      const current = propsRef.current
      clock += Math.min(0.05, Math.max(0, (t - last) / 1000))
      last = t
      uniforms.uTime.value = clock

      uniforms.uColorCount.value = Math.min(current.colors.length, MAX_COLORS)
      uniforms.uStrandCount.value = Math.min(
        Math.max(Math.round(current.count), 1),
        MAX_STRANDS
      )
      uniforms.uSpeed.value = current.speed
      uniforms.uAmplitude.value = current.amplitude
      uniforms.uWaviness.value = current.waviness
      uniforms.uThickness.value = current.thickness
      uniforms.uGlow.value = current.glow
      uniforms.uTaper.value = current.taper
      uniforms.uSpread.value = current.spread
      uniforms.uHueShift.value = current.hueShift
      uniforms.uIntensity.value = current.intensity
      uniforms.uOpacity.value = current.opacity
      uniforms.uScale.value = current.scale
      uniforms.uSaturation.value = current.saturation

      if (current.glass) {
        renderer.render({ scene: mesh, target: renderTarget })
        glassUniforms.uScene.value = renderTarget.texture
        glassUniforms.uRefraction.value = current.refraction
        glassUniforms.uDispersion.value = current.dispersion
        glassUniforms.uRadius.value = 0.46 * current.glassSize
        renderer.render({ scene: glassMesh })
      } else {
        renderer.render({ scene: mesh })
      }
      animateId = requestAnimationFrame(update)
    }
    const start = () => {
      if (!animateId && visible && !document.hidden && !lost) {
        last = performance.now()
        animateId = requestAnimationFrame(update)
      }
    }
    const visibility = () => {
      cancelAnimationFrame(animateId)
      animateId = 0
      start()
    }
    const visibleObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      visibility()
    })
    visibleObserver.observe(ctn)
    document.addEventListener("visibilitychange", visibility)
    const contextLost = () => {
      lost = true
      cancelAnimationFrame(animateId)
      animateId = 0
      ctn.dataset.gpu = "lost"
      gl.canvas.remove()
    }
    gl.canvas.addEventListener("webglcontextlost", contextLost)

    return () => {
      gl.canvas.removeEventListener("webglcontextlost", contextLost)
      cancelAnimationFrame(animateId)
      sizeObserver.disconnect()
      visibleObserver.disconnect()
      document.removeEventListener("visibilitychange", visibility)
      if (ctn && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas)
      }
      geometry.remove()
      program.remove()
      glassProgram.remove()
      gl.deleteFramebuffer(renderTarget.buffer)
      renderTarget.textures.forEach((texture) =>
        gl.deleteTexture(texture.texture)
      )
      releaseWebGL(gl)
    }
  }, [
    colors,
    speed,
    amplitude,
    waviness,
    thickness,
    glow,
    taper,
    spread,
    hueShift,
    intensity,
    opacity,
    scale,
    saturation,
    glassSize,
    refraction,
    dispersion,
  ])

  return (
    <div
      ref={ctnDom}
      className={`strands-container ${className}`}
      style={style}
    />
  )
}
