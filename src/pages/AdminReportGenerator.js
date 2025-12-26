// ./pages/AdminReportGenerator.js - WITH STUDENT PROFILE EXPORT

import React, { useState } from "react";
import axios from "axios";
import "./AdminReportGenerator.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, AlignmentType, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Add this right after all your imports and before FIELD_LABELS
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const FIELD_LABELS = {
  uce: "UCE/USN",
  Name: "Name",
  DOB: "Date of Birth",
  Gender: "Gender",
  bloodGroup: "Blood Group",
  Address: "Address",
  Phone: "Phone Number",
  Email: "Email",
  type: "Achievement Type",
  category: "Category",
  organizerLocation: "Organizer Location",
  workshopLocation: "Workshop Location",
  seminarLocation: "Seminar Location",
  otherLocation: "Other Location",
  competitionLocation: "Competition Location",
  level: "Level",
  workshopName: "Workshop Name",
  seminarName: "Seminar Name",
  eventName: "Event Name",
  organizerName: "Organizer Name",
  eventDate: "Date",
  projectTopic: "Project/Paper Topic",
  position: "Position",
  prize: "Prize",
  title: "Title of Paper",
  author1: "Author 1",
  author2: "Author 2",
  author3: "Author 3",
  journalConferenceName: "Journal/Conference Name",
  publisherName: "Publisher Name",
  publicationDate: "Publication Date",
  indexing: "Indexing",
  publicationType: "Publication Type",
  courseName: "Course Name",
  startMonth: "Start Month",
  startYear: "Start Year",
  endMonth: "End Month",
  endYear: "End Year",
  awardType: "Award Type",
  amount: "Amount",
  awardingOrganization: "Awarding Organization",
  month: "Month",
  year: "Year",
  certificatePath: "Certificate"
};

const achievementSubTypes = {
  "Co-Curricular": [
    "Workshop",
    "Seminar/Webinar",
    "Project Competition",
    "Paper Presentation",
    "Paper Publication",
    "Hackathon",
    "Code Competition",
    "Other"
  ],
  "Extra-Curricular": ["Sports", "Cultural"],
  "Courses": ["Coursera", "NPTEL", "Udemy", "Others"],
  "Special Achievement": ["Scholarship", "Cash Prize"]
};

const getAchievementFields = (category, subType) => {
  if (!subType) return [];
 
  if (["Workshop", "Seminar/Webinar", "Other"].includes(subType)) {
    const locationField =
      subType === "Workshop"
        ? "workshopLocation"
        : subType === "Seminar/Webinar"
        ? "seminarLocation"
        : "otherLocation";
    const nameField =
      subType === "Workshop"
        ? "workshopName"
        : subType === "Seminar/Webinar"
        ? "seminarName"
        : "eventName";
    return [
      nameField,
      "organizerName",
      "eventDate",
      "certificatePath"
    ];
  }
 
  if (["Project Competition", "Paper Presentation"].includes(subType)) {
    return [
      "projectTopic",
      "eventDate",
      "position",
      "prize",
      "certificatePath"
    ];
  }
 
  if (subType === "Paper Publication") {
    return [
      "title",
      "author1",
      "author2",
      "author3",
      "journalConferenceName",
      "publisherName",
      "publicationDate",
      "indexing",
      "publicationType",
      "certificatePath"
    ];
  }
 
  if (["Hackathon", "Code Competition"].includes(subType)) {
    return [
      "eventName",
      "organizerName",
      "eventDate",
      "position",
      "prize",
      "certificatePath"
    ];
  }
 
  if (["Sports", "Cultural"].includes(subType)) {
    return [
      "eventName",
      "organizerName",
      "eventDate",
      "position",
      "prize",
      "certificatePath"
    ];
  }
 
  if (["Coursera", "NPTEL", "Udemy", "Others"].includes(subType)) {
    return [
      "courseName",
      "startMonth",
      "startYear",
      "endMonth",
      "endYear",
      "certificatePath"
    ];
  }
 
  if (["Scholarship", "Cash Prize"].includes(subType)) {
    return [
      "awardType",
      "amount",
      "awardingOrganization",
      "year",
      "certificatePath"
    ];
  }
 
  return [];
};

