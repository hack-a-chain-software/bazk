import Table from "@/components/Table";
import Pagination from '@/components/Pagination'
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFoundationContext } from "@/providers/foundation";
import { ApiServiceContext } from "@/App";
import { ceremoniesTableColumns } from "@/utils/tables";

const limit = 11
const totalCount = 1;

export const IndexPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [ceremonies, setCeremonies] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = useMemo(() => Math.max(Math.ceil(totalCount / limit), 1), [])

  const isStarted = ApiServiceContext.useSelector(state => state.matches('started'))

  const {
    getCeremonies,
  } = useFoundationContext()

  const fetch = useCallback(async (page: number) => {
    if (!getCeremonies) {
      return
    }

    setIsLoading(true)

    const res = await getCeremonies(page, 11) as any

    setCeremonies(res)
    setIsLoading(false)
  }, [getCeremonies])

  useEffect(() => {
    if (!isStarted || currentPage !== 1) {
      return
    }

    fetch(currentPage)
  }, [isStarted, currentPage, fetch])

  return (
    <div
      className="min-h-[100vh]"
    >
      {!isLoading && (
        <div>
          <Table
            rows={ceremonies}
            title="Ceremonies"
            itemsKey="ceremonies"
            columns={ceremoniesTableColumns}
          />

          {ceremonies && ceremonies.length > 0 && (
            <Pagination
              totalPages={totalPages}
              totalItems={ceremonies.length}
              currentPage={currentPage}
              itemsPerPage={limit}
              onPageChange={(page: number | string) => {
                setCurrentPage(page as number)

                if (page === 1) {
                  return
                }

                fetch(page as number)
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
