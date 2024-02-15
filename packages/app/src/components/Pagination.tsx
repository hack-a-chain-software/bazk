import { ReactNode } from "react"
import usePagination from "../hooks/usePagination"
import { twMerge } from "tailwind-merge"
import Chevron from "./icons/Chevron"

export const PageButton = ({
  children,
  className = '',
  isActive = false,
  onClick = () => {},
}: { children: ReactNode, onClick?: any, isActive: boolean, className?: string }) => (
  <button
    onClick={onClick}
    className={
      twMerge(
        'text-sm text-[#64748B] leading-[19.6px]',
        'py-2 px-3 rounded-md hover:bg-bazk-blue-500 hover:text-white',
        isActive && 'text-white bg-bazk-blue-500',
        className,
      )
    }
  >
    {children}
  </button>
)

export interface PaginationInterface {
  totalPages: number,
  currentPage: number,
  totalItems: number | string,
  itemsPerPage: number | string,
  onPageChange: (page: number | string) => void,
}

export const Pagination = ({
  totalPages,
  totalItems,
  currentPage,
  onPageChange,
  itemsPerPage,
}: PaginationInterface) => {
  const { items } = usePagination({
    totalPages,
    currentPage,
  })

  return (
    <div
      className="bg-white rounded-b-lg"
    >
      <div
        className="bg-bazk-grey-400 h-[1px] mx-6"
      />

      <div
        className="px-4 md:px-6 py-4 rounded-b-lg flex items-center justify-between"
      >
        <div>
          <span
            className="text-xs md:text-sm text-[#1E293B]"
          >
            {`Showing ${itemsPerPage} of ${totalItems} Contributions`}
          </span>
        </div>

        {totalPages > 1 && (
          <div
            className="flex items-center justify-center gap-2"
          >
            {items.map((page: any) => {
              if (['next', 'prev'].includes(page as string)) {
                return (
                  <PageButton
                    className="px-2"
                    key={`pagination-${page}`}
                    isActive={currentPage === page}
                    onClick={() => {
                      const nextPage = page === 'prev'
                        ? Math.max(currentPage - 1, 1)
                        : Math.min(currentPage + 1, totalPages)

                        onPageChange(nextPage)
                    }}
                  >
                    <Chevron
                      className={page === 'next' ? 'rotate-180' : ''}
                    />
                  </PageButton>
                )
              }

              if (page === 'ellipsis-left' || page === 'ellipsis-right') {
                return (
                  <div
                    key={`pagination-${page}`}
                  >
                    ...
                  </div>
                )
              }

              return (
                <PageButton
                  key={`pagination-${page}`}
                  isActive={currentPage === page}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PageButton>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Pagination
