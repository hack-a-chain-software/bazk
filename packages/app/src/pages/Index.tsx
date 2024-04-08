import Table from "@/components/Table";
import Pagination from '@/components/Pagination'
import { useEffect, useState } from "react";
import { useFoundationContext } from "@/providers/foundation";
import usePaginate from "@/hooks/usePaginate";
import { ApiServiceContext } from "@/App";
import { ceremoniesTableColumns } from "@/utils/tables";

export const IndexPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [ceremonies, setCeremonies] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const isStarted = ApiServiceContext.useSelector(state => state.matches('started'))

  const {
    getCeremonies,
  } = useFoundationContext()

  const {
    page,
    totalPages,
    totalItems,
  } = usePaginate({
    currentPage,
    itemsPerPage: 11,
    items: ceremonies,
  })

  useEffect(() => {
    if (!isStarted) {
      return
    }

    (async () => {
      setIsLoading(true)

      const res = await getCeremonies() as any

      setCeremonies(res)
      setIsLoading(false)
    })()
  }, [isStarted, getCeremonies])

  return (
    <div
      className="min-h-[100vh]"
    >
      {!isLoading && (
        <div>
          <Table
            rows={page}
            title="Ceremonies"
            itemsKey="ceremonies"
            columns={ceremoniesTableColumns}
          />

          {ceremonies && ceremonies.length > 0 && (
            <Pagination
              totalPages={totalPages}
              totalItems={totalItems}
              currentPage={currentPage}
              itemsPerPage={page.length}
              onPageChange={(page: number | string) => {
                setCurrentPage(page as number)
              }}
            />
          )}
        </div>
      )}

      {isLoading && (
        <div
          className="
            w-full
            bg-[#1E293B]
            rounded-lg
            animate-pulse
            p-6
            flex justify-center items-center
          "
        />
      )}
    </div>
  )
}

export default IndexPage;
