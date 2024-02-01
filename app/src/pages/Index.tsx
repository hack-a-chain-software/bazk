import Table from "@/components/Table";
import Pagination from '@/components/Pagination'
import PageTitle from "@/components/layout/Title";
import NameColumn from "@/components/columns/Name";
import ContributionsColumn from "@/components/columns/Contributions";
import Status from "@/components/Tag";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFoundationContext } from "@/providers/foundation";

export const IndexPage = () => {
  const mockColumns = [
    {
      key: 'ceremonyId',
      label: 'ID',
    },
    {
      key: 'name',
      label: 'Circuit Name',
      render: (row: any) => (
        <NameColumn
          name={row.name}
        />
      )
    },
    {
      key: 'hash',
      label: 'Hash',
    },
    {
      key: 'deadline',
      label: 'Deadline',
    },
    {
      key: 'status',
      label: 'Status',
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
      render: (row: any) => (
        <ContributionsColumn
          contributions={row.contributions}
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
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

  const [ceremonies, setCeremonies] = useState([])

  const {
    initialized,
    getCeremonies,
  } = useFoundationContext()


  useEffect(() => {
    if (!initialized) {
      return
    }

    (async () => {
      const res = await getCeremonies() as any

      setCeremonies(res)

      console.log('ceremonies - ', res)
    })()
  }, [initialized, getCeremonies])

  return (
    <div
      className="space-y-4"
    >
      <PageTitle
        title="Dashboard"
      />

      {ceremonies && ceremonies.length > 0 && (
        <div>
          <Table
            title = 'Ceremonies'

            rows={ceremonies}
            columns={mockColumns}
          />

          <Pagination
            currentPage={4}
            totalItems={28}
            itemsPerPage={8}
            onPageChange={() => {}}
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
