// FHIR Medical Informatics Application Logic

let currentPatient = null;
let filteredPatients = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    filteredPatients = [...FHIR_DATA.patients];
    renderPatientList();
    renderOverview();
    renderJSONView();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchPatients();
        }
    });
}

// Search patients
function searchPatients() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    if (!searchTerm) {
        filteredPatients = [...FHIR_DATA.patients];
    } else {
        filteredPatients = FHIR_DATA.patients.filter(patient => {
            const name = `${patient.name[0].given.join(' ')} ${patient.name[0].family}`.toLowerCase();
            const id = patient.id.toLowerCase();

            // Also search in conditions
            const hasCondition = FHIR_DATA.conditions.some(condition => {
                return condition.subject.reference === `Patient/${patient.id}` &&
                       condition.code.text.toLowerCase().includes(searchTerm);
            });

            return name.includes(searchTerm) || id.includes(searchTerm) || hasCondition;
        });
    }

    renderPatientList();
    backToList();
}

// Render patient list
function renderPatientList() {
    const container = document.getElementById('patientList');

    if (filteredPatients.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No patients found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredPatients.map(patient => {
        const age = calculateAge(patient.birthDate);
        const name = `${patient.name[0].given.join(' ')} ${patient.name[0].family}`;
        const observations = getPatientObservations(patient.id);
        const conditions = getPatientConditions(patient.id);

        return `
            <div class="patient-card" onclick="viewPatient('${patient.id}')">
                <div class="patient-name">
                    ${name}
                    <span class="badge">${patient.gender}</span>
                </div>
                <div class="patient-info">
                    <div class="info-item">
                        <strong>ID:</strong> ${patient.id}
                    </div>
                    <div class="info-item">
                        <strong>Age:</strong> ${age} years
                    </div>
                    <div class="info-item">
                        <strong>DOB:</strong> ${formatDate(patient.birthDate)}
                    </div>
                    <div class="info-item">
                        <strong>Observations:</strong> ${observations.length}
                    </div>
                    <div class="info-item">
                        <strong>Conditions:</strong> ${conditions.length}
                    </div>
                    <div class="info-item">
                        <strong>Location:</strong> ${patient.address[0].city}, ${patient.address[0].state}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// View patient details
function viewPatient(patientId) {
    currentPatient = FHIR_DATA.patients.find(p => p.id === patientId);

    if (!currentPatient) return;

    const observations = getPatientObservations(patientId);
    const conditions = getPatientConditions(patientId);
    const name = `${currentPatient.name[0].given.join(' ')} ${currentPatient.name[0].family}`;
    const age = calculateAge(currentPatient.birthDate);

    let html = `
        <div class="section">
            <h3>Patient Demographics</h3>
            <div class="patient-card selected">
                <div class="patient-name">${name}</div>
                <div class="patient-info">
                    <div class="info-item"><strong>ID:</strong> ${currentPatient.id}</div>
                    <div class="info-item"><strong>Gender:</strong> ${currentPatient.gender}</div>
                    <div class="info-item"><strong>Age:</strong> ${age} years</div>
                    <div class="info-item"><strong>DOB:</strong> ${formatDate(currentPatient.birthDate)}</div>
                    <div class="info-item"><strong>Status:</strong> ${currentPatient.active ? 'Active' : 'Inactive'}</div>
                    <div class="info-item"><strong>Phone:</strong> ${currentPatient.telecom[0].value}</div>
                    ${currentPatient.telecom[1] ? `<div class="info-item"><strong>Email:</strong> ${currentPatient.telecom[1].value}</div>` : ''}
                </div>
                <div class="patient-info" style="margin-top: 10px;">
                    <div class="info-item"><strong>Address:</strong> ${currentPatient.address[0].line[0]}, ${currentPatient.address[0].city}, ${currentPatient.address[0].state} ${currentPatient.address[0].postalCode}</div>
                </div>
            </div>
        </div>
    `;

    // Observations section
    if (observations.length > 0) {
        html += `
            <div class="section">
                <h3>Vital Signs & Lab Results (${observations.length})</h3>
                <div class="observation-grid">
                    ${observations.map(obs => `
                        <div class="observation-card">
                            <h4>${obs.code.text || obs.code.coding[0].display}</h4>
                            <div class="observation-value">${obs.valueQuantity.value} ${obs.valueQuantity.unit}</div>
                            <div class="observation-meta">
                                <div><strong>Date:</strong> ${formatDateTime(obs.effectiveDateTime)}</div>
                                <div><strong>Status:</strong> ${obs.status}</div>
                                ${obs.category ? `<div><strong>Category:</strong> ${obs.category[0].coding[0].display}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Conditions section
    if (conditions.length > 0) {
        html += `
            <div class="section">
                <h3>Medical Conditions (${conditions.length})</h3>
                ${conditions.map(condition => `
                    <div class="condition-card">
                        <h4>${condition.code.text || condition.code.coding[0].display}</h4>
                        <p><strong>Status:</strong> ${condition.clinicalStatus.coding[0].display}</p>
                        <p><strong>Onset:</strong> ${formatDate(condition.onsetDateTime)}</p>
                        ${condition.abatementDateTime ? `<p><strong>Resolved:</strong> ${formatDate(condition.abatementDateTime)}</p>` : ''}
                        <p><strong>Recorded:</strong> ${formatDate(condition.recordedDate)}</p>
                        ${condition.severity ? `<p><strong>Severity:</strong> ${condition.severity.coding[0].display}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    document.getElementById('detail-content').innerHTML = html;
    document.getElementById('patients-tab').style.display = 'none';
    document.getElementById('detail-view').classList.add('active');
}

// Back to list
function backToList() {
    currentPatient = null;
    document.getElementById('detail-view').classList.remove('active');
    document.getElementById('patients-tab').style.display = 'block';
}

// Switch tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById('detail-view').classList.remove('active');

    // Show selected tab
    const el = document.getElementById(`${tabName}-tab`);
    if (el) el.style.display = 'block';

    // The patient search bar lives outside the tabs; only show it for Patients
    const search = document.querySelector('.search-section');
    if (search) search.style.display = (tabName === 'patients') ? '' : 'none';

    // Lazy-render the game when its tab is opened
    if (tabName === 'game' && window.Game) window.Game.show();
}

// Render overview
function renderOverview() {
    const totalPatients = FHIR_DATA.patients.length;
    const totalObservations = FHIR_DATA.observations.length;
    const totalConditions = FHIR_DATA.conditions.length;
    const activeConditions = FHIR_DATA.conditions.filter(c =>
        c.clinicalStatus.coding[0].code === 'active'
    ).length;

    document.getElementById('stats-grid').innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${totalPatients}</div>
            <div class="stat-label">Total Patients</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalObservations}</div>
            <div class="stat-label">Observations</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalConditions}</div>
            <div class="stat-label">Conditions</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${activeConditions}</div>
            <div class="stat-label">Active Conditions</div>
        </div>
    `;
}

// Render JSON view (interactive collapsible tree)
let jsonFilter = 'all';

function getFilteredData() {
    if (jsonFilter === 'patients') return FHIR_DATA.patients;
    if (jsonFilter === 'observations') return FHIR_DATA.observations;
    if (jsonFilter === 'conditions') return FHIR_DATA.conditions;
    return FHIR_DATA;
}

function jsonEsc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// value: the JS value; key: property name or null; isLast: trailing comma; depth: nesting.
function renderJsonTree(value, key, isLast, depth) {
    const comma = isLast ? '' : ',';
    const keyHtml = key != null ? `<span class="jtree-key">"${jsonEsc(key)}"</span>: ` : '';
    const isArr = Array.isArray(value);
    const isObj = !isArr && value !== null && typeof value === 'object';
    // Arrays and the root object render open; nested objects start collapsed.
    const collapsed = (isObj && depth > 0) ? ' collapsed' : '';

    if (isArr) {
        const items = value.map((v, i) => renderJsonTree(v, null, i === value.length - 1, depth + 1)).join('');
        return `<div class="jtree-node">
            <div class="jtree-row"><span class="jtree-caret" onclick="jtreeToggle(this)"></span>${keyHtml}<span class="jtree-brk">[</span><span class="jtree-meta">${value.length} item${value.length === 1 ? '' : 's'}</span><span class="jtree-ell"> … ]${comma}</span></div>
            <div class="jtree-children">${items}</div>
            <div class="jtree-close"><span class="jtree-brk">]</span>${comma}</div>
        </div>`;
    }
    if (isObj) {
        const entries = Object.entries(value);
        const rt = value.resourceType ? `<span class="jtree-rt">// ${jsonEsc(value.resourceType)}</span> ` : '';
        const items = entries.map(([k, v], i) => renderJsonTree(v, k, i === entries.length - 1, depth + 1)).join('');
        return `<div class="jtree-node${collapsed}">
            <div class="jtree-row"><span class="jtree-caret" onclick="jtreeToggle(this)"></span>${keyHtml}${rt}<span class="jtree-brk">{</span><span class="jtree-ell"> … }${comma}</span></div>
            <div class="jtree-children">${items}</div>
            <div class="jtree-close"><span class="jtree-brk">}</span>${comma}</div>
        </div>`;
    }
    // primitive leaf
    let pcls = 'jtree-str', val = JSON.stringify(value);
    if (typeof value === 'number') pcls = 'jtree-num';
    else if (typeof value === 'boolean') pcls = 'jtree-bool';
    else if (value === null) { pcls = 'jtree-null'; val = 'null'; }
    return `<div class="jtree-row jtree-leaf"><span class="jtree-pad"></span>${keyHtml}<span class="${pcls}">${jsonEsc(val)}</span>${comma}</div>`;
}

function renderJSONView() {
    const data = getFilteredData();
    const tree = renderJsonTree(data, null, true, 0);
    const chips = ['all', 'patients', 'observations', 'conditions'].map(f => {
        const label = f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1);
        return `<button class="jtree-chip${jsonFilter === f ? ' active' : ''}" onclick="setJsonFilter('${f}')">${label}</button>`;
    }).join('');
    document.getElementById('json-display').innerHTML = `
        <div class="jtree-toolbar">
            <div class="jtree-chips">${chips}</div>
            <div class="jtree-tools">
                <button class="jtree-btn" onclick="jtreeExpandAll()">Expand all</button>
                <button class="jtree-btn" onclick="jtreeCollapseAll()">Collapse all</button>
                <button class="jtree-btn" onclick="jtreeCopy()">Copy JSON</button>
            </div>
        </div>
        <div class="jtree">${tree}</div>
        <div id="jtree-toast" class="jtree-toast"></div>`;
}

function setJsonFilter(f) { jsonFilter = f; renderJSONView(); }

function jtreeToggle(el) {
    el.closest('.jtree-node').classList.toggle('collapsed');
}

function jtreeExpandAll() {
    document.querySelectorAll('#json-display .jtree-node').forEach(n => n.classList.remove('collapsed'));
}

function jtreeCollapseAll() {
    document.querySelectorAll('#json-display .jtree-node').forEach(n => n.classList.add('collapsed'));
}

function jtreeCopy() {
    const text = JSON.stringify(getFilteredData(), null, 2);
    const toast = document.getElementById('jtree-toast');
    const done = () => {
        toast.textContent = '✓ Copied to clipboard';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
        fallbackCopy(text, done);
    }
}

function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* clipboard unavailable */ }
    ta.remove();
}

// Helper functions
function getPatientObservations(patientId) {
    return FHIR_DATA.observations.filter(obs =>
        obs.subject.reference === `Patient/${patientId}`
    );
}

function getPatientConditions(patientId) {
    return FHIR_DATA.conditions.filter(condition =>
        condition.subject.reference === `Patient/${patientId}`
    );
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
