export const OrderColumn = ({ order }: { order: string | number }) => (
  <span
    className="text-xs md:text-sm text-[#624BFF] font-semibold"
  >
    {order}
  </span>
)

export default OrderColumn
