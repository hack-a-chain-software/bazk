import Button, { ButtonSecondary } from "@/components/Button";
import DatePicker from "@/components/DatePicker";
import DropZone from "@/components/DropZone";
import { Input, InputNumber, TextArea } from "@/components/Input";
import { assign, createMachine, fromPromise } from 'xstate';
import PageTitle from "@/components/layout/Title";
import { useActorRef, useSelector } from "@xstate/react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "@/utils/constants";

const defaultForm = {
  name: "",
  power: "",
  description: "",

  bash: 254,

  circuit: null,
  deadline: null,
}

const createCeremonyMachine = createMachine({
  id: 'create-ceremony',
  initial: 'editing',
  types: {} as {
    context: any;
    events:
      | {
          type: 'create';
        }
      | {
          type: 'change';
          value: {
            key: string,
            value: any
          }
        };
  },
  context: {
    ...defaultForm
  },
  states: {
    editing: {
      on: {
        change: {
          actions: assign(({ context, event }: any) => ({
            ...context,
            [event.value.key]: event.value.value,
          }))
        },
        create: {
          target: 'creating'
        },
      }
    },
    creating: {
      invoke: {
        id: "createCeremonyActor",
        src: "createCeremony",
        input: ({ context }) => ({
          ...context,
        }),
        onDone: [
          {
            guard: ({ event }: any) => !event.output.success,
            target: 'editing',
            actions: ({ event }: any) => {
              const error = event.output?.message;

              console.log("error", error)
            }
          },
        ],
      },
    }
  }
});

export const CreatePage = () => {
  const navigate = useNavigate();

  const createCeremonyActorRef = useActorRef(createCeremonyMachine.provide({
    actors: {
      createCeremony: fromPromise(async ({ input }: any) => {
        const data = {
          key: "create",
          data: {
            ...input,
            deadline: input.deadline?.getTime() / 1000
          }
        };

        console.log("Creating ceremony with params: ", data)

        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          const result = await response.json()

          console.log('Requisição enviada', result);

          if (result && result?.message?.data?.ceremonyId) {
            navigate(`/ceremony/finished/?id=${result?.message?.data?.ceremonyId}`)
          }

          return result
        } catch (error) {
          console.error('Request error:', error);

          return {}
        }
      }),
    },
  }));

  const name = useSelector(createCeremonyActorRef, (s) => s.context.name);
  const bash = useSelector(createCeremonyActorRef, (s) => s.context.bash);
  const power = useSelector(createCeremonyActorRef, (s) => s.context.power);
  const circuit = useSelector(createCeremonyActorRef, (s) => s.context.circuit);
  const deadline = useSelector(createCeremonyActorRef, (s) => s.context.deadline);
  const description = useSelector(createCeremonyActorRef, (s) => s.context.description);

  const isCreating = useSelector(createCeremonyActorRef, (s) => s.matches('creating'))

  const isValidName = useMemo(() => !!name, [name])
  const isValidPower = useMemo(() => !!power, [power])
  const isValidBash = useMemo(() => !!bash, [bash])
  const isValidCircuit = useMemo(() => !!circuit, [circuit])
  const isValidDeadline = useMemo(() => !!deadline, [deadline])
  const isValidDescription = useMemo(() => !!description, [description])

  const isValidParams = useMemo(() => (
    isValidName
    && isValidPower
    && isValidBash
    && isValidCircuit
    && isValidDeadline
    && isValidDescription
  ), [
    isValidName,
    isValidPower,
    isValidBash,
    isValidCircuit,
    isValidDeadline,
    isValidDescription
  ])

  return (
    <div
      className="space-y-4 gap-4 max-w-[836px] mx-auto"
    >
      <PageTitle
        title="Create new ceremony"
      />

      <div
        className="bg-white rounded-lg p-4 md:p-6 flex flex-col gap-3 md:gap-4"
      >
        <Input
          value={name}
          label="Title"
          disabled={isCreating}
          placeholder="Enter Ceremony title"
          onChange={(value) => {
            createCeremonyActorRef.send({
              type: 'change',
              value: {
                key: "name",
                value: String(value),
              }
            });
          }}
        />

        <TextArea
          value={description}
          label="Description"
          disabled={isCreating}
          placeholder="Type something here"
          onChange={(value) => {
            createCeremonyActorRef.send({
              type: 'change',
              value: {
                key: "description",
                value: String(value),
              }
            });
          }}
        />

        <div
          className="w-full flex items-center gap-3 md:gap-6 flex-wrap md:flex-nowrap"
        >
          <InputNumber
            value={power}
            disabled={isCreating}
            label="Power (Pot)"
            placeholder="Set Power"
            onChange={(value) => {
              createCeremonyActorRef.send({
                type: 'change',
                value: {
                  key: "power",
                  value: String(value),
                }
              });
            }}
          />

          <Input
            disabled
            value={bash}
            label="Curve"
            placeholder="Set Curve"
            onChange={() => {
              // createCeremonyActorRef.send({
              //   type: 'change',
              //   value: {
              //     key: "curve",
              //     value: String(value),
              //   }
              // });
            }}
          />
        </div>

        <div
          className="w-full flex items-center gap-6"
        >
          <DatePicker
            value={deadline}
            label="Deadline"
            disabled={isCreating}
            placeholder="Select date"
            onChange={(value) => {
              createCeremonyActorRef.send({
                type: 'change',
                value: {
                  key: "deadline",
                  value: value,
                }
              });
            }}
          />

          <div
            className="w-full hidden md:block"
          />
        </div>

        <DropZone
          value={circuit}
          disabled={isCreating}
          onChange={(value) => {
            createCeremonyActorRef.send({
              type: 'change',
              value: {
                key: "circuit",
                value: value,
              }
            });
          }}
        />

        <div
          className="flex justify-end items-center gap-2 pt-2"
        >
          {!isCreating && (
            <ButtonSecondary
              label="Cancel"
              onClick={() => navigate("/")}
            />
          )}

          <Button
            label="Create Ceremony"
            loading={isCreating}
            disabled={!isValidParams}
            onClick={() => createCeremonyActorRef.send({ type: "create" })}
          />
        </div>
      </div>
    </div>
  )
}

export default CreatePage;
