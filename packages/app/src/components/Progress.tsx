export interface ProgressInterface {
  progress: number | string
}

export const Progress = ({ progress }: ProgressInterface) => {
  return (
    <div
      className="w-full flex justify-center items-center gap-2.5 py-4"
    >
      <div
        className="h-2 md:h-3 w-full bg-bazk-blue-200 rounded-[20px]"
      >
        <div
          style={{
            width: `${progress}%`
          }}
          className="h-full rounded-[20px] bg-bazk-blue-500"
        />
      </div>

      <span
        className="text-sm md:text-lg font-semibold text-[#1E293B] leading-[140%]"
      >
        {progress}%
      </span>
    </div>
  )
}

export default Progress
