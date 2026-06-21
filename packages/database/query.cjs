const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
async function main() {
  const activeElectionId = "d42ea93c-90d1-4575-b0e7-6656bb67ca12";
  
  const [totalUsers, candidates, registrations, voters] = await Promise.all([
    p.user.count(),
    p.candidate.count({ where: { electionId: activeElectionId } }),
    p.voterRegistration.count({ where: { electionId: activeElectionId, isArchived: false } }),
    p.voterRegistration.findMany({
      where: { electionId: activeElectionId, isArchived: false },
      include: { user: { include: { course: true } } }
    })
  ]);
  
  console.log("Total users:", totalUsers);
  console.log("Candidates (active election):", candidates);
  console.log("VoterRegistrations (active election):", registrations);
  
  console.log("\n--- All registered voters ---");
  for (const r of voters) {
    const isCand = r.user.candidateProfile ? "CANDIDATE" : "non-candidate";
    console.log(r.user.studentId, "|", r.user.name, "| role:", r.user.role, "|", isCand, "| course:", r.user.course?.code);
  }
  
  // Also check what the landing page metrics would show
  console.log("\n--- Login-eligible breakdown ---");
  const studentRegs = voters.filter(r => r.user.role === "STUDENT");
  const candidateRegs = voters.filter(r => r.user.role === "CANDIDATE" || r.user.candidateProfile);
  console.log("STUDENT registrations:", studentRegs.length);
  console.log("CANDIDATE registrations:", candidateRegs.length);
  
  await p.$disconnect();
}
main().catch(e => { console.error("ERROR:", e.message); process.exit(1); });
