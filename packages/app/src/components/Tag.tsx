import { twMerge } from 'tailwind-merge'

const classes = {
  open: {
    label: 'Open',
    color: 'text-bazk-green-500',
    backgroundColor: 'bg-bazk-green-100',
  },
  finalized: {
    label: 'Finalized',
    color: 'text-bazk-red-500',
    backgroundColor: 'bg-bazk-red-100',
  },
  phala: {
    label: 'Phala',
    color: 'text-bazk-yellow-500',
    backgroundColor: 'bg-bazk-yellow-100',
  },
  external: {
    label: 'External',
    color: 'text-bazk-cyan-500',
    backgroundColor: 'bg-bazk-cyan-100',
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
