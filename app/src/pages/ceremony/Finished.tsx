import { ButtonLarge, ButtonSecondaryLarge } from "@/components/Button";
import { Completed } from "@/components/icons";
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
            Ceremony Created
          </span>

          <span
            className="text-[#475569] leading-[22.4px]"
          >
            Your ceremony will be listed on the Dashboard, and you can view all the details and track your contribution on the Ceremony page.
          </span>
        </div>

        <div
          className="flex items-center gap-2 pt-4"
        >
          <Link
            to="/"
            className="w-full"
          >
          <ButtonSecondaryLarge
            label="Dashboard"
            onClick={() => {}}
          />
          </Link>

          <Link
            to="/ceremony/1"
            className="w-full"
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
