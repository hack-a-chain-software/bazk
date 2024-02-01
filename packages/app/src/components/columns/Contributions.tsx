export const ContributionsColumn = ({ contributions }: { contributions: string | number }) => (
  <span
    className="text-sm text-[#475569] font-medium text-center block items-center justify-center"
  >
    {contributions}
  </span>
)

export default ContributionsColumn
