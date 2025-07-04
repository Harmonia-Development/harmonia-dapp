import { ProposalCalendar } from "@/components/proposals/ProposalCalendar";
import { ProposalList } from "@/components/proposals/ProposalList";
import { ProposalStats } from "@/components/proposals/ProposalStats";
import { LayoutWrapper } from "@/components/ui/layout-wrapper";
import { ThemeWrapper } from "@/components/ui/theme-wrapper";

export default function ProposalsPage() {
  return (
    <ThemeWrapper>
      <LayoutWrapper>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Create, vote, and track governance proposals
          </p>
        </div>
        <div>
          <ProposalStats />
        </div>
        <ProposalList />
      </LayoutWrapper>
      <div>
        <ProposalCalendar events={[]} />
      </div>
    </ThemeWrapper>
  );
}
