import Table from "@/components/Table";
import Pagination from '@/components/Pagination'
import PageTitle from "@/components/layout/Title";
import NameColumn from "@/components/columns/Name";
import ContributionsColumn from "@/components/columns/Contributions";
import Status from "@/components/Tag";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFoundationContext } from "@/providers/foundation";
import CreatedAtColumn from "@/components/columns/CreatedAt";
import usePaginate from "@/hooks/usePaginate";

const tableColumns = [
  {
    key: 'ceremonyId',
    label: 'ID',
    classRoot: 'min-w-[70px]'
  },
  {
    key: 'name',
    label: 'Circuit Name',
    classRoot: 'min-w-[190px]',
    render: (row: any) => (
      <NameColumn
        name={row.name}
      />
    )
  },
  {
    key: 'hash',
    label: 'Hash',
    classRoot: 'min-w-[160px]',
  },
  {
    key: 'deadline',
    label: 'Deadline',
    classRoot: 'min-w-[130px]',
    render: (row: any) => {
      return (
        <CreatedAtColumn
          date={row.timestamp * 1000}
        />
      )
    }
  },
  {
    key: 'status',
    label: 'Status',
    classRoot: 'min-w-[72px]',
    render: (row: any) => {
      return (
        <Status
          status={row.status as 'open' | 'finalized'}
        />
      )
    }
  },
  {
    key: 'contributions',
    label: 'Contributions',
    classRoot: 'min-w-[92px]',
    render: (row: any) => (
      <ContributionsColumn
        contributions={row.contributions}
      />
    )
  },
  {
    key: 'actions',
    label: 'Actions',
    classRoot: 'min-w-[53px]',
    render: (row: any) => {
      return (
        <Link
          to={`/ceremony/${row.ceremonyId}`}
          className="text-[#624BFF] text-sm text-center block"
        >
          View
        </Link>
      )
    }
  },
]

export const IndexPage = () => {
  const [ceremonies, setCeremonies] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const {
    initialized,
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
    if (!initialized) {
      return
    }

    (async () => {
      const res = await getCeremonies() as any

      setCeremonies(res)

      // console.log('ceremonies - ', res)
    })()
  }, [initialized, getCeremonies])

  return (
    <div
      className="min-h-[100vh]"
    >
      {ceremonies && ceremonies.length > 0 && (
        <div>
          <Table
            title = 'Ceremonies'

            rows={page}
            columns={tableColumns}
          />

          <Pagination
            totalPages={totalPages}
            totalItems={totalItems}
            currentPage={currentPage}
            itemsPerPage={page.length}
            onPageChange={(page: number | string) => {
              setCurrentPage(page as number)
            }}
          />
        </div>
      )}

      {ceremonies.length === 0 && (
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
