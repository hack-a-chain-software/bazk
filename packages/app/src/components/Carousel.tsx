export const Carousel = () => {
  return (
    <div
      className="pt-4 flex flex-col gap-4"
    >
      <div
        className="py-6 px-4 flex flex-col gap-2 rounded-[8px] bg-[#F1F5F9]"
      >
        <div>
          <span
            className="text-lg font-[600] leading-[140%] text-[#1E293B]"
          >
            Tip 1
          </span>
        </div>

        <div>
          <span
            className="leading-[140%] text-[#475569]"
          >
            You can use other tabs in your browser while the contribution is being made.
          </span>
        </div>

      </div>

      <div
        className="flex items-center justify-center"
      >
        <div
          className="w-[10px] h-[10px] rounded-full bg-[#624BFF]"
        />
      </div>
    </div>
  )
}
