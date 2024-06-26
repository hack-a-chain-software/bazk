import Button, { ButtonLarge, ButtonSecondaryLarge } from "./Button"
import { useState } from 'react'
import Modal from "./Modal"
import Puzzle from "./icons/Puzzle"
import { Link, useLocation } from "react-router-dom"

export const ContributionButton = ({ disabled = false }: { disabled?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)

  const location = useLocation();

  const contributePath = `${location.pathname}/contribute`;

  function closeModal () {
    setIsOpen(false)
  }

  function openModal () {
    setIsOpen(true)
  }

  return (
    <div>
      <Button
        disabled={disabled}
        onClick={openModal}
        label="Start a contribution"
      />

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        rootClass="max-w-[520px]"
      >
        <div
          className="p-2 md:p-3 rounded-full bg-[#F3EBFD] w-max"
        >
          <Puzzle
            className="w-10 h-10 md:w-[64px] md:h-[64px]"
          />
        </div>

        <div
          className="pt-4 md:pt-6 flex flex-col gap-2"
        >
          <span
            className="
              text-[22px]
              text-[#1E293B]
              font-semibold
              leading-[30.8px]
            "
          >
            Start a contribution
          </span>

          <span
            className="
              text-[#475569]
              leading-[22.4px]
            "
          >
            To start a contribution, choose the method you want it to be done.
          </span>
        </div>

        <div
          className="pt-[32px] md:pt-10 flex items-center gap-3 md:gap-4"
        >
          <ButtonSecondaryLarge
            onClick={() => {}}
            disabled
            label="External"
          />

          <Link
            to={contributePath}
            className="w-full"
          >
            <ButtonLarge
              onClick={() => {}}
              label="Phala (Browser)"
            />
          </Link>
        </div>
      </Modal>
    </div>
  )
}

export default ContributionButton
