const prisma = require('../src/models/prismaClient');
const bcrypt = require('bcrypt');  // Import bcrypt

const saltRounds = 10;  // Define salt rounds for bcrypt

const statuses = [
  { text: 'Pending' },
  { text: 'In Progress' },
  { text: 'Completed' },
  { text: 'On Hold' },
];

// Seed Persons
const persons = [
  { email: 'alice@example.com', name: 'Alice' }, // Task 1
  { email: 'bob@example.com', name: 'Bob' }, // Task 1
  { email: 'carol@example.com', name: 'Carol' }, // Task 2
  { email: 'dave@example.com', name: 'Dave' }, // Task 2
  { email: 'eve@example.com', name: 'Eve' },
  { email: 'frank@example.com', name: 'Frank' },
  { email: 'grace@example.com', name: 'Grace' },
  { email: 'heidi@example.com', name: 'Heidi' },
  { email: 'ivan@example.com', name: 'Ivan' },
  { email: 'judy@example.com', name: 'Judy' },
  { email: 'mallory@example.com', name: 'Mallory' },
  { email: 'oscar@example.com', name: 'Oscar' },
  { email: 'peggy@example.com', name: 'Peggy' },
  { email: 'trent@example.com', name: 'Trent' },
  { email: 'victor@example.com', name: 'Victor' },
  { email: 'walter@example.com', name: 'Walter' },
  { email: 'xavier@example.com', name: 'Xavier' },
  { email: 'yvonne@example.com', name: 'Yvonne' },
  { email: 'zara@example.com', name: 'Zara' },
  { email: 'leo@example.com', name: 'Leo' },
];

// ##############################################################
// Isaac's Seed Data
// ##############################################################
// Seed Users
const users = [
  { email: 'lebron_james.23@ichat.sp.edu.sg', name: 'Lebron James', password: '1234', points: 100, userRole: 'ADMIN',  avatarId: 3, subjectInterests: 'Basketball, Coaching', academicLevel: 'University', skills: 'Leadership, Teamwork' },
  { email: 'bob.23@ichat.sp.edu.sg', name: 'Bob', password: 'Password123!', points: 12,  subjectInterests: 'Math, Science', academicLevel: 'High School', skills: 'Problem-solving, Critical thinking' },
  { email: 'carol.23@ichat.sp.edu.sg', name: 'Carol', password: '1234', points: 24,  avatarId: 4, subjectInterests: 'Chemistry, Biology', academicLevel: 'University', skills: 'Teaching, Communication' },
  { email: 'dave.23@ichat.sp.edu.sg', name: 'Dave', password: '1234', points: 99, subjectInterests: 'Physics, Engineering', academicLevel: 'College', skills: 'Research, Innovation' },
  { email: 'eve.23@ichat.sp.edu.sg', name: 'Eve', password: '1234', points: 66,  avatarId: 5, subjectInterests: 'Math, Computer Science', academicLevel: 'University', skills: 'Problem-solving, Programming' },
  { email: 'frank.23@ichat.sp.edu.sg', name: 'Frank', password: '1234', points: 5,  subjectInterests: 'History, Literature', academicLevel: 'High School', skills: 'Reading, Writing' },
  { email: 'grace.23@ichat.sp.edu.sg', name: 'Grace', password: '1234',  subjectInterests: 'Art, Design', academicLevel: 'College', skills: 'Creativity, Drawing' },
  { email: 'heidi.23@ichat.sp.edu.sg', name: 'Heidi', password: '1234',  subjectInterests: 'Economics, Philosophy', academicLevel: 'College', skills: 'Analysis, Ethical reasoning' },
  { email: 'ivan.23@ichat.sp.edu.sg', name: 'Ivan', password: '1234',  subjectInterests: 'Psychology, Sociology', academicLevel: 'University', skills: 'Empathy, Research' },
  { email: 'judy.23@ichat.sp.edu.sg', name: 'Judy', password: '1234',  subjectInterests: 'Music, Dance', academicLevel: 'High School', skills: 'Performance, Creativity' },
  { email: 'mallory.23@ichat.sp.edu.sg', name: 'Mallory', password: '1234', avatarId: 6, subjectInterests: 'Literature, Philosophy', academicLevel: 'University', skills: 'Writing, Critical thinking' },
  { email: 'oscar.23@ichat.sp.edu.sg', name: 'Oscar', password: '1234',  avatarId: 7, subjectInterests: 'Math, Physics', academicLevel: 'University', skills: 'Teaching, Analysis' },
  { email: 'peggy.23@ichat.sp.edu.sg', name: 'Peggy', password: '1234',subjectInterests: 'Technology, Innovation', academicLevel: 'College', skills: 'Programming, Development' },
  { email: 'trent.23@ichat.sp.edu.sg', name: 'Trent', password: '1234',  subjectInterests: 'Business, Marketing', academicLevel: 'College', skills: 'Strategy, Communication' },
  { email: 'victor.23@ichat.sp.edu.sg', name: 'Victor', password: '1234',  subjectInterests: 'Sports, Fitness', academicLevel: 'High School', skills: 'Fitness, Coaching' },
  { email: 'walter.23@ichat.sp.edu.sg', name: 'Walter', password: '1234',  subjectInterests: 'History, Politics', academicLevel: 'College', skills: 'Debate, Research' },
  { email: 'xavier.23@ichat.sp.edu.sg', name: 'Xavier', password: '1234',  subjectInterests: 'Philosophy, Ethics', academicLevel: 'University', skills: 'Critical thinking, Ethical reasoning' },
  { email: 'yvonne.23@ichat.sp.edu.sg', name: 'Yvonne', password: '1234', points: 100, subjectInterests: 'Literature, Writing', academicLevel: 'High School', skills: 'Creative writing, Analysis' },
  { email: 'zara.23@ichat.sp.edu.sg', name: 'Zara', password: 'Password123!', subjectInterests: 'Biology, Ecology', academicLevel: 'College', skills: 'Research, Environmental awareness' },
  { email: 'leo.23@ichat.sp.edu.sg', name: 'Leo', password: '1234', subjectInterests: 'Art, Photography', academicLevel: 'High School', skills: 'Photography, Creativity' },
  { email: 'delete.23@ichat.sp.edu.sg', name: 'delete', password: '1234', subjectInterests: 'Art, Photography', academicLevel: 'PFP', skills: 'Getting Deleted, Sleeping' },
  //users with -t mean that they are tutors and they will be using tutor dashboard.
  { email: 'alice-t.23@ichat.sp.edu.sg', name: 'Alice', password: '1234', points: 50, isTutor: true, avatarId: 3, subjectInterests: 'Literature, Writing', academicLevel: 'University', skills: 'Creative writing, Editing' },
  { email: 'bobbi-t.23@ichat.sp.edu.sg', name: 'Bobbi', password: '1234', points: 72, isTutor: true, avatarId: 4, subjectInterests: 'Math, Statistics', academicLevel: 'University', skills: 'Analysis, Problem-solving' },
  { email: 'sophie-t.23@ichat.sp.edu.sg', name: 'Sophie', password: '1234', points: 35, isTutor: true, avatarId: 5, subjectInterests: 'History, Politics', academicLevel: 'College', skills: 'Research, Debate' },
  { email: 'johnny-t.23@ichat.sp.edu.sg', name: 'Johnny', password: '1234', points: 80, isTutor: true, avatarId: 6, subjectInterests: 'Physics, Engineering', academicLevel: 'University', skills: 'Innovation, Teaching' },
  { email: 'lara-t.23@ichat.sp.edu.sg', name: 'Lara', password: '1234', points: 120, isTutor: true, avatarId: 7, subjectInterests: 'Chemistry, Biology', academicLevel: 'University', skills: 'Lab work, Communication' },
  { email: 'oliver-t.23@ichat.sp.edu.sg', name: 'Oliver', password: '1234', points: 94, isTutor: true, avatarId: 8, subjectInterests: 'Philosophy, Ethics', academicLevel: 'College', skills: 'Critical thinking, Discussion' },
  { email: 'lucy-t.23@ichat.sp.edu.sg', name: 'Lucy', password: '1234', points: 55, isTutor: true, avatarId: 9, subjectInterests: 'Business, Economics', academicLevel: 'College', skills: 'Strategy, Marketing' },
  { email: 'simon-t.23@ichat.sp.edu.sg', name: 'Simon', password: '1234', points: 60, isTutor: true, avatarId: 10, subjectInterests: 'Music, Sound Engineering', academicLevel: 'College', skills: 'Audio production, Music theory' },
  { email: 'olga-t.23@ichat.sp.edu.sg', name: 'Olga', password: '1234', points: 43, isTutor: true, avatarId: 11, subjectInterests: 'Art, Sculpture', academicLevel: 'University', skills: 'Creative techniques, Sculpture' },
  { email: 'henry-t.23@ichat.sp.edu.sg', name: 'Henry', password: '1234', points: 99, isTutor: true, avatarId: 12, subjectInterests: 'Computer Science, Programming', academicLevel: 'University', skills: 'Software development, Algorithm design' },
];


// Seed Avatars
const avatars = [
  { imageName: 'avatar_001.png' },
  { imageName: 'avatar_002.png' },
  { imageName: 'avatar_003.png' },
  { imageName: 'avatar_004.png' },
  { imageName: 'avatar_005.png' },
  { imageName: 'avatar_006.png' },
  { imageName: 'avatar_007.png' },
  { imageName: 'avatar_008.png' },
  { imageName: 'avatar_009.png' },
  { imageName: 'avatar_010.png' },
  { imageName: 'avatar_011.png' },
  { imageName: 'avatar_012.png' },
  { imageName: 'avatar_013.png' },
  { imageName: 'avatar_014.png' },
];

// Seed for Schools
const schools = [
  { fullName: "School of Computing", shortName: "SOC" },
  { fullName: "School of Architecture & the Built Environment", shortName: "ABE" },
  { fullName: "Common Core Curriculum", shortName: "CCC" },
  { fullName: "School of Business", shortName: "SOB" },
  { fullName: "School of Chemical & Life Sciences", shortName: "CLS" },
  { fullName: "School of Electrical & Electronic Engineering", shortName: "EEE" },
  { fullName: "School of Life Skills & Communication", shortName: "LSC" },
  { fullName: "Media, Arts & Design School", shortName: "MAD" },
  { fullName: "School of Mechanical and Aeronautical Engineering", shortName: "MAE" },
  { fullName: "School of Mathematics & Science", shortName: "MS" },
  { fullName: "Singapore Maritime Academy", shortName: "SMA" }
];

