export function FormMessage({
  id,
  message,
}: {
  id?: string
  message: string | undefined
}) {
  return message ? (
    <p
      id={id}
      role="alert"
      className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm leading-relaxed text-destructive"
    >
      {message}
    </p>
  ) : null
}
