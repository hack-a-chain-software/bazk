import Card from "../Card"

export interface SpecsInterface {
  ceremony: any
}

// TODO: Complete this
export const specsMap = {
  // bash: {

  //   icon: 'Public',
  //   label: 'Public Inputs',
  //   color: 'bg-[#FFD0E6]'
  // },
  // nVars: {

  //   icon: 'Public',
  //   label: 'Public Inputs',
  //   color: 'bg-[#FFD0E6]'
  // },
  // nInputs: {

  //   icon: 'Public',
  //   label: 'Public Inputs',
  //   color: 'bg-[#FFD0E6]'
  // },
  // nOutputs: {

  //   icon: 'Public',
  //   label: 'Public Inputs',
  //   color: 'bg-[#FFD0E6]'
  // },
  // nConstants: {
  //   icon: 'Public',
  //   label: 'Public Inputs',
  //   color: 'bg-[#FFD0E6]'
  // },

  //
  nSignals: {
    icon: 'Signals',
    label: 'Signals',
    color: 'bg-[#DBC3F6]'
  },
  nPrvInputs: {
    icon: 'Private',
    label: 'Private Inputs',
    color: 'bg-[#E0DBFF]'
  },
  power: {
    icon: 'power',
    label: 'power',
    color: 'bg-[#F8D7DA]'
  },
  nPubInputs: {
    icon: 'Public',
    label: 'Public Inputs',
    color: 'bg-[#FFD0E6]'
  },
}

export const Specs = ({
  ceremony
}: SpecsInterface) => {
  return (
    <div
      className="w-full grid grid-cols-4 gap-4"
    >
      <Card
        value="23"
        icon="Power"
        label="Power"
        color="bg-[#F8D7DA]"
      />

      <Card
        icon="Curve"
        label="Curve"
        value="bn-256"
        color="bg-[#DCF2E9]"
      />

      <Card
        icon="Memory"
        value="3239. mb"
        color="bg-[#CFF4FC]"
        label="Memory Requirement"
      />

      <Card
        value="27"
        icon="Completed"
        color="bg-[#FFF3CD]"
        label="Completed Contributions"
      />

      <Card
        value="5452"
        icon="Private"
        color="bg-[#E0DBFF]"
        label="Private Inputs"
      />

      <Card
        value="1"
        icon="Public"
        label="Public Inputs"
        color="bg-[#FFD0E6]"
      />

      <Card
        value="5871794"
        icon="Constraints"
        label="Constraints"
        color="bg-[#FFD3B2]"
      />

      <Card
        value="217"
        icon="Wires"
        label="Wires"
        color="bg-[#DBC3F6]"
      />
    </div>
  )
}

export default Specs
