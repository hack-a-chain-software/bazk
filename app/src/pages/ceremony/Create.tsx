import Button, { ButtonSecondary } from "@/components/Button";
import DatePicker from "@/components/DatePicker";
import DropZone from "@/components/DropZone";
import { Input, TextArea } from "@/components/Input";
import PageTitle from "@/components/layout/Title";
import { Link } from "react-router-dom";

export const CreatePage = () => {

  return (
    <div
      className="space-y-4 gap-4 max-w-[836px] mx-auto"
    >
      <PageTitle
        title="Create new ceremony"
      />

      <div
        className="bg-white rounded-lg p-6 flex flex-col gap-4"
      >
        <Input
          value=""
          label="Name"
          placeholder="Enter Ceremony title"
          onChange={() => {}}
        />

        <TextArea
          value=""
          label="Description"
          placeholder="Type something here"
          onChange={() => {}}
        />

        <div
          className="w-full flex items-center gap-6"
        >
          <Input
            value=""
            label="Power (Pot)"
            placeholder="Set Power"
            onChange={() => {}}
          />

          <Input
            value=""
            label="Curve"
            placeholder="Set Curve"
            onChange={() => {}}
          />
        </div>

        <div
          className="w-full flex items-center gap-6"
        >
          <DatePicker
            value=""
            label="Deadline"
            placeholder="Select date"
            onChange={() => {}}
          />

          <div
            className="w-full"
          />
        </div>

        <DropZone />

        <div
          className="flex justify-end items-center gap-2 pt-2"
        >
          <ButtonSecondary
            label="Cancel"
            onClick={() => {}}
          />

          <Link
            to="/ceremony/finished"
          >
            <Button
              label="Create Ceremony"
              onClick={() => {}}
            />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CreatePage;
