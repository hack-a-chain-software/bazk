export interface ButtonInterface {
  label: string,
  onClick: () => any
}

export const ButtonSecondary = ({
  label,
  onClick,
}: ButtonInterface) => (
  <button
  onClick={onClick}
  className="
    px-4 py-2.5 rounded-md leading-[19.6px] border border-[#CBD5E1] text-[#475569] font-semibold"
  >
    {label}
  </button>
)

export const ButtonSecondaryLarge = ({
  label,
  onClick,
}: ButtonInterface) => (
  <button
  onClick={onClick}
  className="
    w-full px-4 py-3 rounded-md leading-[19.6px] border border-[#CBD5E1] text-[#475569] font-semibold"
  >
    {label}
  </button>
)

export const ButtonLarge = ({
  label,
  onClick,
}: ButtonInterface) => (
  <button
    onClick={onClick}
    className="
      w-full px-4 py-3 rounded-md leading-[19.6px] bg-[#624BFF] hover:bg-[#5340D9] text-white font-semibold"
  >
    {label}
  </button>
)

export const Button = ({
  label,
  onClick,
}: ButtonInterface) => {
  return (
    <button
    onClick={onClick}
    className="px-4 py-2.5 rounded-md leading-[19.6px] bg-[#624BFF] hover:bg-[#5340D9] text-white font-semibold"
    >
      {label}
    </button>
  )
}

export default Button
