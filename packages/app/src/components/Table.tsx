import DefaultColumn from "./columns/Default";

export interface ColumnInterface {
  key: string;
  label: string;
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
        space-y-6
        px-6 pt-6
      "
    >
      <div>
        <h2
          className="text-lg font-semibold text-[#1E293B] tracking-[0.36px]"
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
              {columns && columns.map(({ key, label }) => {
                return (
                  <th
                    className="text-left p-4 text-sm font-semibold"
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
                        className="p-4"
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
