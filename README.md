# FHIR Medical Informatics Practice Project

A simple, standalone HTML + JavaScript application for learning FHIR (Fast Healthcare Interoperability Resources) concepts.

## 🚀 Quick Start

1. **Open the application**: Simply double-click `index.html` to open it in your web browser
2. **No server required**: This is a completely client-side application
3. **Start exploring**: Browse patient data, vital signs, and medical conditions

## 📁 Project Structure

```
D:\FHIR\
├── index.html      # Main HTML page with styling
├── fhir-data.js    # Sample FHIR resources (Patient, Observation, Condition)
├── app.js          # Application logic and interactivity
└── README.md       # This file
```

## ✨ Features

### 1. Patient Management
- View list of patients with demographics
- Search patients by name, ID, or condition
- Click on a patient to view detailed information

### 2. Clinical Data
- **Observations**: Vital signs (blood pressure, heart rate, temperature) and lab results
- **Conditions**: Medical diagnoses with status tracking
- Real FHIR-compliant data structure

### 3. Three Main Views
- **Patients Tab**: Browse and search patient records
- **Overview Tab**: Statistics and FHIR introduction
- **JSON Tab**: View raw FHIR JSON data with syntax highlighting

## 🎓 Learning Objectives

This project demonstrates:

1. **FHIR Resource Types**
   - Patient: Demographics and administrative data
   - Observation: Vital signs and lab results
   - Condition: Medical diagnoses and problems

2. **FHIR Data Elements**
   - `resourceType`: Type of FHIR resource
   - `id`: Unique identifier
   - `status`: Clinical status of records
   - `code`: Standardized codes (LOINC, SNOMED CT)
   - `subject`: Reference to patient
   - `valueQuantity`: Measurements with units
   - `effectiveDateTime`: When observation was made

3. **Code Systems Used**
   - **LOINC** (Logical Observation Identifiers Names and Codes): For lab tests and vital signs
   - **SNOMED CT**: For clinical terms and conditions
   - **HL7 Terminology**: For status and category codes

## 📊 Sample Data Included

### Patients (3)
- John Michael Smith (39 years old, Boston)
- Emily Rose Johnson (35 years old, New York)
- Robert James Williams (47 years old, Chicago) - Has hypertension and diabetes

### Observations (11)
- Blood pressure measurements (systolic and diastolic)
- Heart rate readings
- Body temperature
- Blood glucose levels

### Conditions (3)
- Essential hypertension (active)
- Type 2 diabetes mellitus (active)
- Acute sinusitis (resolved)

## 🔍 How to Use

### Search for Patients
1. Type in the search box (e.g., "Smith", "diabetes", "patient-001")
2. Press Enter or click Search
3. Click on a patient card to view details

### View Patient Details
1. Click on any patient card
2. See demographics, vital signs, and conditions
3. Click "← Back to Patients" to return

### Explore FHIR JSON
1. Click on the "FHIR JSON" tab
2. View the complete FHIR data structure
3. Color-coded JSON for easy reading

## 🌐 FHIR Concepts Demonstrated

### Patient Resource
```json
{
  "resourceType": "Patient",
  "id": "patient-001",
  "name": [{
    "family": "Smith",
    "given": ["John", "Michael"]
  }],
  "gender": "male",
  "birthDate": "1985-03-15"
}
```

### Observation Resource
```json
{
  "resourceType": "Observation",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "8480-6",
      "display": "Systolic blood pressure"
    }]
  },
  "valueQuantity": {
    "value": 120,
    "unit": "mmHg"
  }
}
```

### Condition Resource
```json
{
  "resourceType": "Condition",
  "clinicalStatus": {
    "coding": [{
      "code": "active"
    }]
  },
  "code": {
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "38341003",
      "display": "Hypertension"
    }]
  }
}
```

## 📚 Further Learning

### Official FHIR Resources
- [FHIR Official Website](https://www.hl7.org/fhir/)
- [FHIR Documentation](https://www.hl7.org/fhir/documentation.html)
- [FHIR Resource List](https://www.hl7.org/fhir/resourcelist.html)

### Code Systems
- [LOINC](https://loinc.org/) - Lab tests and observations
- [SNOMED CT](https://www.snomed.org/) - Clinical terminology
- [HL7 Terminology](http://terminology.hl7.org/) - Standard codes

## 🛠️ Customization Ideas

1. **Add more patients**: Edit `fhir-data.js` and add new patient objects
2. **Add medication data**: Create MedicationRequest resources
3. **Add allergy data**: Create AllergyIntolerance resources
4. **Connect to real FHIR server**: Replace static data with API calls
5. **Add data entry forms**: Create new FHIR resources through UI
6. **Implement validation**: Add FHIR profile validation

## 💡 Practice Exercises

1. **Add a new patient** with complete demographics
2. **Create observations** for weight and height (BMI calculation)
3. **Add a medication** resource for one of the conditions
4. **Implement a filter** to show only active conditions
5. **Create a chart** to visualize blood pressure trends

## 🎯 Next Steps

1. Learn about FHIR **profiles** and **extensions**
2. Explore **FHIR REST API** operations (GET, POST, PUT, DELETE)
3. Study **FHIR search** parameters and operations
4. Practice with a **public FHIR test server**
5. Build a more complex application with a backend

## 📝 Notes

- This is a **frontend-only** application for learning purposes
- All data is stored in JavaScript (no database)
- Data persists only during the browser session
- No authentication or security implementation
- Perfect for understanding FHIR data structures

## 🤝 Resources for Practice

- [Public FHIR Test Servers](https://wiki.hl7.org/Publicly_Available_FHIR_Servers_for_testing)
- [FHIR Sandbox Environments](https://www.hl7.org/fhir/overview.html)
- [SMART on FHIR](https://smarthealthit.org/) - Healthcare apps platform

## 📖 License

This is an educational project for personal learning and practice.

---

**Happy Learning! 🎉**

Explore FHIR resources, modify the code, and build your understanding of healthcare interoperability standards.
