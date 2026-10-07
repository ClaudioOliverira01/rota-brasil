/**
 * Linha com chave liga/desliga.
 * O estado é dito em TEXTO ("ATIVADA"/"DESATIVADA"), não só por cor,
 * e leitores de tela anunciam como "chave" ligada/desligada.
 */
export default function Switch({
  icon,
  label,
  checked,
  onText = "ATIVADO",
  offText = "DESATIVADO",
  onChange
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="switch-row"
      onClick={onChange}
    >
      <span className="switch-row__icon" aria-hidden="true">
        {icon}
      </span>

      <span className="switch-row__text">
        <span className="switch-row__label">{label}</span>
        <span className="switch-row__state">{checked ? onText : offText}</span>
      </span>

      <span className="switch-row__track" aria-hidden="true" />
    </button>
  );
}