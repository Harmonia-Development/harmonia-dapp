import { ProposalCalendar } from "@/components/proposals/ProposalCalendar";
import { ProposalList } from "@/components/proposals/ProposalList";
import { ProposalStats } from "@/components/proposals/ProposalStats";
import { LayoutWrapper } from "@/components/ui/layout-wrapper";

export default function ProposalsPage() {
  return (
    <>
      <main className="min-h-screen bg-background">
        <LayoutWrapper>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Proposals
            </h1>
            <p className="text-muted-foreground text-lg">
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
      </main>
    </>
  );
}
