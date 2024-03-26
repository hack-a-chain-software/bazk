import Spinner from "./icons/Spinner"

export interface ButtonInterface {
  label: string,
  type?: string,
  loading?: boolean,
  disabled?: boolean,
  onClick?: () => any
}

const SpinnerButton = () => (
  <div
    className="flex items-center justify-center w-[100px] h-[19px] mx-auto"
  >
    <Spinner />
  </div>
)

export const ButtonSecondary = ({
  label,
  disabled = false,
  onClick = () => {},
}: ButtonInterface) => (
  <button
  onClick={onClick}
  disabled={disabled}
  className="
    px-4 py-2.5 rounded-md leading-[19.6px] border border-bazk-grey-500 text-[#475569] font-semibold disabled:opacity-[0.7] disabled:cursor-not-allowed"
  >
    {label}
  </button>
)

export const ButtonSecondaryLarge = ({
  label,
  disabled = false,
  onClick = () => {},
}: ButtonInterface) => (
  <button
  onClick={onClick}
  disabled={disabled}
  className="
    text-sm md:text-base w-full px-4 py-2 md:py-3 rounded-md leading-[19.6px] border border-bazk-grey-500 text-[#475569] font-semibold disabled:opacity-[0.7] disabled:cursor-not-allowed"
  >
    {label}
  </button>
)

export const ButtonLarge = ({
  label,
  loading = false,
  disabled = false,
  onClick = () => {},
}: ButtonInterface) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="
      text-sm md:text-base w-full px-4 py-2 md:py-3 rounded-md leading-[19.6px] bg-bazk-blue-500 hover:bg-[#5340D9] text-white font-semibold disabled:opacity-[0.7] disabled:cursor-not-allowed"
  >
    {loading ? <SpinnerButton/> : label}
  </button>
)

export const Button = ({
  label,
  loading = false,
  disabled = false,
  onClick = () => {},
}: ButtonInterface) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="px-4 py-2.5 rounded-md leading-[19.6px] bg-bazk-blue-500 hover:bg-[#5340D9] text-white font-semibold disabled:opacity-[0.7] disabled:cursor-not-allowed"
    >
      {loading ? <SpinnerButton/> : label}
    </button>
  )
}

export default Button
