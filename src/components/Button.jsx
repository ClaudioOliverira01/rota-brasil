/**
 * Botão grande do design system.
 *
 * variant: "primary" (verde) | "secondary" (laranja) | "light" (branco)
 * size:    "lg" | "md" | "sm"
 * icon:    emoji decorativo (não é lido por leitores de tela)
 */
export default function Button({
  children,
  icon,
  variant = "primary",
  size = "lg",
  type = "button",
  disabled = false,
  onClick,
  ...rest
}) {
  const className = ["btn", `btn--${variant}`, `btn--${size}`].join(" ");

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {icon ? (
        <span className="btn__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="btn__label">{children}</span>
    </button>
  );
}