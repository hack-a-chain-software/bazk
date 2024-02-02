import { twMerge } from "tailwind-merge";
import DefaultColumn from "./columns/Default";

export interface ColumnInterface {
  key: string;
  label: string;
  classRoot?: string
  render?: (row: any, index: number) => any
}

export interface TableInterface {
  rows: any[],
  title: string;
  columns: ColumnInterface[],
}

export const Table = ({
  rows,
  title,
  columns,
}: TableInterface) => {
  return (
    <div
      className="
        w-full
        bg-white
        rounded-t-lg
        space-y-3 md:space-y-6
        px-4 md:px-6 md:pt-6 pt-3
      "
    >
      <div>
        <h2
          className="md:text-lg font-semibold text-[#1E293B] md:tracking-[0.36px]"
        >
          {title}
        </h2>
      </div>

      <div
        className="rounded-t-lg overflow-x-auto"
      >
        <table className="table-auto w-full">
          <thead
            className="bg-[#F1F5F9]"
          >
            <tr>
              {columns && columns.map(({ key, label, classRoot }) => {
                return (
                  <th
                    className={twMerge(
                      'text-left p-3 md:p-4 text-xs md:text-sm font-semibold',
                      classRoot
                    )}
                    key={`table-column-${key}`}
                  >
                    {label}
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody
            className="divide-y-[1px] divide-[#DEE2E6]"
          >
            {rows && rows.map((row, index) => {
              const rowKey = `table-row-${index}`

              return (
                <tr
                  key={rowKey}
                >
                  {columns && columns.map(({ render, key }) => {
                    return (
                      <td
                        className="p-3 md:p-4"
                        key={`${rowKey}-column-${key}`}
                      >
                        {render ? render(row, index) : DefaultColumn(row[key] || '')}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table;
