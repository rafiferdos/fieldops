export function FormMessage({
  id,
  message,
}: {
  id?: string
  message: string | undefined
}) {
  return message ? (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  ) : null
}
