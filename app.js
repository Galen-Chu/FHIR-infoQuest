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
    document.getElementById('patients-tab').style.display = 'none';
    document.getElementById('overview-tab').style.display = 'none';
    document.getElementById('json-tab').style.display = 'none';
    document.getElementById('detail-view').classList.remove('active');

    // Show selected tab
    document.getElementById(`${tabName}-tab`).style.display = 'block';
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

// Render JSON view
function renderJSONView() {
    const jsonDisplay = document.getElementById('json-display');
    jsonDisplay.innerHTML = syntaxHighlight(JSON.stringify(FHIR_DATA, null, 2));
}

// Syntax highlight JSON
function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'json-number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'json-key';
                match = match.replace(/"/g, '');
                match = match.replace(/:/, '');
                return '<span class="' + cls + '">"' + match + '"</span>:';
            } else {
                cls = 'json-string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
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
