import { format } from "date-fns"
import { Link } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import Download from "../icons/Download"
import { useMemo } from "react"

export interface DownloadsInterface {
  ceremony: any
}

export const Downloads = ({
  ceremony
}: DownloadsInterface) => {
  const lastContribution = useMemo(() => {
    return ceremony.contributions.at(0)
  }, [
    ceremony
  ])

  return (
    <div
      className="flex flex-col gap-4"
    >
      <div>
        <span
          className="text-[20px] leading-[120%] font-[600] text-[#1E293B]"
        >
          Download files
        </span>
      </div>

      <div
        className="
          p-4 md:p-6
          h-max
          bg-white
          rounded-lg
          flex flex-col
        "
      >
        <div
          className="flex flex-col gap-3 md:gap-4"
        >
          <span
            className="text-[#1E293B] md:text-lg font-semibold tracking-[0.36px] leading-[140%]"
          >
            Last contribution
          </span>

          <Link
            target='__blank'
            to={`https://ipfs.io/ipfs/${lastContribution.hash}/`}
          >
            <button
              className="w-full flex items-center gap-4 px-3 md:px-4 py-4 rounded-lg hover:opacity-[0.7] bg-bazk-grey-300"
            >
              <span
                className="flex w-full text-[14px] text-[#1E293B] leading-[16px]"
              >
                {lastContribution.name}
              </span>

              <Download
                className="w-5 h-5"
              />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Downloads
