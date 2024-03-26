import { useState } from "react";
import Documents from "./icons/Documents"
import Upload from "./icons/Upload";
import { twMerge } from "tailwind-merge";

export interface DropzoneInterface {
  value: string,
  disabled?: boolean,
  onChange: (value: any) => void
}

export const DropZone = ({
  onChange,
  disabled = false,
}: DropzoneInterface) => {
  const [name, setName] = useState("")

  const handleFileChange = (event: any) => {
    console.log(event.target)

    const file = event.target.files[0];

    console.log(file)

    if (file) {
      setName(file.name);

      const reader = new FileReader();

      reader.onload = (e: any) => {
        onChange(e.target.result)
      };
      reader.readAsText(file);
    }
  };

  return (
    <div
      className={
        twMerge(
          "relative rounded-lg border-[1px] border-bazk-grey-500 px-4 py-4 md:py-6 border-dashed flex items-center justify-center flex-col gap-4",
          disabled && "opacity-[0.7]"
        )
      }
    >
      <input disabled={disabled} className="absolute inset-0 opacity-0 disabled:cursor-not-allowed" type="file" accept=".json" onChange={handleFileChange} />

      {name && (
        <>
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
              {name}
            </span>
          </div>
        </>
      )}

      {!name && (
        <>
          <div>
            <Upload/>
          </div>

          <div
            className="text-center"
          >
            <span
              className="text-xs md:text-sm text-[#1E293B] font-medium"
            >
              <span className="text-[#725DFF]">Click to Upload</span> or drop JSON files here to upload
            </span>
          </div>
        </>
      )}

    </div>
  )
}

export default DropZone
