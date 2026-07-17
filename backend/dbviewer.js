/**
 * RaktSetu — Quick Database Viewer
 * Run: node dbviewer.js
 * Open: http://localhost:5050
 * 
 * Like phpMyAdmin but built into your project!
 */

require('dotenv').config();
const http = require('http');
const mysql = require('mysql2/promise');

const DB = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'raktsetu',
};

const PORT = 5050;

const TABLES = [
  'users', 'donors', 'hospitals', 'districts',
  'otp_codes', 'refresh_tokens', 'blood_batches',
  'donations', 'emergency_requests', 'staff_invites',
  'audit_logs', 'notifications', 'transfer_requests',
  'donation_camps', 'emergency_pledges', 'surgical_schedules',
  'forecasts', 'alert_thresholds', 'demo_requests'
];

// Columns to hide for security
const HIDDEN_COLS = ['password_hash', 'token_hash', 'code'];

function escapeHtml(str) {
  if (str === null || str === undefined) return '<span style="color:#999;font-style:italic">NULL</span>';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPage(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — RaktSetu DB Viewer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f2f5; color: #1a1a2e; }
    
    .header { background: linear-gradient(135deg, #BE1F2E, #8B0000); color: white; padding: 16px 24px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
    .header h1 { font-size: 20px; font-weight: 700; }
    .header .badge { background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 12px; }
    
    .layout { display: flex; min-height: calc(100vh - 57px); }
    
    .sidebar { width: 220px; background: #1a1a2e; padding: 16px 0; flex-shrink: 0; }
    .sidebar-title { color: #888; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; padding: 0 16px 8px; }
    .sidebar a { display: block; padding: 8px 16px; color: #ccc; text-decoration: none; font-size: 13px; border-left: 3px solid transparent; transition: all 0.15s; }
    .sidebar a:hover { background: rgba(190,31,46,0.2); color: white; border-left-color: #BE1F2E; }
    .sidebar a.active { background: rgba(190,31,46,0.3); color: white; border-left-color: #BE1F2E; font-weight: 600; }
    .sidebar .count { float: right; background: #BE1F2E; color: white; font-size: 10px; padding: 1px 6px; border-radius: 10px; }
    
    .main { flex: 1; padding: 24px; overflow: auto; }
    
    .card { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); margin-bottom: 20px; overflow: hidden; }
    .card-header { padding: 16px 20px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; }
    .card-title { font-size: 16px; font-weight: 700; color: #1a1a2e; }
    .card-subtitle { font-size: 13px; color: #888; margin-top: 2px; }
    
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead { background: #f8f9fa; }
    th { padding: 10px 14px; text-align: left; font-weight: 600; color: #555; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e9ecef; white-space: nowrap; }
    td { padding: 10px 14px; border-bottom: 1px solid #f0f0f0; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    tr:hover td { background: #fafbff; }
    tr:last-child td { border-bottom: none; }
    
    .badge-role { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .role-donor { background: #e3f2fd; color: #1565c0; }
    .role-admin { background: #fce4ec; color: #c62828; }
    .role-sysadmin { background: #f3e5f5; color: #6a1b9a; }
    .role-staff { background: #e8f5e9; color: #2e7d32; }
    .role-district { background: #fff3e0; color: #e65100; }
    .role-state { background: #e0f2f1; color: #00695c; }
    
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); text-align: center; }
    .stat-num { font-size: 28px; font-weight: 700; color: #BE1F2E; }
    .stat-label { font-size: 12px; color: #888; margin-top: 4px; }
    
    .empty { text-align: center; padding: 40px; color: #aaa; font-size: 14px; }
    
    .token-cell { font-family: monospace; font-size: 11px; color: #888; max-width: 120px; overflow: hidden; text-overflow: ellipsis; }
    
    .refresh-btn { background: #BE1F2E; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; text-decoration: none; display: inline-block; }
    .refresh-btn:hover { background: #8B0000; }
    
    .verified-yes { color: #2e7d32; font-weight: 600; }
    .verified-no { color: #c62828; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>🩸 RaktSetu Database Viewer</h1>
    </div>
    <span class="badge">📦 ${DB.database} @ ${DB.host}</span>
  </div>
  <div class="layout">
    <nav class="sidebar">
      <div class="sidebar-title">Tables</div>
      ${body.sidebarLinks}
    </nav>
    <main class="main">
      ${body.content}
    </main>
  </div>
</body>
</html>`;
}

async function getTableCounts(pool) {
  const counts = {};
  for (const t of TABLES) {
    try {
      const [[row]] = await pool.query(`SELECT COUNT(*) as c FROM \`${t}\``);
      counts[t] = row.c;
    } catch { counts[t] = 0; }
  }
  return counts;
}

function makeSidebarLinks(counts, activeTable) {
  return TABLES.map(t => {
    const active = t === activeTable ? ' class="active"' : '';
    return `<a href="/?table=${t}"${active}>${t} <span class="count">${counts[t] || 0}</span></a>`;
  }).join('');
}

function makeRoleBadge(role) {
  const cls = `role-${role}` || '';
  return `<span class="badge-role ${cls}">${escapeHtml(role)}</span>`;
}

async function renderDashboard(pool, counts) {
  const stats = [
    { label: 'Total Users', key: 'users' },
    { label: 'Donors', key: 'donors' },
    { label: 'Hospitals', key: 'hospitals' },
    { label: 'OTP Codes', key: 'otp_codes' },
    { label: 'Blood Batches', key: 'blood_batches' },
    { label: 'Districts', key: 'districts' },
  ];

  const statCards = stats.map(s =>
    `<div class="stat-card">
      <div class="stat-num">${counts[s.key] || 0}</div>
      <div class="stat-label">${s.label}</div>
    </div>`
  ).join('');

  // Recent users
  const [users] = await pool.query('SELECT id, email, phone, role, created_at FROM users ORDER BY created_at DESC LIMIT 10');
  const userRows = users.map(u =>
    `<tr>
      <td>${u.id}</td>
      <td>${escapeHtml(u.email)}</td>
      <td>${escapeHtml(u.phone)}</td>
      <td>${makeRoleBadge(u.role)}</td>
      <td>${u.created_at ? new Date(u.created_at).toLocaleString('en-IN') : ''}</td>
    </tr>`
  ).join('');

  // Recent OTPs
  const [otps] = await pool.query('SELECT id, phone as target, purpose, verified, expires_at, created_at FROM otp_codes ORDER BY created_at DESC LIMIT 8');
  const otpRows = otps.map(o =>
    `<tr>
      <td>${o.id}</td>
      <td>${escapeHtml(o.target)}</td>
      <td>${escapeHtml(o.purpose)}</td>
      <td class="${o.verified ? 'verified-yes' : 'verified-no'}">${o.verified ? '✅ Used' : '⏳ Pending'}</td>
      <td>${o.created_at ? new Date(o.created_at).toLocaleString('en-IN') : ''}</td>
    </tr>`
  ).join('');

  return `
    <div class="stat-grid">${statCards}</div>
    
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">👥 Recent Users</div>
          <div class="card-subtitle">Last 10 registered users</div>
        </div>
        <a href="/?table=users" class="refresh-btn">View All →</a>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Email</th><th>Phone</th><th>Role</th><th>Created</th></tr></thead>
          <tbody>${userRows || '<tr><td colspan="5" class="empty">No users yet</td></tr>'}</tbody>
        </table>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">🔐 Recent OTP Codes</div>
          <div class="card-subtitle">Last 8 OTP requests</div>
        </div>
        <a href="/?table=otp_codes" class="refresh-btn">View All →</a>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Target</th><th>Purpose</th><th>Status</th><th>Sent At</th></tr></thead>
          <tbody>${otpRows || '<tr><td colspan="5" class="empty">No OTPs yet</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}

async function renderTable(pool, tableName, counts) {
  try {
    const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` ORDER BY id DESC LIMIT 200`);
    if (!rows.length) {
      return `<div class="card"><div class="empty">📭 Table "${tableName}" is empty</div></div>`;
    }

    const cols = Object.keys(rows[0]).filter(c => !HIDDEN_COLS.includes(c));
    const thead = cols.map(c => `<th>${escapeHtml(c)}</th>`).join('');
    const tbody = rows.map(row => {
      const cells = cols.map(c => {
        let val = row[c];
        if (c === 'role') return `<td>${makeRoleBadge(val)}</td>`;
        if (c === 'verified') return `<td class="${val ? 'verified-yes' : 'verified-no'}">${val ? '✅ Yes' : '❌ No'}</td>`;
        if (typeof val === 'string' && val.length > 80) {
          return `<td class="token-cell" title="${escapeHtml(val)}">${escapeHtml(val.substring(0, 40))}...</td>`;
        }
        if (val instanceof Date) return `<td>${val.toLocaleString('en-IN')}</td>`;
        return `<td>${escapeHtml(val)}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">📋 ${tableName}</div>
            <div class="card-subtitle">${rows.length} row(s) shown (max 200) · ${HIDDEN_COLS.join(', ')} columns hidden for security</div>
          </div>
          <a href="/?table=${tableName}" class="refresh-btn">🔄 Refresh</a>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr>${thead}</tr></thead>
            <tbody>${tbody}</tbody>
          </table>
        </div>
      </div>`;
  } catch (err) {
    return `<div class="card"><div class="empty">❌ Error: ${escapeHtml(err.message)}</div></div>`;
  }
}

async function main() {
  const pool = mysql.createPool({ ...DB, waitForConnections: true, connectionLimit: 5 });

  try {
    await pool.query('SELECT 1');
    console.log(`✅ Connected to MySQL database: ${DB.database}`);
  } catch (err) {
    console.error('❌ Cannot connect to MySQL:', err.message);
    process.exit(1);
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const tableName = url.searchParams.get('table');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    try {
      const counts = await getTableCounts(pool);
      const sidebarLinks = makeSidebarLinks(counts, tableName);

      let content;
      if (!tableName) {
        content = await renderDashboard(pool, counts);
      } else {
        content = await renderTable(pool, tableName, counts);
      }

      res.writeHead(200);
      res.end(renderPage(tableName || 'Dashboard', { sidebarLinks, content }));
    } catch (err) {
      res.writeHead(500);
      res.end(`<pre>Error: ${err.message}\n${err.stack}</pre>`);
    }
  });

  server.listen(PORT, () => {
    console.log(`\n🩸 RaktSetu DB Viewer running at: http://localhost:${PORT}`);
    console.log(`   Like phpMyAdmin — view all tables in your browser!\n`);
  });
}

main();
