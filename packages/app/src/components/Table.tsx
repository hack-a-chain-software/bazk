import { twMerge } from "tailwind-merge";
import DefaultColumn from "./columns/Default";
import EmptyList from "./icons/EmptyList";

export interface ColumnInterface {
  key: string;
  label: string;
  classRoot?: string
  render?: (row: any, index: number) => any
}

export interface TableInterface {
  rows: any[],
  title: string;
  itemsKey?: string;
  classRoot?: string;
  columns: ColumnInterface[],
}

export const Table = ({
  rows,
  title,
  columns,
  classRoot,
  itemsKey = 'contributions',
}: TableInterface) => {
  return (
    <div
      className={
        twMerge(
          'w-full flex flex-col bg-white rounded-t-lg space-y-3 md:space-y-6 px-4 md:px-6 md:pt-6 pt-3',
          classRoot
        )
      }
    >
      <div>
        <h2
          className="md:text-lg font-semibold text-[#1E293B] md:tracking-[0.36px]"
        >
          {title}
        </h2>
      </div>

      {rows && rows.length > 0 && (
        <div
          className="w-full flex-grow rounded-t-lg overflow-x-auto"
        >
          <table className="table-auto w-full">
            <thead
              className="bg-bazk-grey-300"
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
              className="divide-y-[1px] divide-bazk-grey-400"
            >
              {rows.map((row: any, index: any) => {
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
      )}

      {(!rows || rows.length === 0) && (
        <div
          className="w-full h-full flex items-center justify-center flex-grow flex-col gap-4 py-20"
        >
          <EmptyList />

          <span
            className="text-bazk-font-1 text-lg font-medium"
          >
            No {itemsKey} have been made yet.
          </span>
        </div>
      )}
    </div>
  )
}

export default Table;
