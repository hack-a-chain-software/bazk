export interface ProgressInterface {
  progress: number | string
}

export const Progress = ({ progress }: ProgressInterface) => {
  return (
    <div
      className="w-full flex justify-center items-center gap-2.5 py-4"
    >
      <div
        className="h-3 w-full bg-[#E0DBFF] rounded-[20px]"
      >
        <div
          style={{
            width: `${progress}%`
          }}
          className="h-full rounded-[20px] bg-[#624BFF]"
        />
      </div>

      <span
        className="text-lg font-semibold text-[#1E293B] leading-[25.2px]"
      >
        {progress}%
      </span>
    </div>
  )
}

export default Progress
