const fs = require('fs');
const filePath = 'd:/1-Personal-Programming/MPPVS/apps/web/src/app/dashboard/superadmin/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Inject the state variable if it's not already there
if (!content.includes('const [activeRoleTab, setActiveRoleTab] = useState(')) {
  content = content.replace(
    'const [candidates, setCandidates] = useState<any[]>([]);',
    'const [candidates, setCandidates] = useState<any[]>([]);\n  const [activeRoleTab, setActiveRoleTab] = useState(\'SUPERADMIN\');'
  );
}

const sidebar = `    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'sans-serif' }}>
      <aside style={{ width: '250px', backgroundColor: '#111827', color: '#fff', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100vh' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Tracer Bullet</h2>
        <button onClick={() => setActiveRoleTab('SUPERADMIN')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'SUPERADMIN' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Super Admin / System</button>
        <button onClick={() => setActiveRoleTab('ADMIN')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'ADMIN' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Admin (Election Ops)</button>
        <button onClick={() => setActiveRoleTab('ADVISOR')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'ADVISOR' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>MPP Advisor</button>
        <button onClick={() => setActiveRoleTab('CANDIDATE')} style={{ padding: '0.75rem', textAlign: 'left', background: activeRoleTab === 'CANDIDATE' ? '#374151' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Candidate</button>
      </aside>
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
`;

// Extraction securely matched by explicit generic div boundaries.
function extractSection(startHeaderStr) {
  const startH2Index = content.indexOf(`<h2>${startHeaderStr}`);
  const divIndex = content.lastIndexOf('<div>', startH2Index);
  
  let endIndex = content.indexOf('<hr style', startH2Index);
  if (endIndex === -1) {
    endIndex = content.lastIndexOf('</div>\n    </div>');
  }
  
  let html = content.substring(divIndex, endIndex);
  html = html.replace(/\s+$/, '');
  return html;
}

const electionsBlock = extractSection('1. Elections</h2>');
const votingSessionsBlock = extractSection('2. Voting Sessions</h2>');
const courseBlock = extractSection('3. Course Dictionary</h2>');
const usersBlock = extractSection('4. Users Database</h2>');
let candidatesBlock = extractSection('5. Manage Candidates</h2>');
const impersonateBlock = extractSection('6. Impersonate User</h2>');

// Split candidatesBlock specifically
const candRegisterIndex = candidatesBlock.indexOf('<h3>Register Candidate</h3>');
const candQualIndex = candidatesBlock.indexOf('<h3 style={{marginTop: \'2rem\'}}>Update Candidate Qualification</h3>');
const candUploadIndex = candidatesBlock.indexOf('<h3 style={{marginTop: \'2rem\'}}>Upload Campaign Material</h3>');

const candListPart = candidatesBlock.substring(0, candRegisterIndex).replace(/<div>\s*<h2>5\. Manage Candidates<\/h2>/, '');
const candHeaderAndRegister = '      <div>\n' + candidatesBlock.substring(candRegisterIndex, candQualIndex).trim() + '\n      </div>';
const candQual = '      <div>\n' + candidatesBlock.substring(candQualIndex, candUploadIndex).trim() + '\n      </div>';

let candMatClean = candidatesBlock.substring(candUploadIndex).trim();
if (candMatClean.endsWith('</div>')) {
   candMatClean = candMatClean.substring(0, candMatClean.lastIndexOf('</div>')).trim();
}
const finalCandMaterials = '      <div>\n        ' + candMatClean + '\n      </div>';

const superAdminJsx = `        {activeRoleTab === 'SUPERADMIN' && (
          <div>
            <h1>Super Admin System Operations</h1>
            <div style={{ marginTop: '2rem' }}>\n${usersBlock}\n</div>
            <div style={{ marginTop: '2rem' }}>\n${courseBlock}\n</div>
            <div style={{ marginTop: '2rem' }}>\n${impersonateBlock}\n</div>
          </div>
        )}
`;

const adminJsx = `        {activeRoleTab === 'ADMIN' && (
          <div>
            <h1>Admin (Election Ops)</h1>
            <div style={{ marginTop: '2rem' }}>\n${electionsBlock}\n</div>
            <div style={{ marginTop: '2rem' }}>\n${votingSessionsBlock}\n</div>
          </div>
        )}
`;

const advisorJsx = `        {activeRoleTab === 'ADVISOR' && (
          <div>
            <h1>Candidate Management</h1>
            <div style={{ marginTop: '2rem' }}>
              <h2>Manage Candidates Status</h2>
              ${candListPart}
            </div>
            <div style={{ marginTop: '2rem' }}>\n${candHeaderAndRegister}\n</div>
            <div style={{ marginTop: '2rem' }}>\n${candQual}\n</div>
          </div>
        )}
`;

const candidateJsx = `        {activeRoleTab === 'CANDIDATE' && (
          <div>
            <h1>Candidate Form Actions</h1>
            <div style={{ marginTop: '2rem' }}>\n${finalCandMaterials}\n</div>
          </div>
        )}
`;

const rootReturnIndex = content.lastIndexOf('  return (\n');
const endOfFileContent = content.substring(0, rootReturnIndex) + "  return (\n" + sidebar + superAdminJsx + adminJsx + advisorJsx + candidateJsx + "      </main>\n    </div>\n  );\n}\n";

fs.writeFileSync(filePath, endOfFileContent, 'utf8');
console.log('Script completed safely without orphaned tags!');
