import Documents from "./icons/Documents"

export const DropZone = () => {
  return (
    <div
      className="rounded-lg border-[1px] border-[#CBD5E1] px-4 py-6 border-dashed flex items-center justify-center flex-col gap-4"
    >
      <div
        className="px-4 py-[18px] bg-[#E0DBFF] rounded-full"
      >
        <Documents />
      </div>

      <div>
        <span
          className="text-sm text-[#1E293B] font-medium"
        >
          Opact tickets setup ceremony version 3.JSON
        </span>
      </div>

    </div>
  )
}

export default DropZone
