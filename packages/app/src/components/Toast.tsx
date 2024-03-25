import Error from "./icons/Error";

export const ToastError = ({
  label
}: {
  label: string
}) => (
  <div
    className="px-4 py-3 rounded-lg	bg-red-500 flex gap-2 items-center min-w-[440px] max-w-full"
  >
    <Error/>

    <span
      className="font-[500] leading-[140%] text-white"
    >
      {label}
    </span>
  </div>
)