// Seed for Modules
const modules = [
  { modCode: "ST0510", modName: "J2EE Application Development", schoolId: 1 }, // SOC
  { modCode: "ST0526", modName: "Continuous Integration and Continuous Delivery", schoolId: 1 }, // SOC
  { modCode: "ST2515", modName: "Secure Coding", schoolId: 1 }, // SOC
  { modCode: "ST0506", modName: "Software Engineering Practice", schoolId: 1 }, // SOC
  { modCode: "CC1S11", modName: "Overseas Sustainable Innovation Project", schoolId: 3 }, // CCC
  { modCode: "CC1S10", modName: "Sustainable Innovation Project", schoolId: 3 }, // CCC
  { modCode: "ST0100", modName: "Back-End Web Development", schoolId: 1 },
  { modCode: "ST0103", modName: "Design for User Interaction", schoolId: 1 },
  { modCode: "ST0106", modName: "Front-End Web Development", schoolId: 1 },
  { modCode: "ST0107", modName: "Fundamentals of Computing", schoolId: 1 },
  { modCode: "ST0108", modName: "Fundamentals of Programming", schoolId: 1 },
  { modCode: "ST0109", modName: "Fundamentals of Programming 2", schoolId: 1 },
  { modCode: "ST0110", modName: "Mathematics", schoolId: 1 },
  { modCode: "ST0114", modName: "Database Systems", schoolId: 1 },
  { modCode: "ST0120", modName: "Data Engineering", schoolId: 1 },
  { modCode: "ST0121", modName: "Data Structures & Algorithm (AI)", schoolId: 1 },
  { modCode: "ST0122", modName: "Data Visualisation", schoolId: 1 },
  { modCode: "ST0123", modName: "Deep Learning", schoolId: 1 },
  { modCode: "ST0124", modName: "DevOps & Automation for AI", schoolId: 1 },
  { modCode: "ST0125", modName: "Mathematics for AI", schoolId: 1 },
  { modCode: "ST0126", modName: "Practical AI", schoolId: 1 },
  { modCode: "ST0127", modName: "Infocomm Security", schoolId: 1 },
  { modCode: "ST0128", modName: "Network Fundamentals", schoolId: 1 },
  { modCode: "ST0129", modName: "Ethical Hacking", schoolId: 1 },
  { modCode: "ST0130", modName: "Cyber Defences", schoolId: 1 },
  { modCode: "ST0131", modName: "Computer Law and Investigation", schoolId: 1 },
  { modCode: "ST0132", modName: "Applied Cryptography", schoolId: 1 },
  { modCode: "ST0133", modName: "Programming in Security", schoolId: 1 },
  { modCode: "ST0134", modName: "Digital Forensics and Investigation", schoolId: 1 },
  { modCode: "ST0136", modName: "Securing Microsoft Windows", schoolId: 1 },
  { modCode: "ST0137", modName: "Linux Administration and Security", schoolId: 1 },
  { modCode: "ST0138", modName: "Malware Reverse Engineering", schoolId: 1 },
  { modCode: "ST0139", modName: "Security Policy and Incident Management", schoolId: 1 },
  { modCode: "ST0140", modName: "Infocomm Professional Seminar", schoolId: 1 },
  { modCode: "ST0141", modName: "Java Programming", schoolId: 1 },
  { modCode: "ST0142", modName: "Digital Visual Design", schoolId: 1 },
  { modCode: "ST0143", modName: "User Interface Design", schoolId: 1 },
  { modCode: "ST0144", modName: "Introduction to Immersive Simulation", schoolId: 1 },
  { modCode: "ST0145", modName: "Immersive Simulation Development Techniques", schoolId: 1 },
];


// Seed Quizzes
const quizzes = [
  {
    modCode: "ST0510",
    topic: "J2EE Application Development",
    year: "AY2024/2025",
    semester: "Semester 1",
    createdById: 1,
  },
  {
    modCode: "CC1S11",
    topic: "Overseas Sustainable Innovation Project",
    year: "AY2024/2025",
    semester: "Semester 1",
    createdById: 1,
  },
  {
    modCode: "ST0510",
    topic: "J2EE Chapter 2: MVC",
    year: "AY2023/2024",
    semester: "Semester 2",
    createdById: 1,
  },
];

// Seed Quiz Items (questions)
const quizItems = [
  {
    text: "Which of the following will we be using?",
    option1: "Eclipse",
    option2: "Visual Studio Code",
    option3: "NetBeans",
    option4: "SwiftUI",
    answer: "option1",
  },
  {
    text: "Define JSP",
    option1: "Jakarta Server Pages",
    option2: "Java Server Pages",
    option3: "John Server Pages",
    option4: "Jane Server Pages",
    answer: "option1",
  },
  {
    text: "What is the extension for a Java file?",
    option1: ".java",
    option2: ".js",
    option3: ".jsp",
    option4: ".html",
    answer: "option1",
  },
  {
    text: "Which of the following is a valid Java data type?",
    option1: "String",
    option2: "String[]",
    option3: "String[]Array",
    option4: "Str[]",
    answer: "option1",
  },
  {
    text: "Which keyword is used to define a class in Java?",
    option1: "class",
    option2: "define",
    option3: "function",
    option4: "method",
    answer: "option1",
  },
  // Repeat the structure for another quiz
  {
    text: "What is the primary value of Design Thinking in Singapore?",
    option1: "Amalgamating experiences and views across various disciplines",
    option2: "Creating technological advancements",
    option3: "Focusing solely on economic factors",
    option4: "Designing in isolation from human needs",
    answer: "option1",
  },
  {
    text: "What is the essence of Design Thinking, according to PM Lee?",
    option1: "Deep understanding of human beings, emotions, and psychology",
    option2: "Only applying technology and sociology",
    option3: "Focusing only on economics",
    option4: "Working in isolation without input from other fields",
    answer: "option1",
  },
  {
    text: "What was the purpose of The Good Kitchen project in Denmark?",
    option1: "Designing a meal delivery service for senior citizens",
    option2: "Developing a new restaurant chain for seniors",
    option3: "Improving food packaging for grocery stores",
    option4: "Creating an advanced cooking technique",
    answer: "option1",
  },
  {
    text: "What is the goal of GE Healthcare's design for medical scans for children?",
    option1: "To make medical scans fun and less intimidating for children",
    option2: "To improve MRI machines' diagnostic capabilities",
    option3: "To reduce the cost of medical scans",
    option4: "To make medical scans more accurate",
    answer: "option1",
  },
  {
    text: "What is the purpose of the Embrace Incubator?",
    option1: "To provide a low-cost, portable solution for premature babies in developing countries",
    option2: "To create a luxury product for hospitals in developed countries",
    option3: "To enhance the incubation process in modern hospitals",
    option4: "To replace traditional incubators in all hospitals",
    answer: "option1",
  }
];

// Seed Quiz Questions (linking quizzes and quiz items)
const quizQuestions = [
  { quizId: 1, itemId: 1 },
  { quizId: 1, itemId: 2 },
  { quizId: 1, itemId: 3 },
  { quizId: 1, itemId: 4 },
  { quizId: 1, itemId: 5 },
  { quizId: 2, itemId: 6 },
  { quizId: 2, itemId: 7 },
  { quizId: 2, itemId: 8 },
  { quizId: 2, itemId: 9 },
  { quizId: 2, itemId: 10 },
];

// Seed Quiz Attempts (to showcase line chart handling large amounts of data)
const quizAttempts = [
  { quizId: 1, userId: 4, status: 'Completed', score: 85, progress: {}, startedAt: new Date('2024-11-01T10:15:00Z'), endedAt: new Date('2024-11-01T10:45:00Z') },
  { quizId: 2, userId: 5, status: 'Completed', score: 90, progress: {}, startedAt: new Date('2024-11-02T11:00:00Z'), endedAt: new Date('2024-11-02T11:30:00Z') },
  { quizId: 2, userId: 6, status: 'Completed', score: 76, progress: {}, startedAt: new Date('2024-11-03T12:20:00Z'), endedAt: new Date('2024-11-03T12:50:00Z') },
  { quizId: 2, userId: 7, status: 'Completed', score: 88, progress: {}, startedAt: new Date('2024-11-04T09:45:00Z'), endedAt: new Date('2024-11-04T10:15:00Z') },
  { quizId: 2, userId: 8, status: 'Completed', score: 92, progress: {}, startedAt: new Date('2024-11-05T13:00:00Z'), endedAt: new Date('2024-11-05T13:30:00Z') },
  { quizId: 1, userId: 9, status: 'Completed', score: 67, progress: {}, startedAt: new Date('2024-11-06T14:30:00Z'), endedAt: new Date('2024-11-06T15:00:00Z') },
  { quizId: 2, userId: 10, status: 'Completed', score: 78, progress: {}, startedAt: new Date('2024-11-07T16:15:00Z'), endedAt: new Date('2024-11-07T16:45:00Z') },
  { quizId: 2, userId: 11, status: 'Completed', score: 80, progress: {}, startedAt: new Date('2024-11-08T10:50:00Z'), endedAt: new Date('2024-11-08T11:20:00Z') },
  { quizId: 2, userId: 12, status: 'Completed', score: 85, progress: {}, startedAt: new Date('2024-11-09T15:10:00Z'), endedAt: new Date('2024-11-09T15:40:00Z') },
  { quizId: 2, userId: 13, status: 'Completed', score: 89, progress: {}, startedAt: new Date('2024-11-10T17:05:00Z'), endedAt: new Date('2024-11-10T17:35:00Z') },
  { quizId: 2, userId: 14, status: 'Completed', score: 74, progress: {}, startedAt: new Date('2024-11-11T18:25:00Z'), endedAt: new Date('2024-11-11T18:55:00Z') },
  { quizId: 2, userId: 15, status: 'Completed', score: 91, progress: {}, startedAt: new Date('2024-11-12T13:40:00Z'), endedAt: new Date('2024-11-12T14:10:00Z') },
  { quizId: 2, userId: 16, status: 'Completed', score: 68, progress: {}, startedAt: new Date('2024-11-13T09:30:00Z'), endedAt: new Date('2024-11-13T10:00:00Z') },
  { quizId: 2, userId: 17, status: 'Completed', score: 79, progress: {}, startedAt: new Date('2024-11-14T14:00:00Z'), endedAt: new Date('2024-11-14T14:30:00Z') },
  { quizId: 2, userId: 18, status: 'Completed', score: 82, progress: {}, startedAt: new Date('2024-11-15T11:10:00Z'), endedAt: new Date('2024-11-15T11:40:00Z') },
  { quizId: 1, userId: 19, status: 'Completed', score: 87, progress: {}, startedAt: new Date('2024-11-16T12:25:00Z'), endedAt: new Date('2024-11-16T12:55:00Z') },
  { quizId: 2, userId: 20, status: 'Completed', score: 93, progress: {}, startedAt: new Date('2024-11-17T13:50:00Z'), endedAt: new Date('2024-11-17T14:20:00Z') },
  { quizId: 1, userId: 4, status: 'Completed', score: 75, progress: {}, startedAt: new Date('2024-11-18T10:15:00Z'), endedAt: new Date('2024-11-18T10:45:00Z') },
  { quizId: 1, userId: 5, status: 'Completed', score: 89, progress: {}, startedAt: new Date('2024-11-19T12:10:00Z'), endedAt: new Date('2024-11-19T12:40:00Z') },
  { quizId: 1, userId: 6, status: 'Completed', score: 84, progress: {}, startedAt: new Date('2024-11-20T14:15:00Z'), endedAt: new Date('2024-11-20T14:45:00Z') },
  { quizId: 1, userId: 7, status: 'Completed', score: 88, progress: {}, startedAt: new Date('2024-12-01T09:45:00Z'), endedAt: new Date('2024-12-01T10:15:00Z') },
  { quizId: 2, userId: 8, status: 'Completed', score: 92, progress: {}, startedAt: new Date('2025-01-05T13:00:00Z'), endedAt: new Date('2025-01-05T13:30:00Z') },
  { quizId: 1, userId: 9, status: 'Completed', score: 67, progress: {}, startedAt: new Date('2025-02-06T14:30:00Z'), endedAt: new Date('2025-02-06T15:00:00Z') },
  { quizId: 2, userId: 10, status: 'Completed', score: 78, progress: {}, startedAt: new Date('2025-03-07T16:15:00Z'), endedAt: new Date('2025-03-07T16:45:00Z') },
  { quizId: 2, userId: 11, status: 'Completed', score: 80, progress: {}, startedAt: new Date('2025-04-08T10:50:00Z'), endedAt: new Date('2025-04-08T11:20:00Z') },
  { quizId: 1, userId: 12, status: 'Completed', score: 85, progress: {}, startedAt: new Date('2025-05-09T15:10:00Z'), endedAt: new Date('2025-05-09T15:40:00Z') },
  { quizId: 2, userId: 13, status: 'Completed', score: 89, progress: {}, startedAt: new Date('2025-06-10T17:05:00Z'), endedAt: new Date('2025-06-10T17:35:00Z') },
  { quizId: 1, userId: 14, status: 'Completed', score: 74, progress: {}, startedAt: new Date('2025-07-11T18:25:00Z'), endedAt: new Date('2025-07-11T18:55:00Z') },
  { quizId: 2, userId: 15, status: 'Completed', score: 91, progress: {}, startedAt: new Date('2025-08-12T13:40:00Z'), endedAt: new Date('2025-08-12T14:10:00Z') },
  { quizId: 1, userId: 16, status: 'Completed', score: 68, progress: {}, startedAt: new Date('2025-09-13T09:30:00Z'), endedAt: new Date('2025-09-13T10:00:00Z') },
  { quizId: 2, userId: 17, status: 'Completed', score: 79, progress: {}, startedAt: new Date('2025-10-14T14:00:00Z'), endedAt: new Date('2025-10-14T14:30:00Z') },
  { quizId: 1, userId: 18, status: 'Completed', score: 82, progress: {}, startedAt: new Date('2025-11-15T11:10:00Z'), endedAt: new Date('2025-11-15T11:40:00Z') },
  { quizId: 2, userId: 19, status: 'Completed', score: 87, progress: {}, startedAt: new Date('2025-12-16T12:25:00Z'), endedAt: new Date('2025-12-16T12:55:00Z') },
  { quizId: 1, userId: 20, status: 'Completed', score: 93, progress: {}, startedAt: new Date('2026-01-17T13:50:00Z'), endedAt: new Date('2026-01-17T14:20:00Z') },
  { quizId: 2, userId: 4, status: 'Completed', score: 75, progress: {}, startedAt: new Date('2026-02-18T10:15:00Z'), endedAt: new Date('2026-02-18T10:45:00Z') },
  { quizId: 1, userId: 5, status: 'Completed', score: 89, progress: {}, startedAt: new Date('2026-03-19T12:10:00Z'), endedAt: new Date('2026-03-19T12:40:00Z') },
  { quizId: 2, userId: 6, status: 'Completed', score: 84, progress: {}, startedAt: new Date('2026-04-20T14:15:00Z'), endedAt: new Date('2026-04-20T14:45:00Z') },
];

