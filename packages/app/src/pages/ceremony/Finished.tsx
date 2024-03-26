import { ButtonLarge, ButtonSecondaryLarge } from "@/components/Button";
import { Completed } from "@/components/icons";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const FinishedPage = () => {
  const [id, setId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search.split('?')[1]);

    const id = queryParams.get('id')

    if (!id) {
      navigate('/')

      return
    }

    setId(id as any);
  }, [location, navigate]);

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
              className="text-[#03863D] w-[36px] h-[36px] md:w-[42px] md:h-[42px]"
            />
          </div>
        </div>

        <div
          className="flex flex-col gap-3 md:gap-2"
        >
          <span
            className="text-[#1E293B] text-lg md:text-[22px] leading-[30.8px] font-semibold"
          >
            Ceremony Created
          </span>

          <span
            className="text-sm md:text-base text-[#475569] leading-[22.4px]"
          >
            Your ceremony will be listed on the Dashboard, and you can view all the details and track your contribution on the Ceremony page.
          </span>
        </div>

        <div
          className="flex items-center gap-3 md:gap-2 pt-4"
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
            to={`/ceremony/${id}`}
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
