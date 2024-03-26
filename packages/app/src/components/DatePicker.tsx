import Calendar from "./icons/Calendar";
// @ts-expect-error
import DatePickerCalendar from "react-datepicker";

import "../datepicker.css";
import { twMerge } from "tailwind-merge";

export interface DatePickerInterface {
  label: string,
  value: Date,
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
        className={
          twMerge("relative w-full", disabled && "opacity-[0.7] cursor-not-allowed")
        }
      >
        {!value && (
          <span
            className="text-sm absolute top-1/2 left-4 -translate-y-1/2 opacity-[0.4]"
          >
            {placeholder}
          </span>
        )}

        <DatePickerCalendar
          selected={value}
          disabled={disabled}
          placeholder={placeholder}
          className="px-4 py-3 rounded-lg border border-bazk-grey-500 text-sm w-full"
          onChange={(date: any) => onChange(date)}
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
