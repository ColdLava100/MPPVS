const { prisma } = require('./index');
(async () => {
  const electionIds = (await prisma.election.findMany({ select: { id: true } })).map(e => e.id);
  const votes = await prisma.vote.count({ where: { electionId: { notIn: electionIds } } });
  const regs = await prisma.voterRegistration.count({ where: { electionId: { notIn: electionIds } } });
  const candidates = await prisma.candidate.count({ where: { electionId: { notIn: electionIds } } });
  const sessions = await prisma.votingSession.count({ where: { electionId: { notIn: electionIds } } });
  console.log('Remaining orphaned records:');
  console.log('  Votes:', votes);
  console.log('  VoterRegistrations:', regs);
  console.log('  Candidates:', candidates);
  console.log('  VotingSessions:', sessions);
  await prisma.$disconnect();
})();
