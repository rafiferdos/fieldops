interface DisposableContext {
  loseContext: () => void
}
function hasDisposal(value: unknown): value is DisposableContext {
  return (
    typeof value === "object" &&
    value !== null &&
    "loseContext" in value &&
    typeof value.loseContext === "function"
  )
}
// OGL exposes extensions as untyped values; narrow the optional disposal API at its boundary.
export function releaseWebGL(
  gl: WebGLRenderingContext | WebGL2RenderingContext
) {
  const extension: unknown = gl.getExtension("WEBGL_lose_context")
  if (hasDisposal(extension)) extension.loseContext()
}
