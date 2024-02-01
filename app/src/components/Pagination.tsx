import usePagination from "../hooks/usePagination"


export interface PaginationInterface {
  totalItems: number | string,
  currentPage: number | string,
  itemsPerPage: number | string,
  onPageChange: () => void,
}

export const Pagination = ({
  totalItems,
  // currentPage,
  // totalPages,
  // onPageChange,
  itemsPerPage,
}: PaginationInterface) => {
  const { items } = usePagination({
    totalPages: 5,
    currentPage: 3,
    // onPageChange,
  })

  return (
    <div
      className="bg-white rounded-b-lg"
    >
      <div
        className="bg-[#DEE2E6] h-[1px] mx-6"
      />

      <div
        className="px-6 py-4 rounded-b-lg flex items-center justify-between"
      >
        <div>
          <span
            className="text-sm text-[#1E293B]"
          >
            {`Showing ${itemsPerPage} of ${totalItems} Contributions`}
          </span>
        </div>

        <div>
          {JSON.stringify(items)}
        </div>
      </div>
    </div>
  )
}

export default Pagination
