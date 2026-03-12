// Sample FHIR Data for Practice
// This file contains sample FHIR resources for learning purposes

const FHIR_DATA = {
    // Patient Resources
    patients: [
        {
            resourceType: "Patient",
            id: "patient-001",
            active: true,
            name: [{
                use: "official",
                family: "Smith",
                given: ["John", "Michael"]
            }],
            gender: "male",
            birthDate: "1985-03-15",
            address: [{
                use: "home",
                line: ["123 Main Street"],
                city: "Boston",
                state: "MA",
                postalCode: "02101",
                country: "USA"
            }],
            telecom: [{
                system: "phone",
                value: "555-0101",
                use: "home"
            }, {
                system: "email",
                value: "john.smith@email.com"
            }]
        },
        {
            resourceType: "Patient",
            id: "patient-002",
            active: true,
            name: [{
                use: "official",
                family: "Johnson",
                given: ["Emily", "Rose"]
            }],
            gender: "female",
            birthDate: "1990-07-22",
            address: [{
                use: "home",
                line: ["456 Oak Avenue"],
                city: "New York",
                state: "NY",
                postalCode: "10001",
                country: "USA"
            }],
            telecom: [{
                system: "phone",
                value: "555-0202",
                use: "home"
            }]
        },
        {
            resourceType: "Patient",
            id: "patient-003",
            active: true,
            name: [{
                use: "official",
                family: "Williams",
                given: ["Robert", "James"]
            }],
            gender: "male",
            birthDate: "1978-11-30",
            address: [{
                use: "home",
                line: ["789 Pine Road"],
                city: "Chicago",
                state: "IL",
                postalCode: "60601",
                country: "USA"
            }],
            telecom: [{
                system: "phone",
                value: "555-0303",
                use: "home"
            }]
        }
    ],

    // Observation Resources (Vital Signs and Lab Results)
    observations: [
        // Patient 001 Observations
        {
            resourceType: "Observation",
            id: "obs-001",
            status: "final",
            category: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }]
            }],
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: "8480-6",
                    display: "Systolic blood pressure"
                }],
                text: "Blood Pressure Systolic"
            },
            subject: {
                reference: "Patient/patient-001"
            },
            effectiveDateTime: "2024-01-15T09:30:00Z",
            valueQuantity: {
                value: 120,
                unit: "mmHg",
                system: "http://unitsofmeasure.org",
                code: "mm[Hg]"
            }
        },
        {
            resourceType: "Observation",
            id: "obs-002",
            status: "final",
            category: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }]
            }],
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: "8462-4",
                    display: "Diastolic blood pressure"
                }],
                text: "Blood Pressure Diastolic"
            },
            subject: {
                reference: "Patient/patient-001"
            },
            effectiveDateTime: "2024-01-15T09:30:00Z",
            valueQuantity: {
                value: 80,
                unit: "mmHg",
                system: "http://unitsofmeasure.org",
                code: "mm[Hg]"
            }
        },
        {
            resourceType: "Observation",
            id: "obs-003",
            status: "final",
            category: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }]
            }],
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: "8867-4",
                    display: "Heart rate"
                }],
                text: "Heart Rate"
            },
            subject: {
                reference: "Patient/patient-001"
            },
            effectiveDateTime: "2024-01-15T09:30:00Z",
            valueQuantity: {
                value: 72,
                unit: "beats/minute",
                system: "http://unitsofmeasure.org",
                code: "/min"
            }
        },
        {
            resourceType: "Observation",
            id: "obs-004",
            status: "final",
            category: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }]
            }],
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: "8310-5",
                    display: "Body temperature"
                }],
                text: "Body Temperature"
            },
            subject: {
                reference: "Patient/patient-001"
            },
            effectiveDateTime: "2024-01-15T09:30:00Z",
            valueQuantity: {
                value: 98.6,
                unit: "degF",
                system: "http://unitsofmeasure.org",
                code: "[degF]"
            }
        },
        {
            resourceType: "Observation",
            id: "obs-005",
            status: "final",
            category: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "laboratory",
                    display: "Laboratory"
                }]
            }],
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: "2339-0",
                    display: "Glucose [Mass/volume] in Blood"
                }],
                text: "Blood Glucose"
            },
            subject: {
                reference: "Patient/patient-001"
            },
            effectiveDateTime: "2024-01-15T09:30:00Z",
            valueQuantity: {
                value: 95,
                unit: "mg/dL",
                system: "http://unitsofmeasure.org",
                code: "mg/dL"
            }
        },

        // Patient 002 Observations
        {
            resourceType: "Observation",
            id: "obs-006",
            status: "final",
            category: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }]
            }],
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: "8480-6",
                    display: "Systolic blood pressure"
                }],
                text: "Blood Pressure Systolic"
            },
            subject: {
                reference: "Patient/patient-002"
            },
            effectiveDateTime: "2024-01-14T10:15:00Z",
            valueQuantity: {
                value: 118,
                unit: "mmHg",
                system: "http://unitsofmeasure.org",
                code: "mm[Hg]"
            }
        },
        {
            resourceType: "Observation",
            id: "obs-007",
            status: "final",
            category: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }]
            }],
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: "8462-4",
                    display: "Diastolic blood pressure"
                }],
                text: "Blood Pressure Diastolic"
            },
            subject: {
                reference: "Patient/patient-002"
            },
            effectiveDateTime: "2024-01-14T10:15:00Z",
            valueQuantity: {
                value: 75,
                unit: "mmHg",
                system: "http://unitsofmeasure.org",
                code: "mm[Hg]"
            }
        },
        {
            resourceType: "Observation",
            id: "obs-008",
            status: "final",
            category: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }]
            }],
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: "8867-4",
                    display: "Heart rate"
                }],
                text: "Heart Rate"
            },
            subject: {
                reference: "Patient/patient-002"
            },
            effectiveDateTime: "2024-01-14T10:15:00Z",
            valueQuantity: {
                value: 68,
                unit: "beats/minute",
                system: "http://unitsofmeasure.org",
                code: "/min"
            }
        },

        // Patient 003 Observations
        {
            resourceType: "Observation",
            id: "obs-009",
            status: "final",
            category: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }]
            }],
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: "8480-6",
                    display: "Systolic blood pressure"
                }],
                text: "Blood Pressure Systolic"
            },
            subject: {
                reference: "Patient/patient-003"
            },
            effectiveDateTime: "2024-01-13T14:45:00Z",
            valueQuantity: {
                value: 135,
                unit: "mmHg",
                system: "http://unitsofmeasure.org",
                code: "mm[Hg]"
            }
        },
        {
            resourceType: "Observation",
            id: "obs-010",
            status: "final",
            category: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }]
            }],
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: "8462-4",
                    display: "Diastolic blood pressure"
                }],
                text: "Blood Pressure Diastolic"
            },
            subject: {
                reference: "Patient/patient-003"
            },
            effectiveDateTime: "2024-01-13T14:45:00Z",
            valueQuantity: {
                value: 88,
                unit: "mmHg",
                system: "http://unitsofmeasure.org",
                code: "mm[Hg]"
            }
        },
        {
            resourceType: "Observation",
            id: "obs-011",
            status: "final",
            category: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }]
            }],
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: "8867-4",
                    display: "Heart rate"
                }],
                text: "Heart Rate"
            },
            subject: {
                reference: "Patient/patient-003"
            },
            effectiveDateTime: "2024-01-13T14:45:00Z",
            valueQuantity: {
                value: 78,
                unit: "beats/minute",
                system: "http://unitsofmeasure.org",
                code: "/min"
            }
        }
    ],

    // Condition Resources (Medical Conditions/Diagnoses)
    conditions: [
        {
            resourceType: "Condition",
            id: "cond-001",
            clinicalStatus: {
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                    code: "active",
                    display: "Active"
                }]
            },
            verificationStatus: {
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                    code: "confirmed",
                    display: "Confirmed"
                }]
            },
            category: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/condition-category",
                    code: "encounter-diagnosis",
                    display: "Encounter Diagnosis"
                }]
            }],
            severity: {
                coding: [{
                    system: "http://snomed.info/sct",
                    code: "255604002",
                    display: "Mild"
                }]
            },
            code: {
                coding: [{
                    system: "http://snomed.info/sct",
                    code: "38341003",
                    display: "Hypertension"
                }],
                text: "Essential hypertension"
            },
            subject: {
                reference: "Patient/patient-003",
                display: "Robert Williams"
            },
            onsetDateTime: "2023-06-15",
            recordedDate: "2023-06-20"
        },
        {
            resourceType: "Condition",
            id: "cond-002",
            clinicalStatus: {
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                    code: "active",
                    display: "Active"
                }]
            },
            verificationStatus: {
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                    code: "confirmed",
                    display: "Confirmed"
                }]
            },
            category: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/condition-category",
                    code: "encounter-diagnosis",
                    display: "Encounter Diagnosis"
                }]
            }],
            severity: {
                coding: [{
                    system: "http://snomed.info/sct",
                    code: "255604002",
                    display: "Mild"
                }]
            },
            code: {
                coding: [{
                    system: "http://snomed.info/sct",
                    code: "44054006",
                    display: "Type 2 diabetes mellitus"
                }],
                text: "Type 2 diabetes mellitus without complications"
            },
            subject: {
                reference: "Patient/patient-003",
                display: "Robert Williams"
            },
            onsetDateTime: "2022-03-10",
            recordedDate: "2022-03-15"
        },
        {
            resourceType: "Condition",
            id: "cond-003",
            clinicalStatus: {
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                    code: "resolved",
                    display: "Resolved"
                }]
            },
            verificationStatus: {
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                    code: "confirmed",
                    display: "Confirmed"
                }]
            },
            category: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/condition-category",
                    code: "encounter-diagnosis",
                    display: "Encounter Diagnosis"
                }]
            }],
            code: {
                coding: [{
                    system: "http://snomed.info/sct",
                    code: "36971009",
                    display: "Sinusitis"
                }],
                text: "Acute sinusitis"
            },
            subject: {
                reference: "Patient/patient-001",
                display: "John Smith"
            },
            onsetDateTime: "2023-12-01",
            abatementDateTime: "2023-12-15",
            recordedDate: "2023-12-01"
        }
    ]
};