const AdminReportGenerator = () => {
  // ==============================
  // STATE DECLARATIONS
  // ==============================
  // Tab State
  const [activeTab, setActiveTab] = useState("reports");
 
  const [expandedSections, setExpandedSections] = useState({
    studentProfile: false,
    achievement: false
  });
 
  const [selectedAchievementCategory, setSelectedAchievementCategory] = useState("");
  const [selectedAchievementSubType, setSelectedAchievementSubType] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [competitionLocationFilter, setCompetitionLocationFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");
 
  const [selectedStudentFields, setSelectedStudentFields] = useState([]);
  const [selectedAchievementFields, setSelectedAchievementFields] = useState([]);
 
  const [filters, setFilters] = useState({});
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);

  // Student Profile Tab States
  const [specificUCE, setSpecificUCE] = useState("");
  const [studentProfileData, setStudentProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [selectedAchievementType, setSelectedAchievementType] = useState(null);
 
  const [showSubTypeChart, setShowSubTypeChart] = useState(false);

  // ==============================
  // HELPER FUNCTIONS
  // ==============================
  const formatDateToMMDDYYYY = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAchievementCategory = (category) => {
    setSelectedAchievementCategory(category);
    setSelectedAchievementSubType("");
    setSelectedAchievementFields([]);
    setPositionFilter("All");
    setCompetitionLocationFilter("ALL");
    setLevelFilter("ALL");
    setReportData({});
  };

  const toggleField = (field, selectedFields, setSelectedFields) => {
    if (selectedFields.includes(field)) {
      setSelectedFields((prev) => prev.filter((f) => f !== field));
    } else {
      setSelectedFields((prev) => [...prev, field]);
    }
  };

  const selectAllStudentFields = () => {
    const allStudentFields = ["uce","Name","DOB","Gender","bloodGroup","Address","Phone","Email"];
    setSelectedStudentFields(allStudentFields);
  };

  const clearAllStudentFields = () => {
    setSelectedStudentFields([]);
  };

  const selectAllAchievementFields = () => {
    if (selectedAchievementCategory && selectedAchievementSubType && selectedAchievementSubType !== "ALL") {
      const allFields = getAchievementFields(selectedAchievementCategory, selectedAchievementSubType);
      setSelectedAchievementFields(allFields);
    }
  };

  const clearAllAchievementFields = () => {
    setSelectedAchievementFields([]);
  };

  // ==============================
  // API FUNCTIONS
  // ==============================
  const fetchStudentProfile = async (uceNumber) => {
    if (!uceNumber || uceNumber.trim() === "") {
      setStudentProfileData(null);
      return;
    }

    setLoadingProfile(true);
    try {
     const response = await axios.post(`${API_BASE_URL}/admin/student-profile`, {
  uce: uceNumber.trim().toUpperCase()
});
      
     
      setStudentProfileData(response.data);
      console.log("✅ Student profile fetched:", response.data);
    } catch (err) {
      console.error("Error fetching student profile:", err);
      setStudentProfileData(null);
      alert(`No student found with UCE: ${uceNumber}`);
    } finally {
      setLoadingProfile(false);
    }
  };

 

 

  const fetchReportForSubType = async (subType) => {
    // Build achievementFilters payload
    const achievementFiltersPayload = {};
    if (selectedAchievementCategory && positionFilter) {
      achievementFiltersPayload[selectedAchievementCategory] = { position: positionFilter };
    }

    // Always include uce and Name, plus any additional student fields selected
    const studentFieldsToFetch = ["uce", "Name", ...selectedStudentFields.filter(f => f !== "uce" && f !== "Name")];

    // Get base achievement fields
    const baseAchievementFields = getAchievementFields(selectedAchievementCategory, subType).filter((f) => f !== "uce" && f !== "Name");
   
    // Add location and level fields to fetch from backend
    const locationField = ["Workshop", "Seminar/Webinar", "Other"].includes(subType)
      ? (subType === "Workshop" ? "workshopLocation"
          : subType === "Seminar/Webinar" ? "seminarLocation"
          : "otherLocation")
      : ["Hackathon", "Code Competition"].includes(subType)
      ? "organizerLocation"
      : "competitionLocation";
   
    const achievementFieldsToFetch = [...baseAchievementFields, locationField, "level"];

    const requestData = {
      studentFields: studentFieldsToFetch,
      achievementFields: achievementFieldsToFetch,
      achievementCategory: selectedAchievementCategory,
      achievementSubType: subType,
      achievementFilters: achievementFiltersPayload,
      competitionLocationFilter: competitionLocationFilter,
      levelFilter: levelFilter,
      filters: {
        ...filters,
        ...(dateRange.start && dateRange.end
          ? {
              duration: {
                start: formatDateToMMDDYYYY(dateRange.start),
                end: formatDateToMMDDYYYY(dateRange.end)
              }
            }
          : {})
      }
    };

    // Frontend validation: ensure start <= end
    if (requestData.filters.duration) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
     
      if (startDate > endDate) {
        alert("Start Date must be less than or equal to End Date");
        throw new Error("Invalid date range");
      }
    }

    const res = await axios.post(`${API_BASE_URL}/admin/report`, requestData);
    return res.data;
  };

  const generateReport = async () => {
    setLoading(true);
    setReportData({});
   
    try {
      if (!selectedAchievementCategory || !selectedAchievementSubType) {
        alert("Please select Achievement Category and Activity Type.");
        return;
      }
     
      if (selectedAchievementSubType === "ALL") {
        const subTypesToGenerate = achievementSubTypes[selectedAchievementCategory];
        let results = {};
        for (let sub of subTypesToGenerate) {
          const data = await fetchReportForSubType(sub);
          results[sub] = data || [];
        }
        setReportData(results);
      } else {
        let data = await fetchReportForSubType(selectedAchievementSubType);
        setReportData({ [selectedAchievementSubType]: data || [] });
      }
    } catch (err) {
      console.error("Error generating report:", err);
      if (err.message !== "Invalid date range") {
        alert("Error generating report: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // EXPORT FUNCTIONS - REPORTS
  // ==============================
  const exportToCSV = (subType, data, fields) => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }
    const headers = fields.map((field) => FIELD_LABELS[field] || field);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        fields.map((field) => {
          const value = row[field];
          if (Array.isArray(value)) return `"${value.join("; ")}"`;
          return `"${value || "-"}"`;
        }).join(",")
      )
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin_report_${subType}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (subType, data, fields) => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }
    const doc = new jsPDF();
    const headers = fields.map((f) => FIELD_LABELS[f] || f);
    const rows = data.map((row) => fields.map((f) => Array.isArray(row[f]) ? row[f].join("; ") : (row[f] || "-")));
    doc.text(`${selectedAchievementCategory} - ${subType} Report`, 14, 10);
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [138,43,226] }
    });
    doc.save(`admin_report_${subType}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportToWord = async (subType, data, fields) => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }
    const headerRow = new TableRow({
      children: fields.map(f => new TableCell({ children: [new Paragraph(FIELD_LABELS[f] || f)] }))
    });
    const dataRows = data.map(row => new TableRow({
      children: fields.map(f => new TableCell({
        children: [new Paragraph(Array.isArray(row[f]) ? row[f].join("; ") : (row[f] || "-"))]
      }))
    }));
    const table = new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE }
    });
    const doc = new Document({ sections: [{ children: [table] }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `admin_report_${subType}_${new Date().toISOString().split("T")[0]}.docx`);
  };

  // ==============================
  // EXPORT FUNCTIONS - STUDENT PROFILE (INDIVIDUAL SECTIONS)
  // ==============================
 
  // Export only Personal Information
  const exportPersonalInfoToCSV = () => {
    if (!studentProfileData) return;
    const { student } = studentProfileData;
   
    let csvContent = "STUDENT PERSONAL INFORMATION\n";
    csvContent += "Field,Value\n";
    Object.entries(student).forEach(([key, value]) => {
      if (key !== '_id') {
        csvContent += `"${FIELD_LABELS[key] || key}","${value || '-'}"\n`;
      }
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `personal_info_${student.uce}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportPersonalInfoToPDF = () => {
    if (!studentProfileData) return;
    const { student } = studentProfileData;
   
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(138, 43, 226);
    doc.text(`Personal Information: ${student.name}`, 14, 20);
   
    const studentInfo = [];
    Object.entries(student).forEach(([key, value]) => {
      if (key !== '_id') {
        studentInfo.push([FIELD_LABELS[key] || key, value || '-']);
      }
    });

    autoTable(doc, {
      startY: 30,
      head: [['Field', 'Value']],
      body: studentInfo,
      theme: 'grid',
      headStyles: { fillColor: [138, 43, 226] },
      margin: { left: 14 }
    });

    doc.save(`personal_info_${student.uce}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportPersonalInfoToWord = async () => {
    if (!studentProfileData) return;
    const { student } = studentProfileData;
   
    const children = [];
    children.push(
      new Paragraph({
        text: `Personal Information: ${student.name}`,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );

    const studentRows = [];
    studentRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Field", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Value", bold: true })] })
        ]
      })
    );

    Object.entries(student).forEach(([key, value]) => {
      if (key !== '_id') {
        studentRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(FIELD_LABELS[key] || key)] }),
              new TableCell({ children: [new Paragraph(String(value || '-'))] })
            ]
          })
        );
      }
    });

    children.push(
      new Table({
        rows: studentRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      })
    );

    const doc = new Document({
      sections: [{ properties: {}, children: children }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `personal_info_${student.uce}_${new Date().toISOString().split("T")[0]}.docx`);
  };

  // Export only Achievements
  const exportAchievementsToCSV = () => {
    if (!studentProfileData || !studentProfileData.achievements || studentProfileData.achievements.length === 0) {
      alert("No achievements to export!");
      return;
    }
    const { student, achievements } = studentProfileData;
   
    let csvContent = `ACHIEVEMENTS - ${student.name} (${student.uce})\n`;
    csvContent += "Type,Category,Event/Course,Date,Level,Position,Prize\n";
    achievements.forEach(ach => {
      csvContent += `"${ach.type || '-'}","${ach.category || '-'}","${ach.eventName || ach.workshopName || ach.seminarName || ach.courseName || '-'}","${ach.eventDate || '-'}","${ach.level || '-'}","${ach.position || '-'}","${ach.prize || '-'}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `achievements_${student.uce}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAchievementsToPDF = () => {
    if (!studentProfileData || !studentProfileData.achievements || studentProfileData.achievements.length === 0) {
      alert("No achievements to export!");
      return;
    }
    const { student, achievements } = studentProfileData;
   
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(138, 43, 226);
    doc.text(`Achievements: ${student.name}`, 14, 20);
   
    const achData = achievements.map(ach => [
      ach.type || '-',
      ach.category || '-',
      ach.eventName || ach.workshopName || ach.seminarName || ach.courseName || '-',
      ach.eventDate || '-',
      ach.level || '-',
      ach.position || '-',
      ach.prize || '-'
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Type', 'Category', 'Event/Course', 'Date', 'Level', 'Position', 'Prize']],
      body: achData,
      theme: 'grid',
      headStyles: { fillColor: [138, 43, 226] },
      styles: { fontSize: 8 },
      margin: { left: 14 }
    });

    doc.save(`achievements_${student.uce}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportAchievementsToWord = async () => {
    if (!studentProfileData || !studentProfileData.achievements || studentProfileData.achievements.length === 0) {
      alert("No achievements to export!");
      return;
    }
    const { student, achievements } = studentProfileData;
   
    const children = [];
    children.push(
      new Paragraph({
        text: `Achievements: ${student.name}`,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );

    const achRows = [];
    achRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Type", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Category", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Event/Course", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Date", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Level", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Position", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Prize", bold: true })] })
        ]
      })
    );

    achievements.forEach(ach => {
      achRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(ach.type || '-')] }),
            new TableCell({ children: [new Paragraph(ach.category || '-')] }),
            new TableCell({ children: [new Paragraph(ach.eventName || ach.workshopName || ach.seminarName || ach.courseName || '-')] }),
            new TableCell({ children: [new Paragraph(ach.eventDate || '-')] }),
            new TableCell({ children: [new Paragraph(ach.level || '-')] }),
            new TableCell({ children: [new Paragraph(ach.position || '-')] }),
            new TableCell({ children: [new Paragraph(ach.prize || '-')] })
          ]
        })
      );
    });

    children.push(
      new Table({
        rows: achRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      })
    );

    const doc = new Document({
      sections: [{ properties: {}, children: children }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `achievements_${student.uce}_${new Date().toISOString().split("T")[0]}.docx`);
  };

  // Export only Academic Records
  const exportAcademicsToCSV = () => {
    if (!studentProfileData || !studentProfileData.academics || studentProfileData.academics.length === 0) {
      alert("No academic records to export!");
      return;
    }
    const { student, academics } = studentProfileData;
   
    let csvContent = `ACADEMIC RECORDS - ${student.name} (${student.uce})\n`;
    csvContent += "Exam Type,School/College,Board/University,Percentage,Year\n";
    academics.forEach(acad => {
      csvContent += `"${acad.examType}","${acad.schoolCollege}","${acad.boardUniversity}","${acad.percentage}","${acad.year}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `academics_${student.uce}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAcademicsToPDF = () => {
    if (!studentProfileData || !studentProfileData.academics || studentProfileData.academics.length === 0) {
      alert("No academic records to export!");
      return;
    }
    const { student, academics } = studentProfileData;
   
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(138, 43, 226);
    doc.text(`Academic Records: ${student.name}`, 14, 20);
   
    const acadData = academics.map(acad => [
      acad.examType,
      acad.schoolCollege,
      acad.boardUniversity,
      acad.percentage,
      acad.year
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Exam Type', 'School/College', 'Board/University', 'Percentage', 'Year']],
      body: acadData,
      theme: 'grid',
      headStyles: { fillColor: [138, 43, 226] },
      margin: { left: 14 }
    });

    doc.save(`academics_${student.uce}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportAcademicsToWord = async () => {
    if (!studentProfileData || !studentProfileData.academics || studentProfileData.academics.length === 0) {
      alert("No academic records to export!");
      return;
    }
    const { student, academics } = studentProfileData;
   
    const children = [];
    children.push(
      new Paragraph({
        text: `Academic Records: ${student.name}`,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );

    const acadRows = [];
    acadRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Exam Type", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "School/College", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Board/University", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Percentage", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Year", bold: true })] })
        ]
      })
    );

    academics.forEach(acad => {
      acadRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(acad.examType)] }),
            new TableCell({ children: [new Paragraph(acad.schoolCollege)] }),
            new TableCell({ children: [new Paragraph(acad.boardUniversity)] }),
            new TableCell({ children: [new Paragraph(String(acad.percentage))] }),
            new TableCell({ children: [new Paragraph(String(acad.year))] })
          ]
        })
      );
    });

    children.push(
      new Table({
        rows: acadRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      })
    );

    const doc = new Document({
      sections: [{ properties: {}, children: children }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `academics_${student.uce}_${new Date().toISOString().split("T")[0]}.docx`);
  };

  // ==============================
  // EXPORT FUNCTIONS - STUDENT PROFILE (COMPLETE)
  // ==============================
  const exportStudentProfileToCSV = () => {
    if (!studentProfileData) {
      alert("No student profile data to export!");
      return;
    }

    const { student, achievements, academics } = studentProfileData;
    let csvContent = "";

    // Student Information Section
    csvContent += "STUDENT INFORMATION\n";
    csvContent += "Field,Value\n";
    Object.entries(student).forEach(([key, value]) => {
      if (key !== '_id') {
        csvContent += `"${FIELD_LABELS[key] || key}","${value || '-'}"\n`;
      }
    });
    csvContent += "\n";

    // Achievements Section
    if (achievements && achievements.length > 0) {
      csvContent += "ACHIEVEMENTS\n";
      csvContent += "Type,Category,Event/Course,Date,Level,Position,Prize\n";
      achievements.forEach(ach => {
        csvContent += `"${ach.type || '-'}","${ach.category || '-'}","${ach.eventName || ach.workshopName || ach.seminarName || ach.courseName || '-'}","${ach.eventDate || '-'}","${ach.level || '-'}","${ach.position || '-'}","${ach.prize || '-'}"\n`;
      });
      csvContent += "\n";
    }

    // Academic Records Section
    if (academics && academics.length > 0) {
      csvContent += "ACADEMIC RECORDS\n";
      csvContent += "Exam Type,School/College,Board/University,Percentage,Year\n";
      academics.forEach(acad => {
        csvContent += `"${acad.examType}","${acad.schoolCollege}","${acad.boardUniversity}","${acad.percentage}","${acad.year}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `student_profile_${student.uce}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportStudentProfileToPDF = () => {
    if (!studentProfileData) {
      alert("No student profile data to export!");
      return;
    }

    const { student, achievements, academics } = studentProfileData;
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(16);
    doc.setTextColor(138, 43, 226);
    doc.text(`Student Profile: ${student.name} (${student.uce})`, 14, yPosition);
    yPosition += 10;

    // Student Information
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Personal Information", 14, yPosition);
    yPosition += 5;

    const studentInfo = [];
    Object.entries(student).forEach(([key, value]) => {
      if (key !== '_id') {
        studentInfo.push([FIELD_LABELS[key] || key, value || '-']);
      }
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Field', 'Value']],
      body: studentInfo,
      theme: 'grid',
      headStyles: { fillColor: [138, 43, 226] },
      margin: { left: 14 }
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Achievements
    if (achievements && achievements.length > 0) {
      doc.text(`Achievements (${achievements.length})`, 14, yPosition);
      yPosition += 5;

      const achData = achievements.map(ach => [
        ach.type || '-',
        ach.category || '-',
        ach.eventName || ach.workshopName || ach.seminarName || ach.courseName || '-',
        ach.eventDate || '-',
        ach.level || '-',
        ach.position || '-',
        ach.prize || '-'
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Type', 'Category', 'Event/Course', 'Date', 'Level', 'Position', 'Prize']],
        body: achData,
        theme: 'grid',
        headStyles: { fillColor: [138, 43, 226] },
        styles: { fontSize: 8 },
        margin: { left: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;
    }

    // Academic Records
    if (academics && academics.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(`Academic Records (${academics.length})`, 14, yPosition);
      yPosition += 5;

      const acadData = academics.map(acad => [
        acad.examType,
        acad.schoolCollege,
        acad.boardUniversity,
        acad.percentage,
        acad.year
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Exam Type', 'School/College', 'Board/University', 'Percentage', 'Year']],
        body: acadData,
        theme: 'grid',
        headStyles: { fillColor: [138, 43, 226] },
        margin: { left: 14 }
      });
    }

    doc.save(`student_profile_${student.uce}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportStudentProfileToWord = async () => {
    if (!studentProfileData) {
      alert("No student profile data to export!");
      return;
    }

    const { student, achievements, academics } = studentProfileData;
    const children = [];

    // Title
    children.push(
      new Paragraph({
        text: `Student Profile: ${student.name} (${student.uce})`,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );

    // Student Information
    children.push(
      new Paragraph({
        text: "Personal Information",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      })
    );

    const studentRows = [];
    studentRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Field", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Value", bold: true })] })
        ]
      })
    );

    Object.entries(student).forEach(([key, value]) => {
      if (key !== '_id') {
        studentRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(FIELD_LABELS[key] || key)] }),
              new TableCell({ children: [new Paragraph(String(value || '-'))] })
            ]
          })
        );
      }
    });

    children.push(
      new Table({
        rows: studentRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      })
    );

    // Achievements
    if (achievements && achievements.length > 0) {
      children.push(
        new Paragraph({
          text: `Achievements (${achievements.length})`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 }
        })
      );

      const achRows = [];
      achRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Type", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Category", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Event/Course", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Date", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Level", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Position", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Prize", bold: true })] })
          ]
        })
      );

      achievements.forEach(ach => {
        achRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(ach.type || '-')] }),
              new TableCell({ children: [new Paragraph(ach.category || '-')] }),
              new TableCell({ children: [new Paragraph(ach.eventName || ach.workshopName || ach.seminarName || ach.courseName || '-')] }),
              new TableCell({ children: [new Paragraph(ach.eventDate || '-')] }),
              new TableCell({ children: [new Paragraph(ach.level || '-')] }),
              new TableCell({ children: [new Paragraph(ach.position || '-')] }),
              new TableCell({ children: [new Paragraph(ach.prize || '-')] })
            ]
          })
        );
      });

      children.push(
        new Table({
          rows: achRows,
          width: { size: 100, type: WidthType.PERCENTAGE }
        })
      );
    }

    // Academic Records
    if (academics && academics.length > 0) {
      children.push(
        new Paragraph({
          text: `Academic Records (${academics.length})`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 }
        })
      );

      const acadRows = [];
      acadRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Exam Type", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "School/College", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Board/University", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Percentage", bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: "Year", bold: true })] })
          ]
        })
      );

      academics.forEach(acad => {
        acadRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(acad.examType)] }),
              new TableCell({ children: [new Paragraph(acad.schoolCollege)] }),
              new TableCell({ children: [new Paragraph(acad.boardUniversity)] }),
              new TableCell({ children: [new Paragraph(String(acad.percentage))] }),
              new TableCell({ children: [new Paragraph(String(acad.year))] })
            ]
          })
        );
      });

      children.push(
        new Table({
          rows: acadRows,
          width: { size: 100, type: WidthType.PERCENTAGE }
        })
      );
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `student_profile_${student.uce}_${new Date().toISOString().split("T")[0]}.docx`);
  };

  // ✅ NEW - Pie Chart Colors
  const COLORS = {
    'Co-Curricular': '#8b5cf6',
    'Extra-Curricular': '#06b6d4',
    'Courses': '#10b981',
    'Special Achievement': '#f59e0b'
  };

  const SUBTYPE_COLORS = [
    '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe',
    '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe'
  ];

  // ✅ NEW - Render Achievement Pie Chart
  const renderAchievementPieChart = () => {
    if (!studentProfileData || !studentProfileData.achievements || studentProfileData.achievements.length === 0) {
      return null;
    }

    const achievements = studentProfileData.achievements;

    // If subtype chart is active
    if (showSubTypeChart && selectedAchievementType) {
      const subTypeData = {};
      achievements
        .filter(ach => ach.type === selectedAchievementType)
        .forEach(ach => {
          const category = ach.category || 'Other';
          subTypeData[category] = (subTypeData[category] || 0) + 1;
        });

      const chartData = Object.entries(subTypeData).map(([name, value]) => ({
        name,
        value
      }));

      return (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px',
          border: '2px solid #8a2be2'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#333', margin: 0 }}>
              📊 {selectedAchievementType} - Category Breakdown
            </h3>
            <button
              onClick={() => {
                setShowSubTypeChart(false);
                setSelectedAchievementType(null);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              ← Back
            </button>
          </div>
         
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SUBTYPE_COLORS[index % SUBTYPE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
         
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Total {selectedAchievementType} achievements: <strong>{chartData.reduce((acc, item) => acc + item.value, 0)}</strong>
            </p>
          </div>
        </div>
      );
    }

    // Main chart - Achievement Types
    const typeData = {};
    achievements.forEach(ach => {
      const type = ach.type || 'Other';
      typeData[type] = (typeData[type] || 0) + 1;
    });

    const chartData = Object.entries(typeData).map(([name, value]) => ({
      name,
      value
    }));

    const totalAchievements = achievements.length;

    return (
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px',
        border: '2px solid #8a2be2'
      }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>
          📊 Achievement Distribution
        </h3>
       
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              onClick={(data) => {
                setSelectedAchievementType(data.name);
                setShowSubTypeChart(true);
              }}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#999999'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
       
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Total achievements: <strong>{totalAchievements}</strong>
          </p>
          <p style={{ color: '#8a2be2', fontSize: '13px', fontStyle: 'italic' }}>
            💡 Click on any section to see category breakdown
          </p>
        </div>
      </div>
    );
  };

  // ==============================
  // RENDER FUNCTIONS
  // ==============================
  const renderStudentProfile = () => {
  if (!studentProfileData) return null;

  const { student, achievements, academics } = studentProfileData;

  return (
    <div className="student-profile-section" style={{
      marginTop: '20px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '2px solid #8a2be2'
    }}>
      {/* Header with Profile Photo, Title, and Export Dropdown */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        gap: '20px'
      }}>
        {/* Left side: Profile Photo + Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flex: 1
        }}>
          {/* Profile Photo */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #8a2be2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f0ff',
            flexShrink: 0
          }}>
            {student.profilePhoto ? (
              <img
                src={student.profilePhoto}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '36px', color: '#ccc' }}>👤</span>
            )}
          </div>
         
          {/* Title */}
          <h2 style={{ color: '#8a2be2', margin: 0 }}>
            Student Profile: {student.name} ({student.uce})
          </h2>
        </div>
       
        {/* Right side: Export Dropdown */}
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (val === "csv") exportStudentProfileToCSV();
            if (val === "pdf") exportStudentProfileToPDF();
            if (val === "word") exportStudentProfileToWord();
            e.target.value = "";
          }}
          className="export-dropdown"
          style={{
    padding: '6px 12px',
    fontSize: '13px',
    backgroundColor: '#8a2be2',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    flexShrink: 0,
    minWidth: '100px',
    maxWidth: '120px'
  }}
        >
          <option value="">Export As...</option>
          <option value="csv">CSV</option>
          <option value="pdf">PDF</option>
          <option value="word">Word</option>
        </select>
      </div>

      {/* Personal Information Card */}
      <div className="profile-card" style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>Personal Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
          {Object.entries(student).map(([key, value]) => {
            if (key === '_id' || key === 'profilePhoto') return null;
            return (
              <div key={key} style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <strong>{FIELD_LABELS[key] || key}:</strong> {value || '-'}
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Card */}
      {achievements && achievements.length > 0 && (
        <div className="achievements-card" style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>
            🏆 Achievements ({achievements.length})
          </h3>
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="report-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#8a2be2', color: 'white' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Type</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Category</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Event/Course</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Level</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Position</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Prize</th>
                </tr>
              </thead>
              <tbody>
                {achievements.map((ach, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{ach.type || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{ach.category || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      {ach.eventName || ach.workshopName || ach.seminarName || ach.courseName || '-'}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{ach.eventDate || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{ach.level || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{ach.position || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{ach.prize || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Academic Records Card */}
      {academics && academics.length > 0 && (
        <div className="academics-card" style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>
            📚 Academic Records ({academics.length})
          </h3>
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="report-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#8a2be2', color: 'white' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Exam Type</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>School / College</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Board / University</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Percentage</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Year</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Marksheet</th>
                </tr>
              </thead>
              <tbody>
                {academics.map((rec, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{rec.examType}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{rec.schoolCollege}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{rec.boardUniversity}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{rec.percentage}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{rec.year}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      {rec.marksheetUrl ? (
                        <a
                          href={`${API_BASE_URL}${rec.marksheetUrl}`}
  target="_blank"
  rel="noopener noreferrer"
  style={{ color: '#8a2be2', textDecoration: 'none' }}
>
  View PDF
</a>
                        
                      ) : (
                        "No File"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Achievement Pie Chart */}
      {renderAchievementPieChart()}
    </div>
  );
};

  const renderReportTables = () => {
    if (!reportData || Object.keys(reportData).length === 0) return null;
   
    return Object.entries(reportData).map(([subType, data]) => {
      // Combine student fields and achievement fields
      const studentFieldsToShow = ["uce", "Name", ...selectedStudentFields.filter(f => f !== "uce" && f !== "Name")];
      const achievementFields = getAchievementFields(selectedAchievementCategory, subType).filter(f => f !== "uce" && f !== "Name");
     
      // Always add competitionLocation and level to displayed fields
      const dynamicFields = [];
      // Determine which location field to show based on subType
      if (["Workshop", "Seminar/Webinar", "Other"].includes(subType)) {
        const locationField = subType === "Workshop" ? "workshopLocation"
          : subType === "Seminar/Webinar" ? "seminarLocation"
          : "otherLocation";
        dynamicFields.push(locationField);
      } else if (["Hackathon", "Code Competition"].includes(subType)) {
        dynamicFields.push("organizerLocation");
      } else {
        dynamicFields.push("competitionLocation");
      }
     
      // Always add level field
      dynamicFields.push("level");
     
      const fields = [...studentFieldsToShow, ...dynamicFields, ...achievementFields];
     
      return (
        <div className="report-section" key={subType}>
          <div className="report-header">
            <h3>{subType} Report ({data.length} records)</h3>
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (val === "csv") exportToCSV(subType, data, fields);
                if (val === "pdf") exportToPDF(subType, data, fields);
                if (val === "word") exportToWord(subType, data, fields);
                e.target.value = "";
              }}
              className="export-dropdown"
            >
              <option value="">Export As...</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
              <option value="word">Word</option>
            </select>
          </div>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>{fields.map(f => <th key={f}>{FIELD_LABELS[f] || f}</th>)}</tr>
              </thead>
              <tbody>
                {data.length ? data.map((row, i) => (
                  <tr key={i}>
                    {fields.map(f => (
                      <td key={f}>
                        {Array.isArray(row[f]) ? row[f].join(", ") : (row[f] || "-")}
                      </td>
                    ))}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={fields.length} style={{textAlign:"center"}}>
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    });
  };

  // ==============================
  // JSX RETURN
  // ==============================
  return (
    <div className="admin-report-generator">
      <div className="header">
        <h1>Admin Report Generator</h1>
        <p>Select fields from different categories to generate comprehensive reports</p>
      </div>

      {/* TAB NAVIGATION */}
      <div className="tab-navigation" style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <button
          onClick={() => setActiveTab("reports")}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            borderBottom: activeTab === "reports" ? '3px solid #8a2be2' : '3px solid transparent',
            backgroundColor: activeTab === "reports" ? '#f5f0ff' : 'transparent',
            color: activeTab === "reports" ? '#8a2be2' : '#666',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          📊 Generate Reports
        </button>
        <button
          onClick={() => setActiveTab("studentProfile")}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            borderBottom: activeTab === "studentProfile" ? '3px solid #8a2be2' : '3px solid transparent',
            backgroundColor: activeTab === "studentProfile" ? '#f5f0ff' : 'transparent',
            color: activeTab === "studentProfile" ? '#8a2be2' : '#666',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          👤 Student Profile
        </button>
      </div>

      {/* TAB 1: REPORTS */}
      {activeTab === "reports" && (
        <>
          {/* Date Range Filter */}
          <div className="date-filter-section">
            <h3>Date Range Filter</h3>
            <div className="date-inputs">
              <label>
                Start Date:
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </label>
            </div>
          </div>

          {/* Student Profile Section */}
          <div className="section-card">
            <div className="section-header" onClick={() => toggleSection("studentProfile")}>
              <h3>Student Profile ({selectedStudentFields.length} selected)</h3>
              <span className="toggle-icon">{expandedSections.studentProfile ? "▼" : "▶"}</span>
            </div>
            {expandedSections.studentProfile && (
              <>
                <div className="select-all-section">
                  <button
                    className="select-all-btn"
                    onClick={selectAllStudentFields}
                  >
                    Select All Fields
                  </button>
                  <button
                    className="clear-all-btn"
                    onClick={clearAllStudentFields}
                  >
                    Clear All
                  </button>
                </div>
                <div className="fields-grid">
                  {["uce","Name","DOB","Gender","bloodGroup","Address","Phone","Email"].map(field => (
                    <label key={field} className="field-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedStudentFields.includes(field)}
                        onChange={() => toggleField(field, selectedStudentFields, setSelectedStudentFields)}
                      />
                      <span>{FIELD_LABELS[field] || field}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Achievement Section */}
          <div className="section-card">
            <div className="section-header" onClick={() => toggleSection("achievement")}>
              <h3>Achievement ({selectedAchievementFields.length} selected)</h3>
              <span className="toggle-icon">{expandedSections.achievement ? "▼" : "▶"}</span>
            </div>
            {expandedSections.achievement && (
              <>
                {/* Achievement Categories */}
                <div className="category-buttons">
                  {Object.keys(achievementSubTypes).map(category => (
                    <button
                      key={category}
                      className={selectedAchievementCategory === category ? "active" : ""}
                      onClick={() => handleAchievementCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Sub-types dropdown */}
                {selectedAchievementCategory && (
                  <div className="subtype-selector">
                    <label>Select Activity Type:</label>
                    <select
                      value={selectedAchievementSubType}
                      onChange={(e) => {
                        setSelectedAchievementSubType(e.target.value);
                        setSelectedAchievementFields([]);
                        setPositionFilter("All");
                        setCompetitionLocationFilter("ALL");
                        setLevelFilter("ALL");
                        setReportData({});
                      }}
                    >
                      <option value="">-- Select --</option>
                      <option value="ALL">ALL</option>
                      {achievementSubTypes[selectedAchievementCategory].map(subType => (
                        <option key={subType} value={subType}>{subType}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Competition Location Filter dropdown */}
                {selectedAchievementSubType && (
                  <div className="competition-location-filter-section" style={{ margin: "12px 0" }}>
                    <label style={{ marginRight: 8 }}>Competition Location:</label>
                    <select
                      value={competitionLocationFilter}
                      onChange={(e) => {
                        setCompetitionLocationFilter(e.target.value);
                        setLevelFilter("ALL"); // Reset level when location changes
                      }}
                    >
                      <option value="ALL">ALL</option>
                      <option value="Within">Within State</option>
                      <option value="Outside">Outside State</option>
                    </select>
                  </div>
                )}

                {/* Level Filter dropdown - only show when competition location is Within or Outside */}
                {selectedAchievementSubType && (competitionLocationFilter === "Within" || competitionLocationFilter === "Outside") && (
                  <div className="level-filter-section" style={{ margin: "12px 0" }}>
                    <label style={{ marginRight: 8 }}>Level:</label>
                    <select
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                    >
                      <option value="ALL">ALL</option>
                      <option value="International">International</option>
                      <option value="National">National</option>
                      <option value="State">State</option>
                      <option value="Inter College">Inter College</option>
                      <option value="Intra College">Intra College</option>
                    </select>
                  </div>
                )}

                {/* Position Filter dropdown */}
                {selectedAchievementSubType && (
                  <div className="position-filter-section" style={{ margin: "12px 0" }}>
                    <label style={{ marginRight: 8 }}>Position Filter:</label>
                    <select
                      value={positionFilter}
                      onChange={(e) => setPositionFilter(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Winner">Winner</option>
                      <option value="Participant">Participant</option>
                    </select>
                  </div>
                )}

                {/* Fields for selected subtype with Select All/Clear All buttons */}
                {selectedAchievementSubType && selectedAchievementSubType !== "ALL" && (
                  <>
                    <div className="select-all-section">
                      <button
                        className="select-all-btn"
                        onClick={selectAllAchievementFields}
                      >
                        Select All Fields
                      </button>
                      <button
                        className="clear-all-btn"
                        onClick={clearAllAchievementFields}
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="fields-grid">
                      {getAchievementFields(selectedAchievementCategory, selectedAchievementSubType).map(field => (
                        <label key={field} className="field-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedAchievementFields.includes(field)}
                            onChange={() => toggleField(field, selectedAchievementFields, setSelectedAchievementFields)}
                          />
                          <span>{FIELD_LABELS[field] || field}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Generate Report Button */}
          <div className="action-section">
            <button
              onClick={generateReport}
              disabled={loading}
              className="generate-btn"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>

          {/* Report Tables */}
          {renderReportTables()}
        </>
      )}

      {/* TAB 2: STUDENT PROFILE */}
      {activeTab === "studentProfile" && (
        <div className="student-profile-tab">
          <div className="section-card">
            <h2 style={{ color: '#8a2be2', marginBottom: '20px' }}>
              👤 Search Student Profile
            </h2>
            <div className="uce-input-section">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Enter UCE Number:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="e.g., UCE2022662"
                  value={specificUCE}
                  onChange={(e) => setSpecificUCE(e.target.value.toUpperCase())}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      fetchStudentProfile(specificUCE);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '14px',
                    border: '2px solid #8a2be2',
                    borderRadius: '5px'
                  }}
                />
                <button
                  onClick={() => fetchStudentProfile(specificUCE)}
                  disabled={loadingProfile || !specificUCE}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#8a2be2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: loadingProfile || !specificUCE ? 'not-allowed' : 'pointer',
                    opacity: loadingProfile || !specificUCE ? 0.6 : 1,
                    fontWeight: '500'
                  }}
                >
                  {loadingProfile ? 'Loading...' : 'View Profile'}
                </button>
              </div>
              <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                Enter the UCE number and click "View Profile" to see complete student information
              </small>
            </div>
          </div>

          {renderStudentProfile()}
        </div>
      )}
    </div>
  );
};

export default AdminReportGenerator;
