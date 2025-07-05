import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ProposalCalendar } from "@/components/proposals/ProposalCalendar";
import { ProposalList } from "@/components/proposals/ProposalList";
import { ProposalStats } from "@/components/proposals/ProposalStats";

export default function ProposalsPage() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Proposals
            </h1>
            <p className="text-muted-foreground text-lg">
              Create, vote, and track governance proposals
            </p>
          </div>
          <div className="container mx-auto py-3">
            <ErrorBoundary>
              <ProposalStats />
            </ErrorBoundary>
          </div>
          <ErrorBoundary>
            <ProposalList />
          </ErrorBoundary>
        </div>
        <div>
          <ErrorBoundary>
            <ProposalCalendar events={[]} />
          </ErrorBoundary>
        </div>
      </main>
    </ErrorBoundary>
  );
}
