import { twMerge } from 'tailwind-merge'

const classes = {
  open: {
    label: 'Open',
    color: 'text-[#198754]',
    backgroundColor: 'bg-[#DCF2E9]',
  },
  finalized: {
    label: 'Finalized',
    color: 'text-[#B02A37]',
    backgroundColor: 'bg-[#F8D7DA]',
  },
  phala: {
    label: 'Phala',
    color: 'text-[#997404]',
    backgroundColor: 'bg-[#FFF3CD]',
  },
  external: {
    label: 'External',
    color: 'text-[#087990]',
    backgroundColor: 'bg-[#CFF4FC]',
  }
}

export const Tag = ({ status }: { status: 'open' | 'finalized' | 'external' | 'phala' }) => {
  return (
    <div
      className={twMerge(
        'px-2 py-1 rounded-md',
        classes[status].backgroundColor,
        'w-max flex items-center justify-center',
      )}
    >
      <span
        className={twMerge(
          classes[status].color,
          'text-xs font-semibold leading-[16.8px]',
        )}
      >
        {classes[status].label}
      </span>
    </div>
  )
}

export default Tag
