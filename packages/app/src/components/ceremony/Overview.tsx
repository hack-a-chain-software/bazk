export interface OverviewInterface {
  ceremony: any
}

export const Overview = ({
  ceremony
}: OverviewInterface) => {
  return (
    <div
      className="
        p-6
        h-max
        bg-white
        col-span-4
        rounded-lg
        flex flex-col
      "
    >
      <div
        className="flex flex-col gap-2 pb-4"
      >
        <span
          className="text-sm text-[#475569] leading-[19.6px]"
        >
          Ceremony Name
        </span>

        <span
          className="text-xl font-medium text-[#1E293B] leading-[28px]"
        >
          {ceremony.name}
        </span>
      </div>

      <div
        className="flex flex-col gap-2 pb-6"
      >
        <span
          className="text-sm text-[#475569] leading-[19.6px]"
        >
          Description
        </span>

        <span
          className="leading-[22.4px] text-[#1E293B]"
        >
          {ceremony.description}
        </span>
      </div>

      <div
        className="flex flex-col gap-2"
      >
        <span
          className="text-[#1E293B] text-lg font-semibold tracking-[0.36px] leading-[25.2px]"
        >
          Ceremony details
        </span>

        <div
          className="bg-[#F1F5F9] p-4 rounded-lg divide divide-y-[1px] divide-[#CBD5E1]"
        >
          <div
            className="
              p-2
              flex justify-between items-center
            "
          >
            <span
              className="
                text-[#475569]
              "
            >
              Ceremony ID:
            </span>

            <span
              className="text-[#1E293B] font-medium"
            >
              {ceremony.ceremonyId}
            </span>
          </div>

          <div
            className="
              p-2
              flex justify-between items-center
            "
          >
            <span
              className="
                text-[#475569]
              "
            >
              Deadline:
            </span>

            <span
              className="text-[#1E293B] font-medium"
            >
              04/05/2024
            </span>
          </div>

          <div
            className="
              p-2
              flex justify-between items-center
            "
          >
            <span
              className="
                text-[#475569]
              "
            >
              Parameters:
            </span>

            <span
              className="text-[#1E293B] font-medium"
            >
              1024 4352 121 17 7
            </span>
          </div>

          <div
            className="
              p-2
              flex justify-between items-center
            "
          >
            <span
              className="
                text-[#475569]
              "
            >
              Hash:
            </span>

            <span
              className="text-[#1E293B] font-medium"
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