const suggestions = [
  {
    title: "Improve User Profile Section",
    description: "Add a section to the user profile page to showcase achievements.",
    tags: ["UI", "Design"],
    status: "PENDING",
    createdAt: new Date('2024-11-21T10:00:00Z'),
    createdById: 3,
    reason: null, // Reason for pending state will be set after approval/rejection
  },
  {
    title: "Add Modals",
    description: "Alert messages are sometimes blocked or the user accidentally dismisses them. Consider using modals for important alerts.",
    tags: ["UI", "Design", "Feature"],
    status: "APPROVED",
    createdAt: new Date('2024-11-20T10:00:00Z'),
    createdById: 2,
    reason: "Approved for its positive impact on accessibility and user experience.",
  },
  {
    title: "Allow us to add our own profile pictures",
    description: "Title.",
    tags: ["Bug Report", "Feature"],
    status: "REJECTED",
    createdAt: new Date('2024-12-01T10:00:00Z'),
    createdById: 4,
    reason: "Rejected as it would negatively impact some users",
  },
];

// Seed Decks
const decks = [
  {
    modCode: "ST0510",
    topic: "J2EE Application Development",
    year: "AY2024/2025",
    semester: "Semester 1",
    name: "J2EE Basics",
    description: "A deck covering the basics of J2EE.",
  },
  {
    modCode: "ST0526",
    topic: "Continuous Integration and Continuous Delivery",
    year: "AY2024/2025",
    semester: "Semester 1",
    name: "CI/CD Fundamentals",
    description: "A deck introducing CI/CD concepts.",
  },
  {
    modCode: "ST2515",
    topic: "Secure Coding",
    year: "AY2024/2025",
    semester: "Semester 1",
    name: "Secure Coding Techniques",
    description: "A deck for learning secure coding practices.",
  },
  {
    modCode: "CC1S11",
    topic: "Overseas Sustainable Innovation Project",
    year: "AY2024/2025",
    semester: "Semester 1",
    name: "Sustainable Innovation",
    description: "A deck exploring sustainable innovation practices.",
  },
  {
    modCode: "ST0100",
    topic: "Back-End Web Development",
    year: "AY2024/2025",
    semester: "Semester 1",
    name: "Back-End Basics",
    description: "A deck to understand basic back-end concepts.",
  },
  {
    modCode: "ST0510",
    topic: "J2EE Chapter 1: Introduction to Servlets",
    year: "AY2024/2025",
    semester: "Semester 1",
    name: "Servlet Basics",
    description: "A deck introducing servlet fundamentals and their lifecycle.",
  },
  {
    modCode: "ST0510",
    topic: "J2EE Chapter 2: JSP Fundamentals",
    year: "AY2024/2025",
    semester: "Semester 1",
    name: "JSP Essentials",
    description: "A deck covering the basics of JavaServer Pages (JSP).",
  },
  {
    modCode: "ST0510",
    topic: "J2EE Chapter 3: MVC Architecture",
    year: "AY2024/2025",
    semester: "Semester 2",
    name: "MVC Framework",
    description: "A deck explaining the Model-View-Controller architecture.",
  },
  {
    modCode: "ST0510",
    topic: "J2EE Chapter 4: JDBC and Database Connectivity",
    year: "AY2023/2024",
    semester: "Semester 2",
    name: "JDBC Essentials",
    description: "A deck to understand JDBC and its integration with J2EE apps.",
  },
  {
    modCode: "ST0510",
    topic: "J2EE Chapter 5: Web Security",
    year: "AY2023/2024",
    semester: "Semester 2",
    name: "Securing J2EE Applications",
    description: "A deck focusing on implementing security in J2EE applications.",
  },
];

// Seed Flashcards
const flashcards = [
  {
    title: "What is J2EE?",
    content: "J2EE is a platform for developing web applications in Java.",
    tags: ["J2EE", "Java", "Web Development"],
    deckId: 1,
  },
  {
    title: "What is CI/CD?",
    content: "CI/CD stands for Continuous Integration and Continuous Delivery.",
    tags: ["CI/CD", "Software Engineering"],
    deckId: 2,
  },
  {
    title: "What are secure coding practices?",
    content: "Secure coding practices include validation, sanitization, and encoding to protect against security vulnerabilities.",
    tags: ["Security", "Coding"],
    deckId: 3,
  },
  {
    title: "What is sustainable innovation?",
    content: "Sustainable innovation involves creating solutions that meet the needs of the present without compromising the future.",
    tags: ["Sustainability", "Innovation"],
    deckId: 4,
  },
  {
    title: "What is back-end web development?",
    content: "Back-end web development focuses on server-side logic, databases, and APIs to support front-end applications.",
    tags: ["Back-End", "Web Development"],
    deckId: 5,
  },
  // Additional J2EE and Eclipse-related flashcards
  {
    title: "What is the proper syntax for a prepared statement in Java?",
    content: "Prepared statements in Java are created using the `Connection.prepareStatement()` method. Example: `PreparedStatement ps = conn.prepareStatement('SELECT * FROM users WHERE id = ?');`.",
    tags: ["J2EE", "Java", "Prepared Statement"],
    deckId: 1,
  },
  {
    title: "How do you insert a header or footer in a JSP page?",
    content: "In JSP, you can insert a header or footer using `include` directive or by creating reusable fragments (like in `header.jsp` or `footer.jsp`). Example: `<%@ include file='header.jsp' %>`.",
    tags: ["J2EE", "JSP", "Header", "Footer"],
    deckId: 1,
  },
  {
    title: "When was the Eclipse Foundation established?",
    content: "The Eclipse Foundation was established in 2004 to support the Eclipse open-source projects and provide a vendor-neutral governance structure.",
    tags: ["Eclipse", "History"],
    deckId: 1,
  },
  {
    title: "What is the main benefit of using J2EE?",
    content: "The main benefit of using J2EE is that it provides a platform-independent, distributed, and scalable framework for building enterprise-level web applications.",
    tags: ["J2EE", "Java", "Enterprise"],
    deckId: 1,
  },
  {
    title: "What is the difference between JSP and Servlet in J2EE?",
    content: "JSP (JavaServer Pages) is used for creating dynamic web pages, while Servlets are Java classes that handle HTTP requests and generate responses. JSP is often used with servlets for MVC architecture.",
    tags: ["J2EE", "JSP", "Servlet", "Web Development"],
    deckId: 1,
  },
  {
    title: "How do you connect to a database in J2EE?",
    content: "In J2EE, you can connect to a database using JDBC (Java Database Connectivity) by loading the database driver and establishing a connection through `DriverManager.getConnection()`.",
    tags: ["J2EE", "Java", "JDBC", "Database"],
    deckId: 1,
  },
  {
    title: "What is a web container in J2EE?",
    content: "A web container (or servlet container) is a part of the Java EE server that provides the environment for running servlets and JSPs. It handles request dispatching, session management, and lifecycle management of servlets.",
    tags: ["J2EE", "Servlet", "Web Container"],
    deckId: 1,
  },
  {
    title: "What is the difference between EJB and JSP in J2EE?",
    content: "EJB (Enterprise JavaBeans) is used for building business logic in an enterprise application, while JSP (JavaServer Pages) is used for creating dynamic web pages. EJBs are typically used in the back-end, while JSPs are used in the front-end.",
    tags: ["J2EE", "EJB", "JSP", "Enterprise"],
    deckId: 1,
  },
];


// Seed Flashcard Progress
const deckProgress = [
  {
    userId: 1,
    deckId: 1,
    progress: 2, // Mastered
    lastReviewed: new Date(),
  },
  {
    userId: 2,
    deckId: 2,
    progress: 1, // In Progress
    lastReviewed: new Date(),
  },
  {
    userId: 3,
    deckId: 3,
    progress: 0, // Not Started
  },
  {
    userId: 4,
    deckId: 4,
    progress: 2, // Mastered
    lastReviewed: new Date(),
  },
  {
    userId: 5,
    deckId: 5,
    progress: 1, // In Progress
    lastReviewed: new Date(),
  },
];

