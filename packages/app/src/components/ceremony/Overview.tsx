import { format } from "date-fns"

export interface OverviewInterface {
  ceremony: any
}

export const Overview = ({
  ceremony
}: OverviewInterface) => {
  return (
    <div
      className="
        p-4 md:p-6
        h-max
        bg-white
        col-span-4
        rounded-lg
        flex flex-col
      "
    >
      <div
        className="flex flex-col gap-2 pb-3 md:pb-4"
      >
        <span
          className="text-xs md:text-sm text-[#475569] leading-[16.8px] md:leading-[19.6px]"
        >
          Ceremony Name
        </span>

        <span
          className="text-lg md:text-xl font-medium text-[#1E293B] leading-[140%]"
        >
          {ceremony.name}
        </span>
      </div>

      <div
        className="flex flex-col gap-2 pb-4 md:pb-6"
      >
        <span
          className="text-xs md:text-sm text-[#475569] leading-[16.8px] md:leading-[19.6px]"
        >
          Description
        </span>

        <span
          className="text-sm md:text-base leading-[140%] text-[#1E293B]"
        >
          {ceremony.description}
        </span>
      </div>

      <div
        className="flex flex-col gap-3 md:gap-2"
      >
        <span
          className="text-[#1E293B] md:text-lg font-semibold tracking-[0.36px] leading-[140%]"
        >
          Ceremony details
        </span>

        <div
          className="bg-bazk-grey-300 p-3 md:p-4 rounded-lg divide divide-y-[1px] divide-bazk-grey-500"
        >
          <div
            className="
              p-2
              flex justify-between items-center flex-wrap gap-2
            "
          >
            <span
              className="
                text-[#475569] text-sm md:text-base
              "
            >
              Ceremony ID:
            </span>

            <span
              className="text-[#1E293B] font-medium text-sm md:text-base"
            >
              {ceremony.ceremonyId}
            </span>
          </div>

          <div
            className="
              p-2
              flex justify-between items-center flex-wrap gap-2
            "
          >
            <span
              className="
                text-[#475569] text-sm md:text-base
              "
            >
              Deadline:
            </span>

            <span
              className="text-[#1E293B] font-medium text-sm md:text-base"
            >
              {format(ceremony.deadline * 1000, 'dd/MM/yyyy')}
            </span>
          </div>

          <div
            className="
              p-2
              flex justify-between items-center flex-wrap gap-2
            "
          >
            <span
              className="
                text-[#475569] text-sm md:text-base
              "
            >
              Hash:
            </span>

            <span
              className="text-[#1E293B] font-medium text-sm md:text-base"
            >
              264480...e61873
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Overview
