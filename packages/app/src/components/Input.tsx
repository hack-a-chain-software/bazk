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
          text-xs md:text-sm
          font-medium
          text-[#1E293B]
          leading-[140%]
        "
      >
        {label}
      </span>

      <textarea
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        className="px-4 py-3 rounded-lg border border-bazk-grey-500 text-sm h-[92px] disabled:opacity-[0.7] disabled:cursor-not-allowed"
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
          text-xs md:text-sm
          font-medium
          text-[#1E293B]
          leading-[140%]
        "
      >
        {label}
      </span>

      <input
        value={value}
        disabled={disabled}
        autoFocus={autofocus}
        placeholder={placeholder}
        className="px-4 py-3 rounded-lg border border-bazk-grey-500 text-sm disabled:opacity-[0.7] disabled:cursor-not-allowed"
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export const InputNumber = ({
  label,
  value,
  onChange,
  disabled,
  autofocus,
  placeholder,
  min = 10,
  max = 16,
}: InputInterface & {
  min?: number,
  max?: number,
}) => {
  const validatePattern = (evt: any) => {
    const newValue = evt.target.value;

    if (!evt.target.validity.valid) {
      onChange(value)

      return
    }

    if (!newValue) {
      onChange("")

      return
    }

    const startsWithZero = evt.target.value.startsWith("0")

    const newValueNumber = Number(evt.target.value)

    if (evt.target.value.length <= 1 && !startsWithZero) {
      onChange(newValueNumber.toString())

      return
    }

    if (evt.target.value.length <= 2 && startsWithZero) {
      onChange(newValueNumber.toString())

      return
    }

    if (newValue > max || newValueNumber < min) {
      onChange(value)

      return
    }

    onChange(newValueNumber.toString())
  }

  return (
    <label
      className="flex flex-col gap-2 w-full"
    >
      <span
        className="
          text-xs md:text-sm
          font-medium
          text-[#1E293B]
          leading-[140%]
        "
      >
        {label}
      </span>

      <input
        type="text"
        value={value}
        pattern="[0-9]*"
        disabled={disabled}
        autoFocus={autofocus}
        placeholder={placeholder}
        className="px-4 py-3 rounded-lg border border-bazk-grey-500 text-sm disabled:opacity-[0.7] disabled:cursor-not-allowed"
        onChange={(evt) => validatePattern(evt)}
      />
    </label>
  )
}

export default Input
