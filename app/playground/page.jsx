import { ComponentShowcase } from "@components/playground/ComponentShowcase";
import { Timeline } from "@components/ui/timeline";

export const metadata = {
  description: "A sandbox for previewing UI components.",
  title: "Playground",
};

const timelineItems = [
  {
    description: "The user session timed out due to inactivity.",
    id: "auth-timeout",
    status: "error",
    time: "Just now",
    title: "Authenticated timed out",
  },
  {
    children: [
      {
        description: "The user session timed out due to inactivity.",
        id: "cres-1",
        status: "success",
        time: "1m ago",
        title: "CRes received",
      },
      {
        children: [
          {
            description: "The user session timed out due to inactivity.",
            id: "cres-2",
            status: "success",
            time: "1m ago",
            title: "CRes received",
          },
          {
            description: "The user session timed out due to inactivity.",
            id: "creq-1",
            status: "warning",
            time: "2m ago",
            title: "CReq sent",
          },
        ],
        defaultOpen: true,
        id: "challenge-2",
        title: "Challenge performed",
      },
      {
        description: "The user session timed out due to inactivity.",
        id: "creq-2",
        status: "warning",
        time: "2m ago",
        title: "CReq sent",
      },
    ],
    id: "challenge-3",
    title: "Challenge performed",
  },
  {
    description: "Issuer requires a challenge to be performed.",
    id: "action-required",
    status: "pending",
    time: "3m ago",
    title: "Action required",
  },
  {
    children: [
      {
        description: "The user resumed an existing session.",
        id: "session-resumed",
        status: "success",
        time: "5m ago",
        title: "Session resumed",
      },
      {
        description: "The authentication flow was initiated.",
        id: "auth-started",
        status: "info",
        time: "5m ago",
        title: "Authentication started",
      },
    ],
    id: "more",
  },
  {
    description: "A new session was created for the user.",
    id: "session-created",
    status: "info",
    time: "6m ago",
    title: "Session created",
  },
];

export default function Playground() {
  return (
    <div className="flex w-full flex-col items-start gap-12 pb-20">
      <div>
        <h1 className="font-medium text-sm sm:text-base">Playground</h1>
        <p className="mt-2 text-neutral-400 text-xs">A sandbox for previewing UI components.</p>
      </div>

      <ComponentShowcase
        code="'@vault'"
        description="Renders a timeline of events."
        title="Timeline"
      >
        <Timeline items={timelineItems} />
      </ComponentShowcase>
    </div>
  );
}
