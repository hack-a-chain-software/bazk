export interface InputInterface {
  label: string,
  value: string,
  disabled?: boolean,
  autofocus?: boolean,
  placeholder: string,
  onChange: (value: string | number) => void
}

export const TextArea = ({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: InputInterface) => {
  return (
    <label
      className="flex flex-col gap-2"
    >
      <span
        className="
          text-sm
          font-medium
          text-[#1E293B]
          leading-[19.6px]
        "
      >
        {label}
      </span>

      <textarea
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        className="px-4 py-3 rounded-lg border border-[#CBD5E1] text-sm h-[92px]"
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export const Input = ({
  label,
  value,
  onChange,
  disabled,
  autofocus,
  placeholder,
}: InputInterface) => {
  return (
    <label
      className="flex flex-col gap-2 w-full"
    >
      <span
        className="
          text-sm
          font-medium
          text-[#1E293B]
          leading-[19.6px]
        "
      >
        {label}
      </span>

      <input
        value={value}
        disabled={disabled}
        autoFocus={autofocus}
        placeholder={placeholder}
        className="px-4 py-3 rounded-lg border border-[#CBD5E1] text-sm"
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export default Input
