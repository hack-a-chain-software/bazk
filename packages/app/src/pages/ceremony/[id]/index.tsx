import { useParams } from 'react-router-dom';
import Table from "@/components/Table";
import Pagination from '@/components/Pagination'
import PageTitle from "@/components/layout/Title";
import Overview from "@/components/ceremony/Overview";
import Specs from "@/components/ceremony/Spec";
import ContributionButton from "@/components/ContributionButton";
import { useEffect, useState } from 'react';
import { useFoundationContext } from '@/providers/foundation';
import usePaginate from '@/hooks/usePaginate';
import { ApiServiceContext } from '@/App';
import { contributionsTableColumns } from '@/utils/tables';
import { isBefore } from 'date-fns';
import { Downloads } from '@/components/ceremony/Downloads';

export const CeremonyPage = () => {
  const { id } = useParams()

  const [currentPage, setCurrentPage] = useState(1)
  const [ceremony, setCeremony] = useState<null | any>(null)

  const isStarted = ApiServiceContext.useSelector(state => state.matches('started'))

  const {
    getCeremony,
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
    if (!isStarted || !id) {
      return
    }

    (async () => {
      const res = await getCeremony(id) as any

      if (!res) {
        return
      }

      const isOpen = isBefore(new Date(), new Date(res.deadline * 1000))

      setCeremony({ ...res, isOpen })
    })()
  }, [id, isStarted, getCeremony])

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

        {ceremony && ceremony.isOpen && (
          <ContributionButton
            disabled={!ceremony.isOpen}
          />
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
          <div
            className='col-span-4 flex flex-col gap-4 w-full'
          >
            <Overview
              ceremony={ceremony}
            />

            <Downloads
              ceremony={ceremony}
            />
          </div>

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
                classRoot="min-h-[589.38px]"
                columns={contributionsTableColumns}
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
