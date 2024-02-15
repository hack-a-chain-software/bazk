import { ButtonLarge, ButtonSecondaryLarge } from "@/components/Button";
import Progress from "@/components/Progress";
import { Link } from "react-router-dom";

export const CreateContributionPage = () => {

  return (
    <div
      className="space-y-4 gap-4 max-w-[546px] mx-auto gap-6"
    >
      <div
        className="bg-white rounded-lg p-4 md:p-6 flex flex-col gap-4"
      >
        <Progress
          progress="50"
        />

        <div
          className="gap-2 flex flex-col"
        >
          <span
            className="text-[#1E293B] text-lg md:text-[22px] leading-[140%] font-semibold"
          >
            Contribution with Phala
          </span>

          <span
            className="text-[#475569] text-sm md:text-base leading-[140%]"
          >
            Keep your browser open and connected for the contribution to be completed.
          </span>

        </div>

        <div
          className="flex gap-4 pt-4"
        >
          <Link
            to="/ceremony/1"
            className="w-full"
          >
            <ButtonSecondaryLarge
              label="Cancel"
              onClick={() => {}}
            />
          </Link>

          <Link
            to="/contribution/finished"
            className="w-full"
          >
            <ButtonLarge
              label="Finish"
              onClick={() => {}}
            />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CreateContributionPage;
