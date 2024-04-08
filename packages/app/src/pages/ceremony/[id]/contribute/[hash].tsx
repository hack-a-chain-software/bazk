import { ButtonLarge } from "@/components/Button";
import { Completed } from "@/components/icons";
import Copy from "@/components/icons/Copy";
import Download from "@/components/icons/Download";
import { Link, useParams } from "react-router-dom";

export const FinishedPage = () => {
  const { hash, id } = useParams();

  return (
    <div
      className="space-y-4 gap-4 max-w-[546px] mx-auto"
    >
      <div
        className="bg-white rounded-lg p-4 md:p-6 flex flex-col gap-4 md:gap-6"
      >
        <div
          className="w-[80px] h-[80px] md:w-[90px] md:h-[90px] rounded-full bg-[#D0F9DE80] justify-center items-center flex"
        >
          <div
            className="w-[60px] h-[60px] md:w-[66px] md:h-[66px] bg-[#D0F9DE] rounded-full justify-center items-center flex"
          >
            <Completed
              className="text-[#03863D] h-[36px] md:w-[42px] md:h-[42px]"
            />
          </div>
        </div>

        <div
          className="flex flex-col gap-3 md:gap-2"
        >
          <span
            className="text-[#1E293B] text-lg md:text-[22px] leading-[30.8px] font-semibold"
          >
            Contribution successfully completed
          </span>

          <span
            className="text-sm md:text-base text-[#475569] leading-[22.4px]"
          >
            Your contribution files are available below, and you can also view them on the Ceremony page
          </span>
        </div>

        <div
          className="flex flex-col gap-3 md:gap-4"
        >
          <div
            className="w-full"
          >
            <span
              className="font-medium text-[#1E293B] leading-[22.4px]"
            >
              Hash
            </span>

            <button
              onClick={() => navigator.clipboard.writeText(hash || "")}
              className="flex md:max-w-full w-full items-center justify-between gap-4 px-3 md:px-4 py-4 border border-bazk-grey-500 rounded-lg hover:opacity-[0.7] active:border-green-500 text-[#1E293B] active:text-green-500"
            >
              <span
                className="max-w-[calc(100%-36px)] leading-[16px] break-words"
              >
                b145sd6fg54dfdf65dfds...g12921fgh2d8
              </span>

              <Copy
                className="w-6 h-6 md:w-8 md:h-8 shrink-0"
              />
            </button>
          </div>

          <div
            className="w-full"
          >
            <span
              className="font-medium text-[#1E293B] leading-[22.4px]"
            >
              Contribution
            </span>

            <Link
              target='__blank'
              to={`https://ipfs.io/ipfs/${hash}/`}
            >
              <button
                className="w-full flex items-center gap-4 px-3 md:px-4 py-4 border border-bazk-grey-500 rounded-lg hover:opacity-[0.7]"
              >
                <span
                  className="flex w-full text-[#1E293B] leading-[16px]"
                >
                  contribution.params
                </span>

                <Download
                  className="w-8 h-8"
                />
              </button>
            </Link>
          </div>
        </div>

        <div
          className="flex justify-center gap-2 pt-4"
        >
          <Link
            to={`/ceremony/${id}`}
          >
            <ButtonLarge
              label="Ceremony Page"
              onClick={() => {}}
            />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FinishedPage;
