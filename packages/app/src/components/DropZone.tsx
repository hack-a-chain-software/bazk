import Documents from "./icons/Documents"

export const DropZone = () => {
  return (
    <div
      className="rounded-lg border-[1px] border-bazk-grey-500 px-4 py-4 md:py-6 border-dashed flex items-center justify-center flex-col gap-4"
    >
      <div
        className="px-4 py-4 md:py-[18px] bg-bazk-blue-200 rounded-full"
      >
        <Documents
          className="w-6 h-6 md:w-8 md:h-8"
        />
      </div>

      <div
        className="text-center"
      >
        <span
          className="text-xs md:text-sm text-[#1E293B] font-medium"
        >
          Opact tickets setup ceremony version 3.JSON
        </span>
      </div>

    </div>
  )
}

export default DropZone
