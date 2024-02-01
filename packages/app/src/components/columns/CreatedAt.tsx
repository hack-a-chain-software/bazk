import { format } from "date-fns"

export const CreatedAtColumn = ({ date, mask = 'dd MMM yyyy' }: { date: string | number, mask?: string }) => (
  <span
    className="text-sm text-[#475569]"
  >
    {format(new Date(date), mask)}
  </span>
)

export default CreatedAtColumn
