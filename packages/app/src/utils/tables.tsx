
import Tag from "@/components/Tag";
import { Link } from "react-router-dom";
import { shortenHash } from '@/utils/string';
import NameColumn from "@/components/columns/Name";
import OrderColumn from "@/components/columns/Order";
import CreatedAtColumn from "@/components/columns/CreatedAt";
import DownloadIcon from "@/components/icons/Download";
import ContributionsColumn from "@/components/columns/Contributions";
import Status from "@/components/Tag";

export const ceremoniesTableColumns = [
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
          date={row.deadline * 1000}
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
          className="text-bazk-blue-500 text-sm text-center block"
        >
          View
        </Link>
      )
    }
  },
]

export const contributionsTableColumns = [
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
          className="text-bazk-blue-500 text-sm text-center block"
        >
          <DownloadIcon/>
        </Link>
      )
    }
  },
]
