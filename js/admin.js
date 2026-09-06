document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('loginScreen');
  const dashboardScreen = document.getElementById('dashboardScreen');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');
  const adminUserEmail = document.getElementById('adminUserEmail');
  const refreshBtn = document.getElementById('refreshBtn');
  const filterType = document.getElementById('filterType');
  const recordsBody = document.getElementById('adminRecordsBody');

  if (!window.tmsccFirebaseReady) {
    loginError.textContent = "Firebase isn't configured yet. See README-ADMIN-SETUP.md.";
    loginError.style.display = 'block';
    loginForm.querySelector('button').disabled = true;
    return;
  }

  const auth = window.tmsccAuth;
  const db = window.tmsccDb;
  let allSubmissions = [];

  // ---- Auth gate ----
  auth.onAuthStateChanged((user) => {
    if (user) {
      loginScreen.style.display = 'none';
      dashboardScreen.style.display = 'block';
      logoutBtn.style.display = 'inline-block';
      adminUserEmail.textContent = user.email;
      loadStats();
      loadSubmissions();
    } else {
      loginScreen.style.display = 'block';
      dashboardScreen.style.display = 'none';
      logoutBtn.style.display = 'none';
      adminUserEmail.textContent = '';
    }
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    auth.signInWithEmailAndPassword(email, password).catch((err) => {
      loginError.textContent = 'Sign in failed: ' + err.message;
      loginError.style.display = 'block';
    });
  });

  logoutBtn.addEventListener('click', () => auth.signOut());

  // ---- Visit stats ----
  function loadStats() {
    db.collection('site_stats').doc('counters').get().then((doc) => {
      const data = doc.exists ? doc.data() : {};
      document.getElementById('statPageViews').textContent = (data.pageViews || 0).toLocaleString();
      document.getElementById('statUniqueVisitors').textContent = (data.uniqueVisitors || 0).toLocaleString();
    }).catch((err) => console.warn('Stats load failed:', err.message));
  }

  // ---- Submissions ----
  function loadSubmissions() {
    recordsBody.innerHTML = '<tr><td colspan="5" class="empty-records">Loading…</td></tr>';
    db.collection('submissions').orderBy('timestamp', 'desc').limit(500).get()
      .then((snapshot) => {
        allSubmissions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        updateSummaryCounts();
        renderTable();
      })
      .catch((err) => {
        recordsBody.innerHTML = '<tr><td colspan="5" class="empty-records">Could not load submissions: ' + escapeHtml(err.message) + '</td></tr>';
      });
  }

  function normalizedType(s) {
    // "type" comes from the usertype field where present, else the form label.
    return s.type || s.formSource || 'Other';
  }

  function updateSummaryCounts() {
    const total = allSubmissions.length;
    const byType = { Jobseeker: 0, Employer: 0, Student: 0 };
    let other = 0;
    allSubmissions.forEach((s) => {
      const t = normalizedType(s);
      if (byType[t] !== undefined) byType[t]++;
      else other++;
    });
    document.getElementById('totalRecords').textContent = total.toLocaleString();
    document.getElementById('jobseekerRecords').textContent = byType.Jobseeker.toLocaleString();
    document.getElementById('employerRecords').textContent = byType.Employer.toLocaleString();
    document.getElementById('studentRecords').textContent = byType.Student.toLocaleString();
    document.getElementById('otherRecords').textContent = other.toLocaleString();
  }

  function nameOf(s) {
    return s.fullname || s.orgname || s.person || '—';
  }

  function contactOf(s) {
    const parts = [];
    if (s.email) parts.push(s.email);
    if (s.phone) parts.push(s.phone);
    return parts.join('<br><span style="color:var(--ink-soft)">') + (parts.length > 1 ? '</span>' : '') || '—';
  }

  function detailsOf(s) {
    const skip = new Set(['formSource', 'type', 'timestamp', 'page', 'fullname', 'orgname', 'email', 'phone', 'usertype']);
    const parts = [];
    Object.keys(s).forEach((key) => {
      if (skip.has(key) || key === 'id') return;
      if (s[key]) parts.push(s[key]);
    });
    return parts.join(' · ') || '—';
  }

  function formatDate(ts) {
    if (!ts || !ts.toDate) return '—';
    return ts.toDate().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function renderTable() {
    const filter = filterType.value;
    const rows = allSubmissions.filter((s) => filter === 'all' || normalizedType(s) === filter);

    if (!rows.length) {
      recordsBody.innerHTML = '<tr><td colspan="5" class="empty-records">No registration activity yet. Submit a jobseeker, employer or contact form to see it here.</td></tr>';
      return;
    }

    recordsBody.innerHTML = rows.map((s) => {
      const type = normalizedType(s);
      const typeClass = type === 'Employer' ? ' employer' : '';
      return '<tr>' +
        '<td><span class="record-badge' + typeClass + '">' + escapeHtml(type) + '</span></td>' +
        '<td><strong>' + escapeHtml(nameOf(s)) + '</strong></td>' +
        '<td>' + contactOf(s) + '</td>' +
        '<td>' + escapeHtml(detailsOf(s)) + '</td>' +
        '<td>' + formatDate(s.timestamp) + '</td>' +
        '</tr>';
    }).join('');
  }

  filterType.addEventListener('change', renderTable);
  refreshBtn.addEventListener('click', () => { loadStats(); loadSubmissions(); });

  document.getElementById('exportRecords').addEventListener('click', () => {
    const headings = ['Type', 'Name / organisation', 'Email', 'Phone', 'Details', 'Recorded at'];
    const quote = (value) => '"' + String(value || '').replace(/"/g, '""') + '"';
    const rows = allSubmissions.map((s) => [
      normalizedType(s), nameOf(s), s.email || '', s.phone || '', detailsOf(s),
      s.timestamp && s.timestamp.toDate ? s.timestamp.toDate().toISOString() : ''
    ].map(quote).join(','));
    const blob = new Blob([[headings.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tmscc-portal-records.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  });
});
