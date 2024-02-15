export const OrderColumn = ({ order }: { order: string | number }) => (
  <span
    className="text-xs md:text-sm text-bazk-blue-500 font-semibold"
  >
    {order}
  </span>
)

export default OrderColumn
