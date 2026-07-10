/**
 * Control segmentado compacto (`.ed-seg`): una opción activa entre 2–5, con
 * `title`+`aria-label` describiendo cada una. `icon` admite un `<Icon>` del
 * sistema propio o un texto corto («Sutiles», «½»…). Extraído de `ScreenEditor`
 * (plan UX fase 8) para reutilizarlo en Apariencia, puzzle, etc.
 */
export function SegIcons({ label, value, options, onChange, disabled = false }: {
  label: string
  value: string
  options: { value: string; icon: React.ReactNode; title: string }[]
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className="ed-field ed-field-auto">
      <span>{label}</span>
      <div className="ed-seg" role="group" aria-label={label}>
        {options.map((o) => (
          <button key={o.value} type="button" className={value === o.value ? 'is-on' : ''}
            aria-pressed={value === o.value} title={o.title} aria-label={o.title}
            disabled={disabled} onClick={() => onChange(o.value)}>
            <span aria-hidden="true">{o.icon}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
