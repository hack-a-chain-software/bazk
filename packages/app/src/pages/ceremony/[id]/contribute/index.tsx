import { createMachine, fromPromise } from "xstate";
import { ButtonLarge } from "@/components/Button";
import { useLocation, useNavigate, useParams } from "react-router";
import { useActorRef, useSelector } from "@xstate/react";

const url = "http://40.121.212.147:3000/execute";

const createContributionMachine = createMachine({
  id: 'create-ceremony',
  initial: 'idle',
  types: {} as any,
  context: ({ input }: any) => {
    console.log("input", input)
    return {
      //
      ...input
    }
  },
  states: {
    idle: {
      on: {
        contribute: {
          target: 'contribute'
        },
      }
    },
    contribute: {
      invoke: {
        id: "createContributionActor",
        src: "createContribution",
        input: ({ context }) => ({
          ...context,
        }),
        onDone: [
          {
            guard: ({ event }: any) => !event.output.success,
            target: 'idle',
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

export const CreateContributionPage = () => {
  const { id } = useParams()

  const navigate = useNavigate();

  const location = useLocation();

  const createContributionActorRef = useActorRef(
    createContributionMachine.provide({
      actors: {
        createContribution: fromPromise(async ({ input }: any) => {
          const data = {
            key: "contribute",
            data: {
              ceremonyId: input.ceremonyId
            }
          };

          try {
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });

            const result = await response.json()

            console.log("contribution result", result)

            if (result && result?.message?.data?.outputFilesArray) {
              const [ contribution ] = result.message.data.outputFilesArray;

              navigate(`${location.pathname}/${contribution.hash}`)
            }

            return result
          } catch (error) {
            console.error('Contribution error:', error);
          }
        }),
      },
    }),
    {
      input: {
        ceremonyId: id
      }
    }
  );

  const isContributing = useSelector(createContributionActorRef, (s) => s.matches('contribute'))

  return (
    <div
      className="space-y-4 gap-4 max-w-[546px] mx-auto gap-6"
    >
      <div
        className="bg-white rounded-lg p-4 md:p-6 flex flex-col gap-4"
      >
        {/* <Progress
          progress="50"
        /> */}

        <div
          className="gap-2 flex flex-col"
        >
          <span
            className="text-[#1E293B] text-lg md:text-[22px] leading-[140%] font-semibold"
          >
            Contribution with Phala
          </span>

          <span
            className="text-[#475569] text-sm md:text-base leading-[140%]"
          >
            Keep your browser open and connected for the contribution to be completed.
          </span>

        </div>

        <div
          className="flex gap-4 pt-4"
        >
          {/* <Link
            to="/ceremony/1"
            className="w-full"
          >
            <ButtonSecondaryLarge
              label="Cancel"
              onClick={() => {}}
            />
          </Link> */}
          <ButtonLarge
            label="Start"
            loading={isContributing}
            onClick={() => createContributionActorRef.send({ type: 'contribute' })}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateContributionPage;
