import Calendar from "./icons/Calendar";

export interface DatePickerInterface {
  label: string,
  value: string,
  disabled?: boolean,
  placeholder: string,
  onChange: (value: string | number) => void
}

export const DatePicker = ({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: DatePickerInterface) => {
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

      <div
        className="relative w-full"
      >
        <input
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          className="px-4 py-3 rounded-lg border border-[#CBD5E1] text-sm w-full"
          onChange={(e) => onChange(e.target.value)}
        />

        <div
          className="absolute top-1/2 -translate-y-1/2 right-3 pl-2 border-l"
        >
          <Calendar />
        </div>
      </div>
    </label>
  )
}

export default DatePicker;
