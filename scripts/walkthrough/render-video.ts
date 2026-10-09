import { execFile } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import { promisify } from "node:util"
import { z } from "zod"

const execute = promisify(execFile)
const directory = process.argv[2]
const destination = process.argv[3]
if (!directory || !destination)
  throw new Error(
    "Usage: node scripts/walkthrough/render-video.ts <recording-directory> <output.mp4>"
  )

// Parse only presentation facts; credentials and provider checkout URLs never enter captions.
const recording = z
  .object({
    durationSeconds: z.number().int().min(300).max(600),
    scenes: z
      .array(
        z.object({
          second: z.number().int().nonnegative(),
          title: z.string().min(1).max(128),
          explanation: z.string().min(1).max(500),
        })
      )
      .min(1)
      .max(100),
  })
  .parse(JSON.parse(await readFile(join(directory, "scenes.json"), "utf8")))
const { stdout } = await execute("ffprobe", [
  "-v",
  "error",
  "-show_entries",
  "format=duration",
  "-of",
  "default=noprint_wrappers=1:nokey=1",
  join(directory, "video.webm"),
])
const duration = z.coerce.number().positive().parse(stdout.trim())
if (duration < recording.durationSeconds)
  throw new Error(
    "The recording is shorter than its verified walkthrough timeline"
  )

function timestamp(seconds: number) {
  const milliseconds = Math.round(seconds * 1000)
  const hours = Math.floor(milliseconds / 3600000)
  const minutes = Math.floor((milliseconds % 3600000) / 60000)
  const wholeSeconds = Math.floor((milliseconds % 60000) / 1000)
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(wholeSeconds).padStart(2, "0")},${String(milliseconds % 1000).padStart(3, "0")}`
}
function wrap(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/(.{1,100})(?:\s|$)/g, "$1\n")
    .trim()
}
const captions = recording.scenes
  .map((scene, index) => {
    const end = recording.scenes[index + 1]?.second ?? recording.durationSeconds
    if (scene.second >= end || end > recording.durationSeconds)
      throw new Error(
        "Walkthrough captions must be ordered inside the verified duration"
      )
    return `${index + 1}\n${timestamp(scene.second)} --> ${timestamp(end)}\n${scene.title}\n${wrap(scene.explanation)}\n`
  })
  .join("\n")
const captionPath = resolve(directory, "captions.ass")
function assText(text: string) {
  return text
    .replaceAll("\\", "\\\\")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}")
    .replaceAll("\n", "\\N")
}
const events = recording.scenes
  .map((scene, index) => {
    const end = recording.scenes[index + 1]?.second ?? recording.durationSeconds
    const startTime = timestamp(scene.second).slice(0, -1).replace(",", ".")
    const endTime = timestamp(end).slice(0, -1).replace(",", ".")
    return `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,{\\b1}${assText(scene.title)}{\\b0}\\N${assText(wrap(scene.explanation))}`
  })
  .join("\n")
// Explicit video coordinates keep captions inside the added footer, away from application controls.
const ass = `[Script Info]
ScriptType: v4.00+
PlayResX: 1440
PlayResY: 1020
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,DejaVu Sans,22,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,2,32,32,12,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events}
`
await writeFile(resolve(directory, "captions.srt"), captions)
await writeFile(captionPath, ass)
// Escape filter syntax separately from shell syntax; execFile never invokes a shell.
const filterPath = captionPath
  .replaceAll("\\", "\\\\")
  .replaceAll(":", "\\:")
  .replaceAll("'", "'\\''")
const mobileIndex = recording.scenes.findIndex(
  (scene) => scene.title === "Responsive presentation"
)
const mobile = recording.scenes[mobileIndex]
const mobileEnd =
  recording.scenes[mobileIndex + 1]?.second ?? recording.durationSeconds
const footer = `pad=iw:ih+120:0:0:color=0x10231c,subtitles='${filterPath}'`
// Center the actual recorded narrow viewport; do not leave the recorder's empty gray canvas.
const filter = mobile
  ? `[0:v]split[base][phone];[phone]crop=390:844:0:0[viewport];[base]drawbox=color=0x10231c:t=fill:enable='between(t,${mobile.second},${mobileEnd})'[canvas];[canvas][viewport]overlay=x=(W-w)/2:y=(H-h)/2:enable='between(t,${mobile.second},${mobileEnd})',${footer}[video]`
  : `[0:v]${footer}[video]`
// Remove fixture setup lead-in, preserve every actual UI step, and add captions below the UI.
await execute(
  "ffmpeg",
  [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-ss",
    String(duration - recording.durationSeconds),
    "-i",
    join(directory, "video.webm"),
    "-t",
    String(recording.durationSeconds),
    "-filter_complex",
    filter,
    "-map",
    "[video]",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "22",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-an",
    resolve(destination),
  ],
  { maxBuffer: 1024 * 1024 }
)
console.log(
  `Rendered actual walkthrough: ${recording.durationSeconds}s, ${recording.scenes.length} scenes; silent video with English captions.`
)
