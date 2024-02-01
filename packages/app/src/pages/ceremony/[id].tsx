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

const tableColumns = [
  {
    key: 'order',
    label: 'Order',
    render: (row: any) => (
      <OrderColumn
        order={row.order}
      />
    )
  },
  {
    key: 'hashes',
    label: 'Hashes',
    render: (row: any) => (
      <NameColumn
        name={shortenHash(row.hash, 10)}
      />
    )
  },
  {
    key: 'contribution-date',
    label: 'Contribution Date',
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
    render: () => {
      return (
        <Link
          to="#"
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

  const [ceremony, setCeremony] = useState<null | any>(null)

  const {
    getCeremony,
    initialized,
  } = useFoundationContext()

  useEffect(() => {
    if (!initialized || !id) {
      return
    }

    (async () => {
      const res = await getCeremony(id) as any

      setCeremony(res)

      console.log('ceremony - ', res)
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
          className="grid grid-cols-12 gap-6 "
        >
          <Overview
            ceremony={ceremony}
          />

          <div
            className="w-full col-span-8 flex flex-col gap-6"
          >
            <Specs
              ceremony={ceremony}
            />


            <div
              className="w-full"
            >
              <Table
                title = 'Contribuitons'
                rows={ceremony.contributions}
                columns={tableColumns}
              />

              <Pagination
                currentPage={4}
                totalItems={28}
                itemsPerPage={8}
                onPageChange={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CeremonyPage;
