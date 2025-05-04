use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ProposalError {
  InvalidDeadline = 1,
  InvalidTitleLength = 2,
  InvalidProposalType = 3,
  AlreadyVoted = 4,
  ProposalNotFound = 5,
  ProposalNotOpen = 6,
  VotingClosed = 7,
  InvalidVoteChoice = 8,
  AlreadyFinalized = 9,
  DeadlineNotReached = 10,
}