// Seed Notifications
const notifications = [
  {
    type: 'ANNOUNCEMENT',
    title: 'Server Maintenance',
    message: 'Scheduled server maintenance will take place this Saturday from 2 AM to 4 AM. Expect some downtime.',
    isGlobal: true,
    createdAt: new Date(new Date().getTime() - Math.floor(Math.random() * 10000000000)).toISOString(),
  },
  {
    type: 'ANNOUNCEMENT',
    title: 'New Features',
    message: 'We\'ve added new features to the app! Check out the new quiz and flashcard functionalities.',
    isGlobal: true,
    createdAt: new Date(new Date().getTime() - Math.floor(Math.random() * 10000000000)).toISOString(),
  },
  {
    type: 'ANNOUNCEMENT',
    title: 'Holiday Notice',
    message: 'Happy holidays! Our team will be on leave from Dec 25 to Jan 1. Support may be delayed during this period.',
    isGlobal: true,
    createdAt: new Date(new Date().getTime() - Math.floor(Math.random() * 10000000000)).toISOString(),
  },
  {
    type: 'ANNOUNCEMENT',
    title: 'Feedback Reminder',
    message: 'We value your input! Please take a moment to provide feedback on your experience with our platform.',
    isGlobal: true,
    createdAt: new Date(new Date().getTime() - Math.floor(Math.random() * 10000000000)).toISOString(),
  },
  {
    type: 'ANNOUNCEMENT',
    title: 'System Update',
    message: 'A new system update is available. Please log out and log back in to access the latest features.',
    isGlobal: true,
    createdAt: new Date(new Date().getTime() - Math.floor(Math.random() * 10000000000)).toISOString(),
  },

  // Personal Notifications
  {
    type: 'PERSONAL',
    title: 'Assignment Reminder',
    message: 'Don\'t forget to submit your assignment by 11:59 PM tonight!',
    userId: 2,
    createdAt: new Date(new Date().getTime() - Math.floor(Math.random() * 10000000000)).toISOString(),
  },
  {
    type: 'PERSONAL',
    title: 'Event Registration',
    message: 'You have successfully registered for the upcoming workshop: Introduction to Cybersecurity.',
    userId: 2,
    createdAt: new Date(new Date().getTime() - Math.floor(Math.random() * 10000000000)).toISOString(),
  },
];

const pointsRules = [
  {
    type: "QUIZ",                  
    calculation: "quizAccuracy",   // Points based on % correct in first attempt
    description: "Points awarded based on the accuracy of the user's first quiz attempt.",
  },
  {
    type: "FLASHCARD",             
    calculation: "flashcardLength", // Points based on the total number of flashcards in a deck
    description: "Points awarded based on the total number of flashcards completed in a deck.",
  },
  {
    type: "GENERAL",              
    calculation: "fixed",          // For other activities with fixed points
    description: "Fixed points awarded for completing specific tasks or actions.",
  }
];

// Seed data for Shop Products
const products = [
  // Merchandise Items
  {
    name: "DCDF x Gryphons Totebag",
    description: "Limited edition tote bag featuring a collaboration between DCDF and Gryphons.",
    category: "Merchandise",
    price: 12, 
    stock: 100,
    numberSold: 0,
    status: "IN_STOCK",
    image: "../images/dcdf_gryphons_totebag.jpg",
  },
  {
    name: "Cat School of Computing 24/25 Shirt",
    description: "SOC exclusive shirt for the 24/25 batch, featuring a cute cat design.",
    category: "Merchandise",
    price: 18,
    stock: 75,
    numberSold: 0,
    status: "IN_STOCK",
    image: "../images/soc_cat_shirt.jpg",
  },
  {
    name: "Gryphons Windbreaker",
    description: "High-quality windbreaker with the Gryphons emblem, perfect for rainy days.",
    category: "Merchandise",
    price: 35,
    stock: 50,
    numberSold: 0,
    status: "IN_STOCK",
    image: "../images/gryphons_windbreaker.jpg",
  },
  // CCA Points
  {
    name: "CCA Points - Participation",
    description: "Earn 2 CCA points for active participation in school events.",
    category: "CCA Points",
    price: 5, // If points are a currency, set an appropriate price
    stock: 9999, // Digital items typically don't run out
    numberSold: 0,
    status: "IN_STOCK",
    image: "../images/cca_participation.jpg",
  },
  {
    name: "CCA Points - Enrichment",
    description: "Earn 4 CCA points for attending enrichment workshops or training.",
    category: "CCA Points",
    price: 10,
    stock: 9999,
    numberSold: 0,
    status: "IN_STOCK",
    image: "../images/cca_enrichment.jpg",
  },
];

// ##############################################################
// Isaac's Seed Data
// ##############################################################

// ##############################################################
// Redwan's Seed Data
// ##############################################################

// Seed Questions
const questions = [
  {
    userID: 1,
    title: "How to optimize database queries?",
    content: "What are the best practices for optimizing SQL queries in a large-scale application?",
    modCode: "ST0510",
    filePath: null,
    status: "ACTIVE",
    likes: 15,
    createdAt: new Date('2024-11-20T10:00:00Z'),
    updatedAt: new Date('2024-11-25T08:00:00Z'), // Updated date
  },
  {
    userID: 4,
    title: "Understanding CI/CD pipelines",
    content: "Can someone explain how CI/CD pipelines work with examples? I'm new to DevOps.",
    modCode: "ST0526",
    filePath: null,
    status: "SOLVED",
    likes: 20,
    createdAt: new Date('2024-11-21T15:00:00Z'),
    updatedAt: null,
  },
  {
    userID: 2,
    title: "Best practices for React state management",
    content: "What are the recommended tools and techniques for managing complex states in React?",
    modCode: "ST0506",
    filePath: null,
    status: "ACTIVE",
    likes: 12,
    createdAt: new Date('2024-11-22T08:30:00Z'),
    updatedAt: null,
  },
  {
    userID: 3,
    title: "What is lazy loading?",
    content: "How does lazy loading improve performance in web applications?",
    modCode: "ST2515",
    filePath: null,
    status: "ARCHIVED",
    likes: 5,
    createdAt: new Date('2024-06-23T09:00:00Z'),
    updatedAt: new Date('2024-06-27T14:00:00Z'), // Updated date
  },
  {
    userID: 5,
    title: "Benefits of using Prisma ORM",
    content: "Why should I choose Prisma ORM for my Node.js projects over traditional ORMs?",
    modCode: "ST0526",
    filePath: "../images/prisma_benefits.png",
    status: "SOLVED",
    likes: 10,
    createdAt: new Date('2024-11-24T11:45:00Z'),
    updatedAt: null,
  },
  {
    userID: 1,
    title: "How to implement authentication in Node.js?",
    content: "What are the best practices for implementing user authentication securely?",
    modCode: "ST0526",
    filePath: null,
    status: "ACTIVE",
    likes: 18,
    createdAt: new Date('2024-11-25T10:15:00Z'),
    updatedAt: null,
  },
];

// Seed Answers
const answers = [
  {
    questionID: 1,
    userID: 2,
    content: "You can optimize queries by using proper indexing, avoiding N+1 queries, and analyzing query execution plans.",
    filePath: null,
    status: "PUBLISHED",
    likes: 8,
    createdAt: new Date('2024-11-20T12:00:00Z'),
    updatedAt: null,
  },
  {
    questionID: 1,
    userID: 3,
    content: "Using prepared statements and caching can also help improve query performance significantly.",
    filePath: "../images/sql_tips.png",
    status: "PUBLISHED",
    likes: 5,
    createdAt: new Date('2024-11-29T14:00:00Z'),
    updatedAt: new Date('2024-11-30T10:00:00Z'), // Updated date
  },
  {
    questionID: 2,
    userID: 4,
    content: "CI/CD pipelines automate the build, test, and deployment processes, ensuring code is production-ready.",
    filePath: null,
    status: "PUBLISHED",
    likes: 6,
    createdAt: new Date('2024-11-21T16:00:00Z'),
    updatedAt: null,
  },
  {
    questionID: 3,
    userID: 5,
    content: "Lazy loading defers the loading of resources until they are needed, reducing the initial load time.",
    filePath: null,
    status: "PUBLISHED",
    likes: 7,
    createdAt: new Date('2024-11-22T09:30:00Z'),
    updatedAt: null,
  },
  {
    questionID: 4,
    userID: 1,
    content: "Prisma simplifies database access with its intuitive API, making development faster and safer.",
    filePath: null,
    status: "PUBLISHED",
    likes: 10,
    createdAt: new Date('2024-07-23T10:15:00Z'),
    updatedAt: null,
  },
  {
    questionID: 5,
    userID: 3,
    content: "Authentication in Node.js can be implemented using Passport.js for local and OAuth-based strategies.",
    filePath: null,
    status: "PUBLISHED",
    likes: 12,
    createdAt: new Date('2024-11-24T13:30:00Z'),
    updatedAt: null,
  },
  {
    questionID: 6,
    userID: 4,
    content: "Use JWT (JSON Web Tokens) for stateless authentication in APIs.",
    filePath: "../images/jwt_auth.png",
    status: "PUBLISHED",
    likes: 15,
    createdAt: new Date('2024-11-25T10:45:00Z'),
    updatedAt: null,
  },
  {
    questionID: 6,
    userID: 5,
    content: "Use bcrypt for securely hashing passwords before storing them in the database.",
    filePath: null,
    status: "PUBLISHED",
    likes: 10,
    createdAt: new Date('2024-11-25T11:15:00Z'),
    updatedAt: null,
  },
];

const likes = [
  // Likes on questions
  { userID: 1, questionID: 1 },
  { userID: 2, questionID: 1 },
  { userID: 3, questionID: 2 },
  { userID: 4, questionID: 3 },
  { userID: 5, questionID: 4 },
  { userID: 1, questionID: 5 },
  { userID: 2, questionID: 6 },
  { userID: 3, questionID: 6 },
  { userID: 4, questionID: 6 },
  { userID: 1, questionID: 2 },
  { userID: 6, questionID: 5 },
  { userID: 7, questionID: 6 },
  { userID: 8, questionID: 6 },
  { userID: 9, questionID: 6 },
  { userID: 10, questionID: 4 },
  { userID: 11, questionID: 5 },
  { userID: 12, questionID: 6 },
  { userID: 13, questionID: 6 },
  { userID: 14, questionID: 6 },
  { userID: 15, questionID: 2 },
  { userID: 16, questionID: 5 },
  { userID: 17, questionID: 6 },
  { userID: 18, questionID: 6 },
  { userID: 19, questionID: 6 },

  // Likes on answers
  { userID: 1, answerID: 1 },
  { userID: 2, answerID: 2 },
  { userID: 3, answerID: 3 },
  { userID: 4, answerID: 4 },
  { userID: 5, answerID: 5 },
  { userID: 1, answerID: 6 },
  { userID: 2, answerID: 6 },
  { userID: 3, answerID: 7 },
  { userID: 4, answerID: 8 },
  { userID: 5, answerID: 1 },
  { userID: 6, answerID: 2 },
  { userID: 7, answerID: 3 },
  { userID: 8, answerID: 4 },
  { userID: 9, answerID: 5 },
  { userID: 10, answerID: 6 },
  { userID: 11, answerID: 6 },
  { userID: 12, answerID: 7 },
  { userID: 13, answerID: 8 },
  { userID: 15, answerID: 1 },
  { userID: 16, answerID: 2 },
  { userID: 17, answerID: 3 },
  { userID: 18, answerID: 4 },
  { userID: 19, answerID: 5 },
  { userID: 14, answerID: 6 },
];

// Seed Saved Questions
const savedQuestions = [
  { userID: 1, questionID: 1 },
  { userID: 1, questionID: 2 },
  { userID: 1, questionID: 3 },
  { userID: 2, questionID: 4 },
  { userID: 3, questionID: 5 },
  { userID: 2, questionID: 5 },
  { userID: 4, questionID: 5 },
  { userID: 5, questionID: 5 },
];

