import { useParams } from 'react-router-dom';
import Table from "@/components/Table";
import Pagination from '@/components/Pagination'
import PageTitle from "@/components/layout/Title";
import NameColumn from "@/components/columns/Name";
import Tag from "@/components/Tag";
import { Link } from "react-router-dom";
import Overview from "@/components/ceremony/Overview";
import Specs from "@/components/ceremony/Spec";
import OrderColumn from "@/components/columns/Order";
import CreatedAtColumn from "@/components/columns/CreatedAt";
import DownloadIcon from "@/components/icons/Download";
import ContributionButton from "@/components/ContributionButton";
import { useEffect, useState } from 'react';
import { useFoundationContext } from '@/providers/foundation';
import { shortenHash } from '@/utils/string';
import usePaginate from '@/hooks/usePaginate';

const tableColumns = [
  {
    key: 'order',
    label: 'Order',
    classRoot: 'min-w-[48px]',
    render: (row: any) => (
      <OrderColumn
        order={row.order}
      />
    )
  },
  {
    key: 'hashes',
    label: 'Hashes',
    classRoot: 'min-w-[160px]',
    render: (row: any) => (
      <NameColumn
        name={shortenHash(row.hash, 10)}
      />
    )
  },
  {
    key: 'contribution-date',
    label: 'Contribution Date',
    classRoot: 'min-w-[140px]',
    render: (row: any) => {
      return (
        <CreatedAtColumn
          mask="dd MMM yyyy - HH:mm"
          date={row.timestamp * 1000}
        />
      )
    }
  },
  {
    key: 'type',
    label: 'Type',
    render: () => {
      return (
        <Tag
          status="external"
        />
      )
    }
  },
  {
    key: 'download',
    label: '',
    render: (row: any) => {
      return (
        <Link
          target='__blank'
          to={`https://ipfs.io/ipfs/${row.hash}/`}
          className="text-[#624BFF] text-sm text-center block"
        >
          <DownloadIcon/>
        </Link>
      )
    }
  },
]

export const CeremonyPage = () => {
  const { id } = useParams()

  const [currentPage, setCurrentPage] = useState(1)
  const [ceremony, setCeremony] = useState<null | any>(null)

  const {
    getCeremony,
    initialized,
  } = useFoundationContext()

  const {
    page,
    totalPages,
    totalItems,
  } = usePaginate({
    currentPage,
    itemsPerPage: 8,
    items: ceremony?.contributions || [],
  })

  useEffect(() => {
    if (!initialized || !id) {
      return
    }

    (async () => {
      const res = await getCeremony(id) as any

      setCeremony(res)
    })()
  }, [id, initialized, getCeremony])

  return (
    <div
      className="space-y-4"
    >
      <div
        className="flex items-center justify-between"
      >
        <PageTitle
          title="Ceremony"
        />

        {ceremony && (
          <ContributionButton />
        )}
      </div>

      {!ceremony && (
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

      {ceremony && (
        <div
          className="space-y-4 md:space-y-0 md:grid grid-cols-12 gap-6"
        >
          <Overview
            ceremony={ceremony}
          />

          <div
            className="w-full col-span-8 flex flex-col gap-4 md:gap-6"
          >
            <Specs
              ceremony={ceremony}
            />

            <div
              className="w-full"
            >
              <Table
                rows={page}
                title="Contribuitons"
                columns={tableColumns}
                classRoot="min-h-[589.38px]"
              />

              <Pagination
                totalPages={totalPages}
                totalItems={totalItems}
                currentPage={currentPage}
                itemsPerPage={page?.length || 0}
                onPageChange={(page: number | string) => {
                  setCurrentPage(page as number)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CeremonyPage;
