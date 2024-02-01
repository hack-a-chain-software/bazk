import { ButtonLarge } from "@/components/Button";
import { Completed } from "@/components/icons";
import Copy from "@/components/icons/Copy";
import Download from "@/components/icons/Download";
import { Link } from "react-router-dom";

export const FinishedPage = () => {

  return (
    <div
      className="space-y-4 gap-4 max-w-[546px] mx-auto"
    >
      <div
        className="bg-white rounded-lg p-6 flex flex-col gap-6"
      >
        <div
          className="w-[90px] h-[90px] rounded-full bg-[#D0F9DE80] justify-center items-center flex"
        >
          <div
            className="w-[66px] h-[66px] bg-[#D0F9DE] rounded-full justify-center items-center flex"
          >
            <Completed
              className="text-[#03863D] w-[42px] h-[42px]"
            />
          </div>
        </div>

        <div
          className="flex flex-col gap-2"
        >
          <span
            className="text-[#1E293B] text-[22px] leading-[30.8px] font-semibold"
          >
            Contribution successfully completed
          </span>

          <span
            className="text-[#475569] leading-[22.4px]"
          >
            You contributed to Opact Tickets Setup Ceremony version 3.0. Your contribution files are available below, and you can also view them on the Ceremony page
          </span>
        </div>

        <div
          className="flex flex-col gap-4"
        >
          <div
            className="w-full"
          >
            <span
              className="font-medium text-[#1E293B] leading-[22.4px]"
            >
              Hash
            </span>

            <div
              className="flex items-center gap-4"
            >
              <span
                className="flex w-full text-[#1E293B] p-4 border border-[#CBD5E1] rounded-lg leading-[16px]"
              >
                b145sd6fg54dfdf65dfds...g12921fgh2d8
              </span>

              <Copy />
            </div>
          </div>

          <div
            className="w-full"
          >
            <span
              className="font-medium text-[#1E293B] leading-[22.4px]"
            >
              Contribution
            </span>

            <div
              className="w-full flex items-center gap-4"
            >
              <span
                className="flex w-full text-[#1E293B] p-4 border border-[#CBD5E1] rounded-lg leading-[16px]"
              >
                Opacttickets_000026.zkey
              </span>

              <Download
                className="w-8 h-8"
              />
            </div>
          </div>
        </div>

        <div
          className="flex justify-end gap-2 pt-4"
        >
          <Link
            to="/ceremony/1"
          >
            <ButtonLarge
              label="Done"
              onClick={() => {}}
            />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FinishedPage;