// Seed To Do List Items
const todos = [
  {
    userId: 20,
    title: "Refactor API Endpoints",
    description: "Improve response times by optimizing API logic.",
    category: "Work",
    dueDate: new Date('2024-12-02T09:00:00Z'),
    priority: "HIGH",
    completed: false,
    status: "PENDING",
    mood: "STRESSED",
    recurring: "NONE",
    notes: "Consider caching frequently requested data.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 9,
    title: "Read AI Ethics Paper",
    description: "Go through the latest research on AI ethics and biases.",
    category: "Personal",
    dueDate: new Date('2024-12-07T18:00:00Z'),
    priority: "MEDIUM",
    completed: false,
    status: "PENDING",
    mood: "RELAXED",
    recurring: "NONE",
    notes: "Summarize key points for later reference.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 3,
    title: "Exercise Routine",
    description: "Follow a 30-minute workout plan.",
    category: "Personal",
    dueDate: new Date('2024-12-03T07:00:00Z'),
    priority: "LOW",
    completed: true,
    status: "COMPLETED",
    mood: "HAPPY",
    recurring: "DAILY",
    notes: "Track progress weekly for improvements.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 20,
    title: "Sprint Planning Meeting",
    description: "Discuss the next sprint goals and backlog refinement.",
    category: "Work",
    dueDate: new Date('2024-12-04T15:00:00Z'),
    priority: "HIGH",
    completed: false,
    status: "PENDING",
    mood: "NEUTRAL",
    recurring: "WEEKLY",
    notes: "Prepare agenda beforehand.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 9,
    title: "Practice Guitar",
    description: "Learn and play a new song on the guitar.",
    category: "School",
    dueDate: new Date('2024-12-06T20:00:00Z'),
    priority: "LOW",
    completed: false,
    status: "PENDING",
    mood: "HAPPY",
    recurring: "DAILY",
    notes: "Try fingerpicking techniques.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 3,
    title: "Update Resume",
    description: "Add recent projects and certifications to my resume.",
    category: "School",
    dueDate: new Date('2024-12-10T12:00:00Z'),
    priority: "MEDIUM",
    completed: false,
    status: "PENDING",
    mood: "RELAXED",
    recurring: "NONE",
    notes: "Tailor it for job applications in AI and software development.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 20,
    title: "Attend Team Lunch",
    description: "Catch up with the team over lunch at a new restaurant.",
    category: "School",
    dueDate: new Date('2024-12-11T13:00:00Z'),
    priority: "LOW",
    completed: false,
    status: "PENDING",
    mood: "HAPPY",
    recurring: "NONE",
    notes: "Decide on the restaurant beforehand.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 9,
    title: "Monthly Budget Review",
    description: "Analyze spending and savings for the past month.",
    category: "Personal",
    dueDate: new Date('2024-12-15T10:00:00Z'),
    priority: "MEDIUM",
    completed: false,
    status: "PENDING",
    mood: "NEUTRAL",
    recurring: "MONTHLY",
    notes: "Consider adjusting savings goals.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 3,
    title: "Write Blog on JavaScript Tips",
    description: "Share insights and best practices in JavaScript.",
    category: "Personal",
    dueDate: new Date('2024-12-17T17:00:00Z'),
    priority: "HIGH",
    completed: false,
    status: "PENDING",
    mood: "RELAXED",
    recurring: "NONE",
    notes: "Include examples and code snippets.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 20,
    title: "Volunteer at Animal Shelter",
    description: "Help with feeding and cleaning at the shelter.",
    category: "Work",
    dueDate: new Date('2024-12-20T08:00:00Z'),
    priority: "MEDIUM",
    completed: false,
    status: "PENDING",
    mood: "HAPPY",
    recurring: "NONE",
    notes: "Reach out to the shelter for confirmation.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 9,
    title: "Attend Yoga Class",
    description: "Join a guided session for relaxation and stretching.",
    category: "Personal",
    dueDate: new Date('2024-12-22T06:30:00Z'),
    priority: "LOW",
    completed: true,
    status: "COMPLETED",
    mood: "RELAXED",
    recurring: "WEEKLY",
    notes: "Try new breathing techniques.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 3,
    title: "Fix Bug in Web App",
    description: "Debug and resolve authentication issues in the app.",
    category: "Work",
    dueDate: new Date('2024-12-23T16:00:00Z'),
    priority: "HIGH",
    completed: false,
    status: "PENDING",
    mood: "STRESSED",
    recurring: "NONE",
    notes: "Check logs for error patterns.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 20,
    title: "Buy Holiday Gifts",
    description: "Shop for gifts for friends and family.",
    category: "Personal",
    dueDate: new Date('2024-12-24T14:00:00Z'),
    priority: "MEDIUM",
    completed: false,
    status: "PENDING",
    mood: "HAPPY",
    recurring: "NONE",
    notes: "Make a checklist before shopping.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 9,
    title: "Plan Weekend Getaway",
    description: "Book accommodations and plan itinerary.",
    category: "Personal",
    dueDate: new Date('2024-12-25T11:00:00Z'),
    priority: "HIGH",
    completed: false,
    status: "PENDING",
    mood: "HAPPY",
    recurring: "NONE",
    notes: "Look for adventure activities.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 3,
    title: "Organize Digital Files",
    description: "Sort and delete unnecessary files.",
    category: "Personal",
    dueDate: new Date('2024-12-27T09:00:00Z'),
    priority: "LOW",
    completed: false,
    status: "PENDING",
    mood: "NEUTRAL",
    recurring: "MONTHLY",
    notes: "Backup important documents.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const assignedTask = [
  {
    assignerId: 19,
    assigneeId: 20,
    title: "Complete AI Research Report",
    description: "Write a detailed report on AI advancements in healthcare.",
    dueDate: new Date("2024-08-20T23:59:59.999Z"),
    category: "Research",
    priority: "HIGH",
    status: "PENDING",
    todoId: null
  },
  {
    assignerId: 20,
    assigneeId: 19,
    title: "Develop Backend APIs",
    description: "Implement authentication and CRUD operations for the project.",
    dueDate: new Date("2024-08-25T23:59:59.999Z"),
    category: "Development",
    priority: "MEDIUM",
    status: "PENDING",
    todoId: null
  },
  {
    assignerId: 19,
    assigneeId: 20,
    title: "UI/UX Design Review",
    description: "Review the new UI mockups and provide feedback.",
    dueDate: new Date("2024-08-18T23:59:59.999Z"),
    category: "Design",
    priority: "LOW",
    status: "ACCEPTED",
    todoId: null
 },
 {
    assignerId: 20,
    assigneeId: 19,
    title: "Database Optimization",
    description: "Optimize queries and indexes for better performance.",
    dueDate: new Date("2024-08-22T23:59:59.999Z"),
    category: "Database",
    priority: "HIGH",
    status: "PENDING",
    todoId: null
  }
]

// ##############################################################
// Redwan's Seed Data
// ##############################################################

// ##############################################################
// Alice's Seed Data
// ##############################################################
// Seed Tags
const tags = [
  { name: 'Programming', userId: 1 },
  { name: 'Data Science', userId: 2 },
  { name: 'AI', userId: 1 },
  { name: 'Web Development', userId: 2 },
  { name: 'Database', userId: 1 },
  { name: 'Machine Learning', userId: 3 },
  { name: 'Cloud Computing', userId: 4 },
  { name: 'Cybersecurity', userId: 5 },
  { name: 'JavaScript', userId: 1 },
  { name: 'Python', userId: 2 },
  { name: 'Frontend', userId: 3 },
  { name: 'Backend', userId: 4 },
  { name: 'DevOps', userId: 5 },
  { name: 'Software Engineering', userId: 3 },
  { name: 'Networking', userId: 4 },
];


// Seed Resources
const resources = [
  { title: 'JavaScript Basics', description: 'Learn the basics of JavaScript.', createdById: 1 },
  { title: 'Intro to Data Science', description: 'Fundamentals of data science.', createdById: 2 },
  { title: 'AI for Beginners', description: 'An introduction to AI concepts.', createdById: 3 },
  { title: 'HTML and CSS', description: 'Learn how to build websites.', createdById: 4 },
  { title: 'Database Management', description: 'Basics of database management systems.', createdById: 5 },
  { title: 'Machine Learning 101', description: 'Introduction to machine learning algorithms.', createdById: 3 },
  { title: 'Cloud Computing Essentials', description: 'Understanding the basics of cloud computing.', createdById: 4 },
  { title: 'Cybersecurity Fundamentals', description: 'Learn the basics of cybersecurity practices.', createdById: 5 },
  { title: 'Web Development with React', description: 'Build interactive UIs using React.js.', createdById: 1 },
  { title: 'Advanced Python Programming', description: 'Explore advanced Python programming techniques.', createdById: 2 },
];


// Seed Bookmarks
const bookmarks = [
  { userId: 1, resourceId: 1, status: 'UNREAD', progress: 0.0 }, // JavaScript Basics
  { userId: 2, resourceId: 2, status: 'READING', progress: 50.0 }, // Intro to Data Science
  { userId: 3, resourceId: 3, status: 'FINISHED', progress: 100.0 }, // AI for Beginners
  { userId: 4, resourceId: 4, status: 'UNREAD', progress: 0.0 }, // HTML and CSS
  { userId: 5, resourceId: 5, status: 'READING', progress: 75.0 }, // Database Management
  { userId: 20, resourceId: 6, status: 'READING', progress: 60.0 }, // Machine Learning 101
  { userId: 20, resourceId: 7, status: 'FINISHED', progress: 100.0 }, // Cloud Computing Essentials
  { userId: 20, resourceId: 8, status: 'READING', progress: 30.0 }, // Cybersecurity Fundamentals
  { userId: 20, resourceId: 9, status: 'UNREAD', progress: 0.0 }, // Web Development with React
  { userId: 20, resourceId: 10, status: 'FINISHED', progress: 100.0 }, // Advanced Python Programming
];


// Seed Resource Tags
const resourceTags = [
  { resourceId: 1, tagId: 1, userId: 1 },
  { resourceId: 2, tagId: 2, userId: 2 },
  { resourceId: 3, tagId: 3, userId: 1 },
  { resourceId: 4, tagId: 4, userId: 2 },
  { resourceId: 5, tagId: 5, userId: 1 },
];


// // Seed TutorProfiles
// const tutorProfiles = [
//   { userId: 1, bio: 'Experienced Math Tutor', subject: 'Math', rating: 4.5, experience: 5 },
//   { userId: 3, bio: 'Physics and Chemistry Guru', subject: 'Science', rating: 4.7, experience: 7 },
//   { userId: 5, bio: 'Passionate English Teacher', subject: 'English', rating: 4.3, experience: 3 },
//   { userId: 11, bio: 'History Enthusiast', subject: 'History', rating: 4.8, experience: 4 },
//   { userId: 12, bio: 'Computer Science Geek', subject: 'Programming', rating: 4.6, experience: 6 },
// ];

const tutorProfiles = [
  { userId: 22, bio: 'Experienced basketball coach and former professional player', subject: 'Basketball', rating: 4.9, experience: 5 },
  { userId: 23, bio: 'Passionate chemistry and biology tutor with a focus on practical experiments', subject: 'Chemistry', rating: 4.7, experience: 6 },
  { userId: 24, bio: 'Expert in mathematics and computer science, with a knack for problem-solving', subject: 'Math', rating: 4.8, experience: 7 },
  { userId: 25, bio: 'A philosopher with a love for writing, eager to guide others in academic writing', subject: 'Literature', rating: 4.6, experience: 4 },
  { userId: 26, bio: 'Physics tutor specializing in engineering concepts and hands-on learning', subject: 'Physics', rating: 4.9, experience: 6 },
  { userId: 27, bio: 'Programming expert with a focus on algorithm design and computer science fundamentals', subject: 'Computer Science', rating: 5.0, experience: 8 },
  { userId: 28, bio: 'Skilled at sculpting and an advocate for creativity through hands-on art', subject: 'Art', rating: 4.5, experience: 3 },
  { userId: 29, bio: 'A skilled music and sound engineer, bringing knowledge in music production and theory', subject: 'Music', rating: 4.7, experience: 5 },
  { userId: 30, bio: 'A thought leader in philosophy and ethics, specializing in logic and debate', subject: 'Philosophy', rating: 4.8, experience: 6 },
  { userId: 31, bio: 'Experienced economist with expertise in business strategy and financial markets', subject: 'Economics', rating: 4.6, experience: 7 },
];


const availabilitySlots = [
  { tutorId: 1, dayOfWeek: 'Monday', startTime: '09:00:00', endTime: '12:00:00' },
  { tutorId: 1, dayOfWeek: 'Wednesday', startTime: '14:00:00', endTime: '17:00:00' },
  { tutorId: 1, dayOfWeek: 'Friday', startTime: '10:00:00', endTime: '13:00:00' },
  { tutorId: 1, dayOfWeek: 'Saturday', startTime: '08:00:00', endTime: '11:00:00' },
  { tutorId: 1, dayOfWeek: 'Sunday', startTime: '15:00:00', endTime: '18:00:00' },

  { tutorId: 2, dayOfWeek: 'Monday', startTime: '09:00:00', endTime: '12:00:00' },
  { tutorId: 2, dayOfWeek: 'Tuesday', startTime: '13:00:00', endTime: '16:00:00' },
  { tutorId: 2, dayOfWeek: 'Thursday', startTime: '09:00:00', endTime: '12:00:00' },
  { tutorId: 2, dayOfWeek: 'Friday', startTime: '16:00:00', endTime: '19:00:00' },
  { tutorId: 2, dayOfWeek: 'Saturday', startTime: '10:00:00', endTime: '13:00:00' },

  { tutorId: 3, dayOfWeek: 'Monday', startTime: '10:00:00', endTime: '13:00:00' },
  { tutorId: 3, dayOfWeek: 'Wednesday', startTime: '14:00:00', endTime: '17:00:00' },
  { tutorId: 3, dayOfWeek: 'Thursday', startTime: '09:00:00', endTime: '12:00:00' },
  { tutorId: 3, dayOfWeek: 'Friday', startTime: '15:00:00', endTime: '18:00:00' },
  { tutorId: 3, dayOfWeek: 'Sunday', startTime: '11:00:00', endTime: '14:00:00' },

  { tutorId: 4, dayOfWeek: 'Tuesday', startTime: '09:00:00', endTime: '12:00:00' },
  { tutorId: 4, dayOfWeek: 'Wednesday', startTime: '10:00:00', endTime: '13:00:00' },
  { tutorId: 4, dayOfWeek: 'Thursday', startTime: '14:00:00', endTime: '17:00:00' },
  { tutorId: 4, dayOfWeek: 'Saturday', startTime: '08:00:00', endTime: '11:00:00' },
  { tutorId: 4, dayOfWeek: 'Sunday', startTime: '09:00:00', endTime: '12:00:00' },

  { tutorId: 5, dayOfWeek: 'Monday', startTime: '13:00:00', endTime: '16:00:00' },
  { tutorId: 5, dayOfWeek: 'Wednesday', startTime: '09:00:00', endTime: '12:00:00' },
  { tutorId: 5, dayOfWeek: 'Thursday', startTime: '14:00:00', endTime: '17:00:00' },
  { tutorId: 5, dayOfWeek: 'Friday', startTime: '10:00:00', endTime: '13:00:00' },
  { tutorId: 5, dayOfWeek: 'Saturday', startTime: '12:00:00', endTime: '15:00:00' },

  { tutorId: 6, dayOfWeek: 'Monday', startTime: '09:00:00', endTime: '12:00:00' },
  { tutorId: 6, dayOfWeek: 'Tuesday', startTime: '10:00:00', endTime: '13:00:00' },
  { tutorId: 6, dayOfWeek: 'Thursday', startTime: '12:00:00', endTime: '15:00:00' },
  { tutorId: 6, dayOfWeek: 'Friday', startTime: '14:00:00', endTime: '17:00:00' },
  { tutorId: 6, dayOfWeek: 'Sunday', startTime: '08:00:00', endTime: '11:00:00' },

  { tutorId: 7, dayOfWeek: 'Monday', startTime: '09:00:00', endTime: '12:00:00' },
  { tutorId: 7, dayOfWeek: 'Tuesday', startTime: '14:00:00', endTime: '17:00:00' },
  { tutorId: 7, dayOfWeek: 'Thursday', startTime: '10:00:00', endTime: '13:00:00' },
  { tutorId: 7, dayOfWeek: 'Friday', startTime: '16:00:00', endTime: '19:00:00' },
  { tutorId: 7, dayOfWeek: 'Saturday', startTime: '08:00:00', endTime: '11:00:00' },

  { tutorId: 8, dayOfWeek: 'Tuesday', startTime: '09:00:00', endTime: '12:00:00' },
  { tutorId: 8, dayOfWeek: 'Wednesday', startTime: '13:00:00', endTime: '16:00:00' },
  { tutorId: 8, dayOfWeek: 'Thursday', startTime: '09:00:00', endTime: '12:00:00' },
  { tutorId: 8, dayOfWeek: 'Friday', startTime: '10:00:00', endTime: '13:00:00' },
  { tutorId: 8, dayOfWeek: 'Saturday', startTime: '11:00:00', endTime: '14:00:00' },

  { tutorId: 9, dayOfWeek: 'Monday', startTime: '14:00:00', endTime: '17:00:00' },
  { tutorId: 9, dayOfWeek: 'Tuesday', startTime: '10:00:00', endTime: '13:00:00' },
  { tutorId: 9, dayOfWeek: 'Thursday', startTime: '09:00:00', endTime: '12:00:00' },
  { tutorId: 9, dayOfWeek: 'Friday', startTime: '13:00:00', endTime: '16:00:00' },
  { tutorId: 9, dayOfWeek: 'Saturday', startTime: '10:00:00', endTime: '13:00:00' },

  { tutorId: 10, dayOfWeek: 'Monday', startTime: '10:00:00', endTime: '13:00:00' },
  { tutorId: 10, dayOfWeek: 'Tuesday', startTime: '14:00:00', endTime: '17:00:00' },
  { tutorId: 10, dayOfWeek: 'Thursday', startTime: '13:00:00', endTime: '16:00:00' },
  { tutorId: 10, dayOfWeek: 'Friday', startTime: '11:00:00', endTime: '14:00:00' },
  { tutorId: 10, dayOfWeek: 'Saturday', startTime: '14:00:00', endTime: '17:00:00' },
];

const tutorBookings = [
  { tuteeId: 20, slotId: 6, durationMonths: 1, status: 'Pending' },
  { tuteeId: 20, slotId: 11, durationMonths: 2, status: 'Approved' },
  { tuteeId: 20, slotId: 15, durationMonths: 3, status: 'Completed' },
  { tuteeId: 4, slotId: 9, durationMonths: 1, status: 'Pending' },
  { tuteeId: 20, slotId: 21, durationMonths: 4, status: 'Cancelled' },
  { tuteeId: 5, slotId: 12, durationMonths: 2, status: 'Approved' },
  { tuteeId: 7, slotId: 14, durationMonths: 1, status: 'Completed' },
  { tuteeId: 5, slotId: 16, durationMonths: 1, status: 'Pending' },
  { tuteeId: 7, slotId: 18, durationMonths: 1, status: 'Approved' },
  { tuteeId: 7, slotId: 20, durationMonths: 3, status: 'Completed' },
  { tuteeId: 11, slotId: 22, durationMonths: 2, status: 'Cancelled' },
  { tuteeId: 12, slotId: 24, durationMonths: 2, status: 'Pending' },
  { tuteeId: 13, slotId: 26, durationMonths: 3, status: 'Approved' },
  { tuteeId: 14, slotId: 28, durationMonths: 1, status: 'Completed' },
  { tuteeId: 15, slotId: 30, durationMonths: 2, status: 'Pending' },
];






// ##############################################################
// Alice's Seed Data
// ##############################################################

// ##############################################################
// Anna's Seed Data
// ##############################################################
const studyGroups = [
  { name: 'Algebra Group', description: 'Focused on algebra exercises', createdBy: 1 },
  { name: 'Calculus Group', description: 'Studying calculus concepts', createdBy: 2 },
  { name: 'Physics Group', description: 'Physics study sessions', createdBy: 3 },
  { name: 'Literature Group', description: 'Discussing literature', createdBy: 4 },
  { name: 'Chemistry Group', description: 'Chemistry labs and theory', createdBy: 5 },
  { name: 'History Group', description: 'Historical discussions', createdBy: 6 },
  { name: 'Math Study Group', description: 'General math topics', createdBy: 7 },
  { name: 'Biology Group', description: 'Learning biology concepts', createdBy: 8 },
  { name: 'Economics Group', description: 'Economic theories and practice', createdBy: 9 },
  { name: 'Computer Science Group', description: 'Programming and algorithms', createdBy: 10 },
];

const studyRooms = [
  { name: 'Room 101', roomType: '2-person', location: 'Building D, Room 101', capacity: 2 },
  { name: 'Room 102', roomType: '2-person', location: 'Building E, Room 102', capacity: 2 },
  { name: 'Room 103', roomType: '4-person', location: 'Building B, Room 103', capacity: 4 },
  { name: 'Room 104', roomType: '4-person', location: 'Building B, Room 104', capacity: 4 },
  { name: 'Room 105', roomType: '6-person', location: 'Building A, Room 105', capacity: 6 },
  { name: 'Room 106', roomType: '6-person', location: 'Building C, Room 106', capacity: 6 },
  { name: 'Room 107', roomType: '8-person', location: 'Building A, Room 107', capacity: 8 },
  { name: 'Room 108', roomType: '8-person', location: 'Library, Room 108', capacity: 8 },
  { name: 'Room 109', roomType: '10-person', location: 'Building F, Room 109', capacity: 10 },
  { name: 'Room 110', roomType: '10-person', location: 'Building D, Room 110', capacity: 10 },
  { name: 'Room 111', roomType: '2-person', location: 'Building D, Room 111', capacity: 2 },
  { name: 'Room 112', roomType: '2-person', location: 'Building E, Room 112', capacity: 2 },
  { name: 'Room 113', roomType: '4-person', location: 'Building B, Room 113', capacity: 4 },
  { name: 'Room 114', roomType: '4-person', location: 'Building B, Room 114', capacity: 4 },
  { name: 'Room 115', roomType: '6-person', location: 'Building A, Room 115', capacity: 6 },
  { name: 'Room 116', roomType: '6-person', location: 'Building C, Room 116', capacity: 6 },
  { name: 'Room 117', roomType: '8-person', location: 'Building A, Room 117', capacity: 8 },
  { name: 'Room 118', roomType: '8-person', location: 'Library, Room 118', capacity: 8 },
  { name: 'Room 119', roomType: '10-person', location: 'Building F, Room 119', capacity: 10 },
  { name: 'Room 120', roomType: '10-person', location: 'Building D, Room 120', capacity: 10 }
];

const bookings = [
  { groupId: 1, roomId: 1, slotId: 1, bookingDate: '2024-12-2 09:00:00', status: 'confirmed', timeout: '2024-12-2 09:30:00' },
  { groupId: 2, roomId: 2, slotId: 2, bookingDate: '2024-12-6 10:00:00', status: 'pending', timeout: '2024-12-6 10:30:00' },
  { groupId: 3, roomId: 3, slotId: 3, bookingDate: '2025-01-10 11:00:00', status: 'confirmed', timeout: '2024-01-10 11:30:00' },
  { groupId: 4, roomId: 4, slotId: 4, bookingDate: '2024-12-15 12:00:00', status: 'pending', timeout: '2024-12-15 12:30:00' },
  { groupId: 5, roomId: 5, slotId: 5, bookingDate: '2025-02-2 13:00:00', status: 'confirmed', timeout: '2024-02-2 13:30:00' },
  { groupId: 6, roomId: 6, slotId: 6, bookingDate: '2024-12-5 14:00:00', status: 'confirmed', timeout: '2024-12-5 14:30:00' },
  { groupId: 7, roomId: 7, slotId: 7, bookingDate: '2024-12-6 15:00:00', status: 'cancelled', timeout: '2024-12-6 15:30:00' },
  { groupId: 8, roomId: 8, slotId: 8, bookingDate: '2024-12-7 16:00:00', status: 'confirmed', timeout: '2024-12-7 16:30:00' },
  { groupId: 9, roomId: 9, slotId: 9, bookingDate: '2024-12-9 17:00:00', status: 'confirmed', timeout: '2024-12-9 17:30:00' },
  { groupId: 10, roomId: 10, slotId: 10, bookingDate: '2024-12-8 18:00:00', status: 'confirmed', timeout: '2024-12-8 18:30:00' },
];

const userStudyGroups = [
  { userId: 10, groupId: 1, joinedAt: new Date('2024-11-01T10:00:00Z') },
  { userId: 10, groupId: 2, joinedAt: new Date('2024-11-02T11:00:00Z') },
  { userId: 10, groupId: 3, joinedAt: new Date('2024-11-03T12:00:00Z') },
  { userId: 2, groupId: 1, joinedAt: new Date('2024-11-04T13:00:00Z') },
  { userId: 2, groupId: 4, joinedAt: new Date('2024-11-05T14:00:00Z') },
  { userId: 2, groupId: 5, joinedAt: new Date('2024-11-06T15:00:00Z') },
  { userId: 3, groupId: 2, joinedAt: new Date('2024-11-07T16:00:00Z') },
  { userId: 3, groupId: 4, joinedAt: new Date('2024-11-08T17:00:00Z') },
  { userId: 3, groupId: 6, joinedAt: new Date('2024-11-09T18:00:00Z') },
  { userId: 4, groupId: 3, joinedAt: new Date('2024-11-10T19:00:00Z') },
  { userId: 4, groupId: 5, joinedAt: new Date('2024-11-11T20:00:00Z') },
  { userId: 4, groupId: 7, joinedAt: new Date('2024-11-12T21:00:00Z') },
  { userId: 5, groupId: 1, joinedAt: new Date('2024-11-13T10:00:00Z') },
  { userId: 6, groupId: 2, joinedAt: new Date('2024-11-14T11:00:00Z') },
  { userId: 7, groupId: 3, joinedAt: new Date('2024-11-15T12:00:00Z') },
  { userId: 8, groupId: 4, joinedAt: new Date('2024-11-16T13:00:00Z') },
  { userId: 9, groupId: 5, joinedAt: new Date('2024-11-17T14:00:00Z') },
  { userId: 10, groupId: 6, joinedAt: new Date('2024-11-18T15:00:00Z') },
  { userId: 20, groupId: 6, joinedAt: new Date('2024-11-18T15:00:00Z') },
  { userId: 20, groupId: 1, joinedAt: new Date('2024-11-18T15:00:00Z') },
];

const roomSlots = [
  { startTime: '09:00', endTime: '10:00' },
  { startTime: '10:00', endTime: '11:00' },
  { startTime: '11:00', endTime: '12:00' },
  { startTime: '12:00', endTime: '13:00' },
  { startTime: '13:00', endTime: '14:00' },
  { startTime: '14:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '16:00' },
  { startTime: '16:00', endTime: '17:00' },
  { startTime: '17:00', endTime: '18:00' },
  { startTime: '18:00', endTime: '19:00' },
];

const messages = [
  { content: "Hello everyone!", senderId: 10, groupId: 1, createdAt: new Date('2024-11-01T10:05:00Z') },
  { content: "Anyone up for a study session?", senderId: 10, groupId: 2, createdAt: new Date('2024-11-02T11:10:00Z') },
  { content: "Need help with the assignment.", senderId: 10, groupId: 3, createdAt: new Date('2024-11-03T12:15:00Z') },
  { content: "What's the topic for the next session?", senderId: 2, groupId: 1, createdAt: new Date('2024-11-04T13:20:00Z') },
  { content: "Gonna meet at 5 PM.", senderId: 2, groupId: 4, createdAt: new Date('2024-11-05T14:25:00Z') },
  { content: "Who has the notes from last time?", senderId: 2, groupId: 5, createdAt: new Date('2024-11-06T15:30:00Z') },
  { content: "I can share my notes.", senderId: 3, groupId: 2, createdAt: new Date('2024-11-07T16:35:00Z') },
  { content: "Is the study room booked?", senderId: 3, groupId: 4, createdAt: new Date('2024-11-08T17:40:00Z') },
  { content: "Let's split the work!", senderId: 3, groupId: 6, createdAt: new Date('2024-11-09T18:45:00Z') },
  { content: "Hope everyone is ready for tomorrow!", senderId: 4, groupId: 3, createdAt: new Date('2024-11-10T19:50:00Z') },
  { content: "Meeting at 3 PM?", senderId: 4, groupId: 5, createdAt: new Date('2024-11-11T20:55:00Z') },
  { content: "I'll bring snacks!", senderId: 4, groupId: 7, createdAt: new Date('2024-11-12T21:00:00Z') },
  { content: "Who's leading the discussion?", senderId: 5, groupId: 1, createdAt: new Date('2024-11-13T10:05:00Z') },
  { content: "This topic is tricky!", senderId: 6, groupId: 2, createdAt: new Date('2024-11-14T11:10:00Z') },
  { content: "I need more examples.", senderId: 7, groupId: 3, createdAt: new Date('2024-11-15T12:15:00Z') },
  { content: "Let's create a shared doc.", senderId: 8, groupId: 4, createdAt: new Date('2024-11-16T13:20:00Z') },
  { content: "Is the deadline extended?", senderId: 9, groupId: 5, createdAt: new Date('2024-11-17T14:25:00Z') },
  { content: "We should start early!", senderId: 10, groupId: 6, createdAt: new Date('2024-11-18T15:30:00Z') },
];

const polls = [
  { question: "What is your favorite programming language?", groupId: 1, createdBy: 10, createdAt: new Date('2024-11-01T10:00:00Z') },
  { question: "Do you prefer online or in-person learning?", groupId: 2, createdBy: 10, createdAt: new Date('2024-11-02T11:10:00Z') },
  { question: "Which framework do you find most useful?", groupId: 3, createdBy: 10, createdAt: new Date('2024-11-03T12:00:00Z') },
  { question: "Should we have a coding challenge?", groupId: 1, createdBy: 2, createdAt: new Date('2024-11-04T13:20:00Z') },
  { question: "What time is best for a study session?", groupId: 2, createdBy: 2, createdAt: new Date('2024-11-05T14:25:00Z') },
  { question: "How should we organize the project?", groupId: 3, createdBy: 3, createdAt: new Date('2024-11-06T15:30:00Z') },
  { question: "Do you prefer group work or solo work?", groupId: 4, createdBy: 3, createdAt: new Date('2024-11-07T16:35:00Z') },
  { question: "When should we submit the assignment?", groupId: 4, createdBy: 4, createdAt: new Date('2024-11-08T17:40:00Z') },
  { question: "What should we discuss next?", groupId: 5, createdBy: 4, createdAt: new Date('2024-11-09T18:45:00Z') },
  { question: "Should we schedule a meeting?", groupId: 6, createdBy: 5, createdAt: new Date('2024-11-10T19:50:00Z') },
  { question: "Do you like the new feature?", groupId: 5, createdBy: 6, createdAt: new Date('2024-11-11T20:55:00Z') },
  { question: "How can we improve communication?", groupId: 7, createdBy: 7, createdAt: new Date('2024-11-12T21:00:00Z') },
  { question: "Is the course material clear?", groupId: 1, createdBy: 8, createdAt: new Date('2024-11-13T10:05:00Z') },
  { question: "Do you prefer practical or theoretical assignments?", groupId: 2, createdBy: 9, createdAt: new Date('2024-11-14T11:10:00Z') },
  { question: "When should we have the next meetup?", groupId: 3, createdBy: 10, createdAt: new Date('2024-11-15T12:15:00Z') },
];

const pollOptions = [
  { pollId: 1, text: "JavaScript", votes: 5 },
  { pollId: 1, text: "Python", votes: 3 },
  { pollId: 1, text: "Java", votes: 2 },
  { pollId: 1, text: "C++", votes: 4 },
  
  { pollId: 2, text: "Online", votes: 10 },
  { pollId: 2, text: "In-person", votes: 7 },

  { pollId: 3, text: "React", votes: 8 },
  { pollId: 3, text: "Vue.js", votes: 5 },
  { pollId: 3, text: "Angular", votes: 3 },
  { pollId: 3, text: "Svelte", votes: 4 },

  { pollId: 4, text: "Yes", votes: 15 },
  { pollId: 4, text: "No", votes: 5 },

  { pollId: 5, text: "Morning", votes: 6 },
  { pollId: 5, text: "Afternoon", votes: 12 },
  { pollId: 5, text: "Evening", votes: 8 },

  { pollId: 6, text: "Divide tasks by skill", votes: 4 },
  { pollId: 6, text: "Divide tasks by interest", votes: 6 },
  { pollId: 6, text: "Random assignment", votes: 5 },

  { pollId: 7, text: "Group work", votes: 14 },
  { pollId: 7, text: "Solo work", votes: 6 },

  { pollId: 8, text: "One week", votes: 7 },
  { pollId: 8, text: "Two weeks", votes: 10 },
  { pollId: 8, text: "Three weeks", votes: 5 },

  { pollId: 9, text: "Zoom", votes: 12 },
  { pollId: 9, text: "Google Meet", votes: 8 },
  { pollId: 9, text: "Teams", votes: 6 },

  { pollId: 10, text: "Yes", votes: 13 },
  { pollId: 10, text: "No", votes: 4 },

  { pollId: 11, text: "Email", votes: 10 },
  { pollId: 11, text: "Slack", votes: 8 },
  { pollId: 11, text: "Discord", votes: 7 },

  { pollId: 12, text: "Clear", votes: 16 },
  { pollId: 12, text: "Unclear", votes: 4 },

  { pollId: 13, text: "Practical", votes: 9 },
  { pollId: 13, text: "Theoretical", votes: 11 },
];

const feedbacks = [
  // Group 3 (bookingId: 3)
  { bookingId: 3, giverId: 10, receiverId: 4, comments: "Great insights, but could use more examples.", rating: 4.1, state: 'DISCLOSED' },
  { bookingId: 3, giverId: 4, receiverId: 10, comments: "Really enjoyed your ideas, but could engage the group more.", rating: 3.9, state: 'DISCLOSED' },
  { bookingId: 3, giverId: 7, receiverId: 10, comments: "Good discussion, but let's focus more on practical examples next time.", rating: 4.0, state: 'DISCLOSED' },
  { bookingId: 3, giverId: 7, receiverId: 4, comments: "Good discussion, but let's focus more on practical examples next time.", rating: 4.0, state: 'DISCLOSED' },
  { bookingId: 3, giverId: 4, receiverId: 7, comments: "Good discussion, but let's focus more on practical examples next time.", rating: 4.0, state: 'DISCLOSED' },
  { bookingId: 3, giverId: 10, receiverId: 7, comments: "Really enjoyed your ideas, but could engage the group more.", rating: 4.0, state: 'DISCLOSED' },

  // Group 1 (bookingId: 1)
  { bookingId: 1, giverId: 20, receiverId: 10, comments: "Great insights, but could use more examples.", rating: 4.1, state: 'DISCLOSED' },
  { bookingId: 1, giverId: 10, receiverId: 20, comments: "Really enjoyed your ideas, but could engage the group more.", rating: 3.9, state: 'DISCLOSED' },

  // Group 5 (bookingId: 5)
  { bookingId: 5, giverId: 4, receiverId: 9, comments: "I really love your ideas, Ivan. Good job!", rating: 4.1, state: 'DISCLOSED' },
  { bookingId: 5, giverId: 9, receiverId: 4, comments: "I enjoyed working with you. Good luck with your future!", rating: 3.9, state: 'DISCLOSED' },
  { bookingId: 5, giverId: 4, receiverId: 2, comments: "I enjoyed working with you. Good luck with your future!", rating: 3.9, state: 'DISCLOSED' },
  { bookingId: 5, giverId: 9, receiverId: 2, comments: "I enjoyed working with you. Good luck with your future!", rating: 3.9, state: 'DISCLOSED' },
  { bookingId: 5, giverId: 2, receiverId: 4, comments: "I enjoyed working with you. Good luck with your future!", rating: 3.9, state: 'DISCLOSED' },
  { bookingId: 5, giverId: 2, receiverId: 9, comments: "I enjoyed working with you. Good luck with your future!", rating: 3.9, state: 'DISCLOSED' },
];


// ##############################################################
// Anna's Seed Data
// ##############################################################


async function main() {
  // Hash passwords before inserting users
  const hashedUsers = await Promise.all(users.map(async (user) => {
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    return { ...user, password: hashedPassword };  // Replace plain password with hashed password
  }));

  const insertedPersons = await prisma.person.createManyAndReturn({
    data: persons,
  });

  // Seed Statuses
  const insertedStatuses = await prisma.status.createManyAndReturn({
    data: statuses,
  });

  const insertedTasks = await prisma.task.createManyAndReturn({
    data: [
      { name: 'Seed 1', statusId: insertedStatuses[0].id },
      { name: 'Seed 2', statusId: insertedStatuses[1].id },
    ],
  });

  await prisma.taskAssignment.createMany({
    data: [
      { personId: insertedPersons[0].id, taskId: insertedTasks[0].id },
      { personId: insertedPersons[1].id, taskId: insertedTasks[0].id },
      { personId: insertedPersons[2].id, taskId: insertedTasks[1].id },
      { personId: insertedPersons[3].id, taskId: insertedTasks[1].id },
    ],
  });

  console.log(insertedPersons, insertedStatuses);

  // ##############################################################
  // Isaac's Seed Data
  // ##############################################################
  const insertedAvatars = await prisma.avatar.createMany({
    data: avatars,
  });

  const insertedUsers = await prisma.user.createManyAndReturn({
    data: hashedUsers,  // Use the hashed passwords
  });

  // Insert schools
  const insertedSchools = await prisma.school.createMany({
    data: schools,
  });

  // Insert modules
  const insertedModules = await prisma.module.createMany({
    data: modules,
  });

  const insertedQuizzes = await prisma.quiz.createMany({
    data: quizzes,
  });

  const insertedQuizItems = await prisma.quizItem.createMany({
    data: quizItems,
  });

  const insertedQuizQuestions = await prisma.quizQuestion.createMany({
    data: quizQuestions,
  });

  const insertedQuizAttempts = await prisma.quizAttempt.createMany({
    data: quizAttempts,
  });

  const insertedSuggestions = await prisma.suggestion.createMany({
    data: suggestions,
  });

  // CA2 Inserting Seed Data
  const insertedDecks = await prisma.deck.createMany({
    data: decks,
  });

  const insertedFlashcard = await prisma.flashcard.createMany({
    data: flashcards,
  });

  const insertedDeckProgress = await prisma.deckProgress.createMany({
    data: deckProgress,
  });

  // Seed global notifications
  for (const notification of notifications) {
    if (notification.isGlobal) {
      await prisma.notification.create({
        data: {
          type: notification.type,
          title: notification.title,
          message: notification.message,
          isGlobal: notification.isGlobal,
          createdAt: notification.createdAt,
        },
      });
    }
  }

  // Seed personal notifications
  for (const notification of notifications) {
    if (!notification.isGlobal) {
      const createdNotification = await prisma.notification.create({
        data: {
          type: notification.type,
          title: notification.title,
          message: notification.message,
          isGlobal: false,
          createdAt: notification.createdAt,
        },
      });

      await prisma.userNotification.create({
        data: {
          userId: notification.userId,
          notificationId: createdNotification.id,
          createdAt: notification.createdAt,
        },
      });
    }
  }
  
  const insertedPointsRules = await prisma.pointsRule.createMany({
    data: pointsRules,
  });

  const insertedProducts = await prisma.product.createMany({
    data: products,
  });

  // ##############################################################
  // Redwan's Seed Data
  // ##############################################################

  // Insert questions
  const insertedQuestions = await prisma.question.createMany({
    data: questions,
    skipDuplicates: true,
  });
  console.log(`${insertedQuestions.count} questions inserted.`);

  // Insert answers
  const insertedAnswers = await prisma.answer.createMany({
    data: answers,
    skipDuplicates: true,
  });
  console.log(`${insertedAnswers.count} answers inserted.`);

  // Insert likes
  const insertedLikes = await prisma.like.createMany({
    data: likes,
    skipDuplicates: true,
  });
  console.log(`${insertedLikes.count} likes inserted.`);

  // Insert saved questions
  const insertedSavedQuestions = await prisma.savedQuestion.createMany({
    data: savedQuestions,
    skipDuplicates: true,
  });
  console.log(`${insertedSavedQuestions.count} saved questions inserted.`);

  // Insert todos
  const insertedTodos = await prisma.todo.createMany({
    data: todos,
    skipDuplicates: true,
  });
  console.log(`${insertedTodos.count} todos inserted.`);

  // Insert Assigned Tasks
  const insertedAssignedTasks = await prisma.assignedTask.createMany({
    data: assignedTask
  });
  console.log(`${insertedAssignedTasks.count} assigned tasks inserted.`);

  // ##############################################################
  // Alice's Seed Data
  // ##############################################################

  // Insert Tags with userId
  const insertedTags = await prisma.tag.createMany({
    data: tags,
    skipDuplicates: true,  // Avoid inserting duplicates
  });

  console.log('Inserted Tags:', insertedTags);

  // Seed Resources
  const insertedResources = await prisma.resource.createMany({
    data: resources.map((resource, index) => ({
      ...resource,
      createdById: index + 1, // Assuming users with IDs 1 to 5 exist for createdById
      createdAt: new Date(),
    })),
  });

  const insertedBookmarks = await prisma.bookmark.createMany({
    data: bookmarks.map((bookmark) => ({
      ...bookmark,
      createdAt: new Date(), // Add a timestamp
    })),
    skipDuplicates: true, // Avoid errors if re-seeding
  });

  console.log(`${insertedBookmarks.count} bookmarks inserted.`);

  // Insert Resource Tags with userId
  const insertedResourceTags = await prisma.resourceTag.createMany({
    data: resourceTags,
  });

  console.log('Inserted Resource Tags:', insertedResourceTags);


  const insertedTutorProfiles = await prisma.tutorProfile.createMany({
    data: tutorProfiles,
  });
  console.log('Inserted Tutor profiles', insertedTutorProfiles);


  const insertedAvailabilitySlots = await prisma.availabilitySlot.createMany({
    data: availabilitySlots,
  });
  console.log('Inserted Tutor slots', insertedAvailabilitySlots);


  // const insertedTutorBookings = await prisma.tutorBooking.createMany({
  //   data: tutorBookings,
  // });
  // console.log('Inserted Tutor bookings', insertedTutorBookings);


  async function seedAdditionalTutorBookings() {
    for (const booking of tutorBookings) {
      try {
        // Calculate the endDate based on the startDate and durationMonths
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + booking.durationMonths);
  
        await prisma.tutorBooking.create({
          data: {
            tuteeId: booking.tuteeId,
            slotId: booking.slotId,
            durationMonths: booking.durationMonths,
            startDate: startDate,
            endDate: endDate,
            status: booking.status,
          },
        });
        console.log(`Additional tutor booking for tutee ${booking.tuteeId} added successfully!`);
      } catch (error) {
        console.error(`Error adding additional tutor booking for tutee ${booking.tuteeId}:`, error);
      }
    }
    await prisma.$disconnect();
  }
  
  seedAdditionalTutorBookings();


  // ##############################################################
  // Anna's Seed Data
  // ##############################################################
  const insertedStudyGroups = await prisma.studyGroup.createManyAndReturn({
    data: studyGroups.map((group, index) => ({
      ...group,
      createdBy: insertedUsers[index % insertedUsers.length].userId,
      createdAt: new Date(),
    })),
  });

  // Seed Study Rooms
  const insertedStudyRooms = await prisma.studyRoom.createManyAndReturn({
    data: studyRooms,
  });

  console.log('Inserted Study Groups:', insertedStudyGroups);
  console.log('Inserted Study Rooms:', insertedStudyRooms);

  // Insert RoomSlots using create instead of createMany to get the inserted data
  const insertedRoomSlots = [];
  for (const roomSlot of roomSlots) {
    const insertedSlot = await prisma.roomSlot.create({
      data: roomSlot,
    });
    insertedRoomSlots.push(insertedSlot);
  }

  console.log('Room slots seeded:', insertedRoomSlots);

  // Fetch room slots from DB (to get their slotIds)
  const roomSlotsFromDb = await prisma.roomSlot.findMany({
    select: { slotId: true },
  });

  console.log('Room slots from database:', roomSlotsFromDb);

  // Seed Bookings
  const insertedBookings = await prisma.booking.createMany({
    data: bookings.map((booking, index) => ({
      groupId: insertedStudyGroups[index % insertedStudyGroups.length].groupId,
      roomId: insertedStudyRooms[index % insertedStudyRooms.length].roomId,
      slotId: booking.slotId, // Use the slotId from the bookings array
      bookingDate: new Date(booking.bookingDate),
      status: booking.status, // Confirmed or Cancelled
      timeout: new Date(booking.timeout),
      createdAt: new Date(),
    })),
  });

  console.log('Inserted Bookings:', insertedBookings);

  const insertedUserStudyGroups = await prisma.userStudyGroup.createManyAndReturn({
    data: userStudyGroups,
  });

  console.log('User study groups seeded:', insertedUserStudyGroups);

  
  const insertedMessages = await prisma.message.createMany({
    data: messages,
    });
  
  console.log("Messages seeded:", insertedMessages);

  // Insert polls into the database
  const insertedPolls = await prisma.poll.createMany({
    data: polls,
  });

  console.log("polls seeded:", insertedPolls);

  // Insert poll options into the database
  const insertedPollOptions = await prisma.pollOption.createMany({
    data: pollOptions,
  });

  console.log("poll options seeded:", insertedPollOptions);

  const insertedFeedbacks = await prisma.feedback.createMany({
    data: feedbacks,
  });
  
  console.log('Feedbacks seeded:', insertedFeedbacks);

  console.log('Seed data inserted successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
