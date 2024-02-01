import * as Icons from '@/components/icons'
import { twMerge } from 'tailwind-merge';

export interface CardInterface {
  label: string;
  color: string;
  icon: Icons.IconType;
  value: string | number;
}

export const Card = ({
  icon,
  label,
  value,
  color,
}: CardInterface) => {
  const Icon = Icons[icon]

  return (
    <div
      className="
        bg-white
        py-5 px-4
        gap-5
        rounded-lg
        min-w-[150px]
        flex flex-col
      "
    >
      <div>
        <span
          className="
            text-xs
            font-medium
            leading-[12px]
            text-[#475569]
          "
        >
          {label}
        </span>
      </div>

      <div
        className="flex justify-between"
      >
        <span
          className="
            text-xl
            font-medium
            leading-[20px]
            text-[#1E293B]
          "
        >
          {value}
        </span>

        <div
          className={
            twMerge('rounded p-1.5', color)
          }
        >
          <Icon />
        </div>
      </div>
    </div>
  )
}

export default Card
