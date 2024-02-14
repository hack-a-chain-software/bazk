import { useMemo } from "react"
import Card from "../Card"

export interface SpecsInterface {
  ceremony: any
}

const baseOrder = [
  'power',
  // 'curve',
  // 'memory',
  'contributions',
  'nPrvInputs',
  'nPubInputs',
  'nConstants',
  'nSignals'
];

const specsMap = {
  curve: {
    icon: 'Curve',
    label: 'Curve',
    color: 'bg-[#DCF2E9]',
    getValue: () => {
      return 'bn-256'
    }
  },
  memory: {
    icon: 'Memory',
    color: 'bg-[#CFF4FC]',
    label: 'Memory Requirement',
    getValue: () => {
      return '3239. mb'
    }
  },
  nConstants: {
    icon: 'Constraints',
    label: 'Constraints',
    color: 'bg-[#FFD3B2]',
    getValue: ({ metadatas }: any) => {
      return metadatas.find(({ name }: any) => name === 'nConstants').value
    }
  },
  contributions: {
    icon: 'Completed',
    label: 'Completed Contributions',
    color: 'bg-[#FFF3CD]',
    getValue: (ceremony: any) => {
      return ceremony.contributions.length
    }
  },
  nSignals: {
    icon: 'Wires',
    label: 'Wires',
    color: 'bg-[#DBC3F6]',
    getValue: ({ metadatas }: any) => {
      return metadatas.find(({ name }: any) => name === 'nSignals').value
    }
  },
  nPrvInputs: {
    icon: 'Private',
    label: 'Private Inputs',
    color: 'bg-[#E0DBFF]',
    getValue: ({ metadatas }: any) => {
      return metadatas.find(({ name }: any) => name === 'nSignals').value
    }
  },
  power: {
    icon: 'Power',
    label: 'power',
    color: 'bg-[#F8D7DA]',
    getValue: ({ metadatas }: any) => {
      return metadatas.find(({ name }: any) => name === 'power').value
    }
  },
  nPubInputs: {
    icon: 'Public',
    label: 'Public Inputs',
    color: 'bg-[#FFD0E6]',
    getValue: ({ metadatas }: any) => {
      return metadatas.find(({ name }: any) => name === 'nPubInputs').value
    }
  },
}

export const Specs = ({
  ceremony
}: SpecsInterface) => {
  const specList = useMemo(() => {
    return baseOrder.map((key: any) => {
      const meta = (specsMap as any)[key]

      return {
        ...meta,
        value: meta.getValue(ceremony)
      }
    })
  }, [ceremony])

  return (
    <div
      className="
        flex flex-wrap
        w-full md:grid grid-cols-3 gap-4
      "
    >
      {specList.map(({ value, icon, label, color }) => (
          <Card
            value={value}
            icon={icon}
            label={label}
            color={color}
            key={`ceremony-spec-${icon}`}
          />
      ))}
    </div>
  )
}

export default Specs
