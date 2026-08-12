// FHIR Quest — game content.
// All terminology codes are real LOINC / SNOMED CT values: those used by the
// sample data in fhir-data.js, plus commonly taught clinical codes.
// Quest cases reference resource ids (e.g. "obs-009") that the engine resolves
// against FHIR_DATA at render time, so the JSON the player sees is always real.

const GAME = {
    // --- Progression curve ---
    // Cumulative XP required to *reach* a given level (level 1 = 0 XP).
    xpForLevel: function (L) { return 60 * L * (L - 1); },
    levelTitles: [
        'Chart Novice', 'Record Clerk', 'Data Analyst', 'Informatics Specialist',
        'FHIR Medic', 'Interoperability Master', 'Health Data Guru'
    ],
    // Base XP awarded for a first-try correct answer, by difficulty.
    rewards: { easy: 25, medium: 40, hard: 60 },

    // --- Terminology codex (single source of truth for Decode + Arcade) ---
    // cat: 'vital' | 'lab' | 'condition'
    codes: [
        { id: 'loinc-8480', cat: 'vital', system: 'LOINC', systemUrl: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure', hint: 'The top number in a blood pressure reading.', explain: 'LOINC 8480-6 codes the systolic (peak) arterial pressure during heart contraction.' },
        { id: 'loinc-8462', cat: 'vital', system: 'LOINC', systemUrl: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure', hint: 'The bottom number in a blood pressure reading.', explain: 'LOINC 8462-4 codes the diastolic (trough) pressure between beats.' },
        { id: 'loinc-8867', cat: 'vital', system: 'LOINC', systemUrl: 'http://loinc.org', code: '8867-4', display: 'Heart rate', hint: 'Pulse — beats per minute.', explain: 'LOINC 8867-4 codes heart rate, typically in beats/minute.' },
        { id: 'loinc-8310', cat: 'vital', system: 'LOINC', systemUrl: 'http://loinc.org', code: '8310-5', display: 'Body temperature', hint: 'How hot the body is.', explain: 'LOINC 8310-5 codes body temperature (degF or degC).' },
        { id: 'loinc-9279', cat: 'vital', system: 'LOINC', systemUrl: 'http://loinc.org', code: '9279-1', display: 'Respiratory rate', hint: 'Breaths per minute.', explain: 'LOINC 9279-1 codes respiratory rate, in breaths/minute.' },
        { id: 'loinc-59408', cat: 'vital', system: 'LOINC', systemUrl: 'http://loinc.org', code: '59408-5', display: 'Oxygen saturation (SpO2)', hint: 'How much oxygen the blood carries, by pulse oximetry.', explain: 'LOINC 59408-5 codes oxygen saturation measured by pulse oximetry (%).' },
        { id: 'loinc-29463', cat: 'vital', system: 'LOINC', systemUrl: 'http://loinc.org', code: '29463-7', display: 'Body weight', hint: 'Measured mass.', explain: 'LOINC 29463-7 codes body weight (kg or lb).' },
        { id: 'loinc-8302', cat: 'vital', system: 'LOINC', systemUrl: 'http://loinc.org', code: '8302-2', display: 'Body height', hint: 'Standing height.', explain: 'LOINC 8302-2 codes body height (cm or in).' },
        { id: 'loinc-39156', cat: 'vital', system: 'LOINC', systemUrl: 'http://loinc.org', code: '39156-5', display: 'Body mass index (BMI)', hint: 'Weight relative to height.', explain: 'LOINC 39156-5 codes BMI (kg/m^2).' },

        { id: 'loinc-2339', cat: 'lab', system: 'LOINC', systemUrl: 'http://loinc.org', code: '2339-0', display: 'Glucose in Blood', hint: 'Blood sugar.', explain: 'LOINC 2339-0 codes blood glucose concentration (mg/dL).' },
        { id: 'loinc-718', cat: 'lab', system: 'LOINC', systemUrl: 'http://loinc.org', code: '718-7', display: 'Hemoglobin', hint: 'The oxygen-carrying protein in red blood cells.', explain: 'LOINC 718-7 codes hemoglobin mass concentration in blood (g/dL).' },
        { id: 'loinc-4544', cat: 'lab', system: 'LOINC', systemUrl: 'http://loinc.org', code: '4544-3', display: 'Hematocrit', hint: 'Fraction of blood that is red cells.', explain: 'LOINC 4544-3 codes hematocrit, the volume fraction of erythrocytes (%).' },
        { id: 'loinc-2160', cat: 'lab', system: 'LOINC', systemUrl: 'http://loinc.org', code: '2160-0', display: 'Creatinine in Serum', hint: 'A kidney-function marker.', explain: 'LOINC 2160-0 codes serum/plasma creatinine (mg/dL), a key kidney marker.' },
        { id: 'loinc-2093', cat: 'lab', system: 'LOINC', systemUrl: 'http://loinc.org', code: '2093-3', display: 'Total Cholesterol', hint: 'Blood lipid level.', explain: 'LOINC 2093-3 codes total cholesterol in serum/plasma (mg/dL).' },

        { id: 'snomed-38341003', cat: 'condition', system: 'SNOMED CT', systemUrl: 'http://snomed.info/sct', code: '38341003', display: 'Hypertension', hint: 'Persistently high blood pressure.', explain: 'SNOMED CT 38341003 = Hypertensive disorder (high blood pressure).' },
        { id: 'snomed-44054006', cat: 'condition', system: 'SNOMED CT', systemUrl: 'http://snomed.info/sct', code: '44054006', display: 'Type 2 diabetes mellitus', hint: 'Adult-onset blood-sugar disorder.', explain: 'SNOMED CT 44054006 = Type 2 diabetes mellitus.' },
        { id: 'snomed-36971009', cat: 'condition', system: 'SNOMED CT', systemUrl: 'http://snomed.info/sct', code: '36971009', display: 'Acute sinusitis', hint: 'Short-term sinus inflammation.', explain: 'SNOMED CT 36971009 = Acute sinusitis.' },
        { id: 'snomed-195967001', cat: 'condition', system: 'SNOMED CT', systemUrl: 'http://snomed.info/sct', code: '195967001', display: 'Asthma', hint: 'Reversible airway narrowing.', explain: 'SNOMED CT 195967001 = Asthma.' },
        { id: 'snomed-13645005', cat: 'condition', system: 'SNOMED CT', systemUrl: 'http://snomed.info/sct', code: '13645005', display: 'COPD', hint: 'Chronic obstructive lung disease.', explain: 'SNOMED CT 13645005 = Chronic obstructive pulmonary disease.' },
        { id: 'snomed-84114007', cat: 'condition', system: 'SNOMED CT', systemUrl: 'http://snomed.info/sct', code: '84114007', display: 'Heart failure', hint: 'The heart pumps too weakly.', explain: 'SNOMED CT 84114007 = Heart failure.' }
    ],

    // --- Badges (auto-awarded by the engine when their condition is met) ---
    badges: [
        { id: 'first-steps', name: 'First Steps', icon: '👣', desc: 'Answer your first challenge correctly.' },
        { id: 'codebreaker', name: 'Codebreaker', icon: '🔤', desc: 'Master 10 terminology codes.' },
        { id: 'on-fire', name: 'On Fire', icon: '🔥', desc: 'Reach a 5-answer streak.' },
        { id: 'unstoppable', name: 'Unstoppable', icon: '⚡', desc: 'Reach a 10-answer streak.' },
        { id: 'case-cracker', name: 'Case Cracker', icon: '🗂️', desc: 'Complete your first case.' },
        { id: 'architect', name: 'Resource Architect', icon: '🧱', desc: 'Build a valid FHIR resource.' },
        { id: 'detective', name: 'Data Detective', icon: '🔎', desc: 'Finish your first JSON Hunt.' },
        { id: 'level5', name: 'FHIR Medic', icon: '🩺', desc: 'Reach Level 5.' },
        { id: 'arcade-pro', name: 'Arcade Pro', icon: '🕹️', desc: 'Score 10 correct in one Arcade round.' }
    ],

    // --- Quest cases ---
    // Each challenge: { type, difficulty, prompt, context?|resourceId?, choices?, answer?, explain, codex?, fields?, skeleton? }
    cases: [
        {
            id: 'case-01',
            title: 'First Day on the Floor',
            icon: '🏥',
            brief: "It's your first shift as a clinical informatics analyst. Dr. Patel needs to trust that you can actually read a FHIR record before she hands you real work. Show her you can decode, navigate, and connect resources.",
            challenges: [
                {
                    type: 'decode', difficulty: 'easy',
                    prompt: "A nurse mentions Robert Williams' blood pressure is coded under LOINC 8480-6. What does that code measure?",
                    context: { kind: 'code', system: 'LOINC', code: '8480-6' },
                    choices: ['Diastolic blood pressure', 'Systolic blood pressure', 'Heart rate', 'Body temperature'],
                    answer: 1, codex: 'loinc-8480',
                    explain: "LOINC 8480-6 = Systolic blood pressure (the peak/top number). Diastolic is 8462-4."
                },
                {
                    type: 'jsonhunt', difficulty: 'easy',
                    prompt: "Open Robert Williams' systolic blood pressure observation. What value was recorded?",
                    resourceId: 'obs-009',
                    choices: ['118 mmHg', '120 mmHg', '135 mmHg', '88 mmHg'], answer: 2, codex: 'loinc-8480',
                    explain: "valueQuantity.value = 135 mmHg — Robert's systolic reading, which is elevated."
                },
                {
                    type: 'connect', difficulty: 'medium',
                    prompt: "Condition cond-002 (Type 2 diabetes mellitus) links to a patient via its subject reference. Whose chart does it belong to?",
                    resourceId: 'cond-002',
                    choices: ['John Smith (patient-001)', 'Emily Johnson (patient-002)', 'Robert Williams (patient-003)', 'No one — it is unlinked'], answer: 2,
                    explain: "condition.subject.reference = 'Patient/patient-003' → Robert Williams. References are how FHIR resources point at each other."
                }
            ]
        },
        {
            id: 'case-02',
            title: 'The Missing Measurement',
            icon: '🌡️',
            brief: "Emily Johnson's checkup is almost charted, but her temperature observation was never written into FHIR. Confirm her vitals, then build the missing resource correctly.",
            challenges: [
                {
                    type: 'jsonhunt', difficulty: 'easy',
                    prompt: "First, confirm Emily's heart rate is recorded. What is it?",
                    resourceId: 'obs-008',
                    choices: ['68 beats/minute', '72 beats/minute', '78 beats/minute'], answer: 0, codex: 'loinc-8867',
                    explain: "valueQuantity.value = 68 beats/minute for patient-002 (Emily)."
                },
                {
                    type: 'build', difficulty: 'hard',
                    prompt: "Emily's temperature was 98.6 °F at the visit. Construct the Observation resource by filling in each field.",
                    skeleton: '{\n  "resourceType": "{{resourceType}}",\n  "status": "final",\n  "code": {\n    "coding": [{ "system": "{{system}}", "code": "{{code}}", "display": "Body temperature" }]\n  },\n  "subject": { "reference": "{{subject}}" },\n  "effectiveDateTime": "2024-01-14T10:15:00Z",\n  "valueQuantity": { "value": 98.6, "unit": "{{unit}}" }\n}',
                    fields: [
                        { id: 'resourceType', label: 'resourceType', options: ['Patient', 'Observation', 'Condition'], answer: 1 },
                        { id: 'system', label: 'code system', options: ['http://loinc.org', 'http://snomed.info/sct', 'http://unitsofmeasure.org'], answer: 0 },
                        { id: 'code', label: 'LOINC code', options: ['8480-6', '8310-5', '2339-0', '8867-4'], answer: 1, codex: 'loinc-8310' },
                        { id: 'subject', label: 'subject reference', options: ['Patient/patient-001', 'Patient/patient-002', 'Patient/patient-003'], answer: 1 },
                        { id: 'unit', label: 'value unit', options: ['mmHg', 'beats/minute', 'degF', 'mg/dL'], answer: 2 }
                    ],
                    explain: "A temperature Observation uses LOINC 8310-5, points at Patient/patient-002, and carries valueQuantity with unit degF."
                },
                {
                    type: 'decode', difficulty: 'medium',
                    prompt: "Clinical conditions in FHIR are coded with SNOMED CT. What is the canonical system URI for SNOMED CT?",
                    context: { kind: 'code', system: 'SNOMED CT', code: 'http://snomed.info/sct' },
                    choices: ['http://snomed.info/sct', 'http://loinc.org', 'http://terminology.hl7.org/CodeSystem/snomed', 'urn:iso:snomed'], answer: 0,
                    explain: "SNOMED CT's identifying system URI is http://snomed.info/sct. LOINC is http://loinc.org. The system URI tells a parser which terminology a code comes from."
                }
            ]
        },
        {
            id: 'case-03',
            title: 'Hiding in Plain Sight',
            icon: '🕵️',
            brief: "Three patients, one sick chart. Find the patient who carries BOTH an active condition and an elevated blood pressure, interpret the severity, and read the status correctly.",
            challenges: [
                {
                    type: 'connect', difficulty: 'medium',
                    prompt: "Which patient has active Conditions on file?",
                    resourceId: 'cond-001',
                    choices: ['John Smith', 'Emily Johnson', 'Robert Williams', 'All three'], answer: 2,
                    explain: "Only patient-003 (Robert Williams) has Condition resources, and both carry clinicalStatus 'active'."
                },
                {
                    type: 'triage', difficulty: 'medium',
                    prompt: "Robert's systolic reading (135 mmHg) classifies him as hypertensive. Under ACC/AHA guidance, what stage is 135 mmHg?",
                    resourceId: 'obs-009',
                    choices: ['Normal (under 120)', 'Elevated (120–129)', 'Stage 1 Hypertension (130–139)', 'Stage 2 Hypertension (140+)'], answer: 2,
                    explain: "135 mmHg systolic falls in the Stage 1 Hypertension band (130–139) per ACC/AHA."
                },
                {
                    type: 'decode', difficulty: 'medium',
                    prompt: "One of Robert's conditions is SNOMED CT 44054006. What is it?",
                    context: { kind: 'code', system: 'SNOMED CT', code: '44054006' },
                    choices: ['Essential hypertension', 'Type 2 diabetes mellitus', 'Acute sinusitis', 'Asthma'], answer: 1, codex: 'snomed-44054006',
                    explain: "SNOMED CT 44054006 = Type 2 diabetes mellitus."
                },
                {
                    type: 'triage', difficulty: 'easy',
                    prompt: "John Smith's sinusitis (cond-003) carries clinicalStatus 'resolved'. What does that communicate to a clinician?",
                    resourceId: 'cond-003',
                    choices: ['The diagnosis was never confirmed', 'He has recovered; it is no longer active', 'The record was deleted', 'It is a billing error'], answer: 1,
                    explain: "clinicalStatus 'resolved' means the condition existed but the patient recovered (note the abatementDateTime). The record is preserved for history — nothing is deleted."
                }
            ]
        },
        {
            id: 'case-04',
            title: 'Closing the Chart',
            icon: '✅',
            brief: "John Smith's sinusitis has run its course. Confirm the timeline, spot a trainee's mistake, and document a clean Condition resource for the permanent record.",
            challenges: [
                {
                    type: 'jsonhunt', difficulty: 'medium',
                    prompt: "When did John's sinusitis resolve? Find the abatement date in cond-003.",
                    resourceId: 'cond-003',
                    choices: ['December 1, 2023', 'December 15, 2023', 'June 15, 2023', 'March 10, 2022'], answer: 1,
                    explain: "abatementDateTime = 2023-12-15. Onset was 2023-12-01, so the episode lasted about two weeks."
                },
                {
                    type: 'bug', difficulty: 'hard',
                    prompt: "A trainee drafted this Condition, but something is structurally wrong. Spot the defect.",
                    context: { kind: 'json', content: {
                        resourceType: 'Observation',
                        id: 'cond-003',
                        clinicalStatus: { coding: [{ code: 'resolved' }] },
                        code: { coding: [{ system: 'http://snomed.info/sct', code: '36971009', display: 'Sinusitis' }] },
                        subject: { reference: 'Patient/patient-001' }
                    }},
                    choices: ['Wrong resourceType — a Condition must be typed "Condition", not "Observation"', 'Missing id', 'Wrong code system for Sinusitis', 'clinicalStatus should be "active"'], answer: 0,
                    explain: "resourceType is the discriminator a FHIR parser uses to know what resource this is. This object describes a diagnosis but is typed 'Observation', so it would be misparsed. Always match resourceType to the resource's intent."
                },
                {
                    type: 'build', difficulty: 'hard',
                    prompt: "Now build the corrected Condition resource: a resolved sinusitis for John Smith.",
                    skeleton: '{\n  "resourceType": "{{resourceType}}",\n  "clinicalStatus": { "coding": [{ "code": "{{status}}" }] },\n  "code": { "coding": [{ "system": "{{system}}", "code": "{{code}}" }] },\n  "subject": { "reference": "{{subject}}" },\n  "onsetDateTime": "2023-12-01",\n  "abatementDateTime": "2023-12-15"\n}',
                    fields: [
                        { id: 'resourceType', label: 'resourceType', options: ['Patient', 'Observation', 'Condition'], answer: 2 },
                        { id: 'status', label: 'clinicalStatus', options: ['active', 'resolved', 'final', 'confirmed'], answer: 1 },
                        { id: 'system', label: 'code system', options: ['http://loinc.org', 'http://snomed.info/sct'], answer: 1 },
                        { id: 'code', label: 'SNOMED code', options: ['38341003', '44054006', '36971009', '195967001'], answer: 2, codex: 'snomed-36971009' },
                        { id: 'subject', label: 'subject reference', options: ['Patient/patient-001', 'Patient/patient-002', 'Patient/patient-003'], answer: 0 }
                    ],
                    explain: "Condition + clinicalStatus 'resolved' + SNOMED 36971009 (Sinusitis) + subject Patient/patient-001. The onset/abatement timeline is already filled for you."
                }
            ]
        }
    ],

    // --- Arcade (timed terminology drill) ---
    arcade: {
        roundSeconds: 45,
        baseXp: 12,
        categories: [
            { id: 'vital', name: 'Vital Signs', icon: '❤️', filter: c => c.cat === 'vital' },
            { id: 'lab', name: 'Lab Results', icon: '🧪', filter: c => c.cat === 'lab' },
            { id: 'condition', name: 'Conditions', icon: '🩹', filter: c => c.cat === 'condition' },
            { id: 'mixed', name: 'Mixed Drill', icon: '🎲', filter: c => true }
        ]
    }
};
