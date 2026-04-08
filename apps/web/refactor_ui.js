const fs = require('fs');
const filePath = 'd:/1-Personal-Programming/MPPVS/apps/web/src/app/dashboard/superadmin/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const sidebar = `
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'sans-serif' }}>
      <aside style={{ width: '250px', backgroundColor: '#111827', color: '#fff', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100vh' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Tracer Bullet</h2>
        <button onClick={() => setActiveRoleTab('SUPERADMIN')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'SUPERADMIN' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Super Admin / System</button>
        <button onClick={() => setActiveRoleTab('ADMIN')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'ADMIN' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Admin (Election Ops)</button>
        <button onClick={() => setActiveRoleTab('ADVISOR')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'ADVISOR' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>MPP Advisor</button>
        <button onClick={() => setActiveRoleTab('CANDIDATE')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'CANDIDATE' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Candidate</button>
      </aside>
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
`;

// Helper that finds content between start string and end string securely
const getBlock = (startStr, endStr) => {
  const startIdx = content.indexOf(startStr);
  if (startIdx === -1) return '';
  const endIdx = content.indexOf(endStr, startIdx);
  if (endIdx === -1) {
    // If end pattern not found, return to end of div
    return content.substring(startIdx);
  }
  return content.substring(startIdx, endIdx);
};

// Superadmin blocks
const usersBlock = getBlock('<h2>4. Users Database</h2>', '<hr style={{ margin: \'2rem 0\', borderColor: \'#ccc\' }} />');
const courseBlock = getBlock('<h2>3. Course Dictionary</h2>', '<hr style={{ margin: \'2rem 0\', borderColor: \'#ccc\' }} />');
const impersonateBlockStr = getBlock('<h2>6. Impersonate User</h2>', '</div>\n    </div>\n  );\n}');
// Trim trailing divs from impersonateBlock
const impersonateBlock = impersonateBlockStr.replace('</div>\n    </div>\n  );\n}', '');

// Admin blocks
const electionsBlock = getBlock('<h2>1. Elections</h2>', '<hr style={{ margin: \'2rem 0\', borderColor: \'#ccc\' }} />');
const votingSessionsBlock = getBlock('<h2>2. Voting Sessions</h2>', '<hr style={{ margin: \'2rem 0\', borderColor: \'#ccc\' }} />');

// Manage Candidates (Advisor + Candidate) Block String
const candMainBlock = getBlock('<h2>5. Manage Candidates</h2>', '<hr style={{ margin: \'2rem 0\', borderColor: \'#ccc\' }} />');

const candListHeader = candMainBlock.substring(0, candMainBlock.indexOf('<h3>Register Candidate</h3>'));
const registerCandBlock = candMainBlock.substring(candMainBlock.indexOf('<h3>Register Candidate</h3>'), candMainBlock.indexOf('<h3 style={{marginTop: \'2rem\'}}>Update Candidate Qualification</h3>'));
const qualBlock = candMainBlock.substring(candMainBlock.indexOf('<h3 style={{marginTop: \'2rem\'}}>Update Candidate Qualification</h3>'), candMainBlock.indexOf('<h3 style={{marginTop: \'2rem\'}}>Upload Campaign Material</h3>'));
const matBlock = candMainBlock.substring(candMainBlock.indexOf('<h3 style={{marginTop: \'2rem\'}}>Upload Campaign Material</h3>'));


const superAdminJsx = `
        {activeRoleTab === 'SUPERADMIN' && (
          <div>
            <h1>Super Admin System Operations</h1>
            <div style={{ marginTop: '2rem' }}>\n${usersBlock}</div>
            <div style={{ marginTop: '2rem' }}>\n${courseBlock}</div>
            <div style={{ marginTop: '2rem' }}>\n${impersonateBlock}</div>
          </div>
        )}
`;

const adminJsx = `
        {activeRoleTab === 'ADMIN' && (
          <div>
            <h1>Admin (Election Ops)</h1>
            <div style={{ marginTop: '2rem' }}>\n${electionsBlock}</div>
            <div style={{ marginTop: '2rem' }}>\n${votingSessionsBlock}</div>
          </div>
        )}
`;

const advisorJsx = `
        {activeRoleTab === 'ADVISOR' && (
          <div>
            <h1>Candidate Management</h1>
            <div style={{ marginTop: '2rem' }}>\n${candListHeader}</div>
            <div style={{ marginTop: '2rem' }}>\n${registerCandBlock}</div>
            <div style={{ marginTop: '2rem' }}>\n${qualBlock}</div>
          </div>
        )}
`;

const candidateJsx = `
        {activeRoleTab === 'CANDIDATE' && (
          <div>
            <h1>Candidate Form Actions</h1>
            <div style={{ marginTop: '2rem' }}>\n${matBlock}</div>
          </div>
        )}
`;

const returnIndex = content.lastIndexOf('return (');
if (returnIndex === -1) {
  console.log("Could not locate the JSX return block");
  process.exit(1);
}

const finalOutput = content.substring(0, returnIndex) + "return (\n" + sidebar + superAdminJsx + adminJsx + advisorJsx + candidateJsx + "      </main>\n    </div>\n  );\n}";

fs.writeFileSync(filePath, finalOutput, 'utf8');
console.log('Script completed replacing JSX safely');
