import { ProposalDetailWrapper } from '@/components/proposals/ProposalDetailWrapper'

export default async function ProposalDetailPage({
	params,
}: {
	params: Promise<{
		id: string
	}>
}) {
	const { id } = await params

	return <ProposalDetailWrapper id={id} />
}
