const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User    = require('./models/User');
const Teacher = require('./models/Teacher');
const Subject = require('./models/Subject');
const Class   = require('./models/Class');
const Room    = require('./models/Room');
const Timetable = require('./models/Timetable');

const ACADEMIC_YEAR = '2024-25';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
  { index: 0, label: 'Period 1',  startTime: '08:00', endTime: '08:50', isBreak: false },
  { index: 1, label: 'Period 2',  startTime: '08:50', endTime: '09:40', isBreak: false },
  { index: 2, label: 'Period 3',  startTime: '09:40', endTime: '10:30', isBreak: false },
  { index: 3, label: 'Break',     startTime: '10:30', endTime: '10:50', isBreak: true  },
  { index: 4, label: 'Period 4',  startTime: '10:50', endTime: '11:40', isBreak: false },
  { index: 5, label: 'Period 5',  startTime: '11:40', endTime: '12:30', isBreak: false },
  { index: 6, label: 'Lunch',     startTime: '12:30', endTime: '13:10', isBreak: true  },
  { index: 7, label: 'Period 6',  startTime: '13:10', endTime: '14:00', isBreak: false },
  { index: 8, label: 'Period 7',  startTime: '14:00', endTime: '14:50', isBreak: false },
];

async function clearAll() {
  await Promise.all([
    User.deleteMany({}),
    Teacher.deleteMany({}),
    Subject.deleteMany({}),
    Class.deleteMany({}),
    Room.deleteMany({}),
    Timetable.deleteMany({}),
  ]);
  console.log(' All collections cleared.');
}

async function seed() {
  await connectDB();

  if (process.argv.includes('--clear')) {
    await clearAll();
    process.exit(0);
  }

  await clearAll();
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@school.com',
    password: 'admin123',
    role: 'admin',
    department: 'Administration',
  });
  console.log('Admin user created  →  admin@school.com / admin123');
  const subjectDefs = [
    { subjectCode: 'MATH10', name: 'Mathematics',        shortName: 'MATH',  department: 'Science',    periodsPerWeek: 6, type: 'theory' },
    { subjectCode: 'PHY10',  name: 'Physics',            shortName: 'PHY',   department: 'Science',    periodsPerWeek: 5, type: 'both'   },
    { subjectCode: 'CHEM10', name: 'Chemistry',          shortName: 'CHEM',  department: 'Science',    periodsPerWeek: 5, type: 'both'   },
    { subjectCode: 'BIO10',  name: 'Biology',            shortName: 'BIO',   department: 'Science',    periodsPerWeek: 4, type: 'both'   },
    { subjectCode: 'ENG10',  name: 'English',            shortName: 'ENG',   department: 'Languages',  periodsPerWeek: 5, type: 'theory' },
    { subjectCode: 'HINDI10',name: 'Hindi',              shortName: 'HIN',   department: 'Languages',  periodsPerWeek: 4, type: 'theory' },
    { subjectCode: 'CS10',   name: 'Computer Science',   shortName: 'CS',    department: 'IT',         periodsPerWeek: 4, type: 'both'   },
    { subjectCode: 'SST10',  name: 'Social Studies',     shortName: 'SST',   department: 'Humanities', periodsPerWeek: 4, type: 'theory' },
    { subjectCode: 'ECO11',  name: 'Economics',          shortName: 'ECO',   department: 'Humanities', periodsPerWeek: 5, type: 'theory' },
    { subjectCode: 'ACC11',  name: 'Accountancy',        shortName: 'ACC',   department: 'Commerce',   periodsPerWeek: 6, type: 'theory' },
    { subjectCode: 'BST11',  name: 'Business Studies',   shortName: 'BST',   department: 'Commerce',   periodsPerWeek: 5, type: 'theory' },
    { subjectCode: 'PE10',   name: 'Physical Education', shortName: 'PE',    department: 'Sports',     periodsPerWeek: 2, type: 'theory' },
  ];
  const subjects = await Subject.insertMany(subjectDefs);
  const subMap = {};
  subjects.forEach((s) => (subMap[s.subjectCode] = s._id));
  console.log(`${subjects.length} subjects created`);
  const teacherDefs = [
    { teacherId: 'TCH001', name: 'Rajesh Kumar',    email: 'rajesh@school.com',   department: 'Science',    subjects: ['MATH10'],          maxPeriodsPerWeek: 30 },
    { teacherId: 'TCH002', name: 'Priya Sharma',    email: 'priya@school.com',    department: 'Science',    subjects: ['PHY10'],           maxPeriodsPerWeek: 28 },
    { teacherId: 'TCH003', name: 'Amit Singh',      email: 'amit@school.com',     department: 'Science',    subjects: ['CHEM10'],          maxPeriodsPerWeek: 28 },
    { teacherId: 'TCH004', name: 'Sunita Gupta',    email: 'sunita@school.com',   department: 'Science',    subjects: ['BIO10'],           maxPeriodsPerWeek: 25 },
    { teacherId: 'TCH005', name: 'Neha Verma',      email: 'neha@school.com',     department: 'Languages',  subjects: ['ENG10'],           maxPeriodsPerWeek: 30 },
    { teacherId: 'TCH006', name: 'Ramesh Tiwari',   email: 'ramesh@school.com',   department: 'Languages',  subjects: ['HINDI10'],         maxPeriodsPerWeek: 28 },
    { teacherId: 'TCH007', name: 'Anjali Mehta',    email: 'anjali@school.com',   department: 'IT',         subjects: ['CS10'],            maxPeriodsPerWeek: 25 },
    { teacherId: 'TCH008', name: 'Vijay Patel',     email: 'vijay@school.com',    department: 'Humanities', subjects: ['SST10', 'ECO11'],  maxPeriodsPerWeek: 30 },
    { teacherId: 'TCH009', name: 'Kavita Joshi',    email: 'kavita@school.com',   department: 'Commerce',   subjects: ['ACC11'],           maxPeriodsPerWeek: 28 },
    { teacherId: 'TCH010', name: 'Sanjay Dubey',    email: 'sanjay@school.com',   department: 'Commerce',   subjects: ['BST11'],           maxPeriodsPerWeek: 25 },
    { teacherId: 'TCH011', name: 'Meena Rao',       email: 'meena@school.com',    department: 'Sports',     subjects: ['PE10'],            maxPeriodsPerWeek: 20 },
    { teacherId: 'TCH012', name: 'Deepak Nair',     email: 'deepak@school.com',   department: 'Science',    subjects: ['MATH10', 'PHY10'], maxPeriodsPerWeek: 30 },
  ];

  const teacherDocs = teacherDefs.map((t) => ({
    ...t,
    subjects: t.subjects.map((code) => subMap[code]),
  }));
  const teachers = await Teacher.insertMany(teacherDocs);
  const tMap = {};
  teachers.forEach((t) => (tMap[t.teacherId] = t._id));
  console.log(`${teachers.length} teachers created`);
  const roomDefs = [
    { roomNumber: '101', name: 'Class 10A Room',   type: 'classroom',     capacity: 40, building: 'Block A', floor: 1, facilities: ['projector'] },
    { roomNumber: '102', name: 'Class 10B Room',   type: 'classroom',     capacity: 40, building: 'Block A', floor: 1, facilities: ['projector'] },
    { roomNumber: '103', name: 'Class 11A Room',   type: 'classroom',     capacity: 45, building: 'Block A', floor: 1, facilities: ['projector', 'smart_board'] },
    { roomNumber: '104', name: 'Class 12A Room',   type: 'classroom',     capacity: 45, building: 'Block A', floor: 1, facilities: ['projector'] },
    { roomNumber: '201', name: 'Physics Lab',      type: 'lab',           capacity: 30, building: 'Block B', floor: 2, facilities: ['lab_equipment', 'projector'] },
    { roomNumber: '202', name: 'Chemistry Lab',    type: 'lab',           capacity: 30, building: 'Block B', floor: 2, facilities: ['lab_equipment'] },
    { roomNumber: '203', name: 'Biology Lab',      type: 'lab',           capacity: 30, building: 'Block B', floor: 2, facilities: ['lab_equipment'] },
    { roomNumber: '204', name: 'Computer Lab',     type: 'lab',           capacity: 35, building: 'Block B', floor: 2, facilities: ['computers', 'projector', 'AC'] },
    { roomNumber: '301', name: 'Seminar Hall',     type: 'seminar_hall',  capacity: 80, building: 'Block C', floor: 3, facilities: ['projector', 'AC', 'smart_board'] },
    { roomNumber: '302', name: 'Lecture Hall',     type: 'lecture_hall',  capacity: 120,building: 'Block C', floor: 3, facilities: ['projector', 'AC'] },
  ];
  const rooms = await Room.insertMany(roomDefs);
  const rMap = {};
  rooms.forEach((r) => (rMap[r.roomNumber] = r._id));
  console.log(`${rooms.length} rooms created`);
  const classDefs = [
    {
      name: 'Class 10', section: 'A', grade: '10', department: 'Science',
      strength: 38, classTeacher: tMap['TCH001'], academicYear: ACADEMIC_YEAR,
      subjects: [
        { subject: subMap['MATH10'], teacher: tMap['TCH001'] },
        { subject: subMap['PHY10'],  teacher: tMap['TCH002'] },
        { subject: subMap['CHEM10'], teacher: tMap['TCH003'] },
        { subject: subMap['ENG10'],  teacher: tMap['TCH005'] },
        { subject: subMap['HINDI10'],teacher: tMap['TCH006'] },
        { subject: subMap['CS10'],   teacher: tMap['TCH007'] },
        { subject: subMap['PE10'],   teacher: tMap['TCH011'] },
      ],
    },
    {
      name: 'Class 10', section: 'B', grade: '10', department: 'Science',
      strength: 40, classTeacher: tMap['TCH002'], academicYear: ACADEMIC_YEAR,
      subjects: [
        { subject: subMap['MATH10'], teacher: tMap['TCH012'] },
        { subject: subMap['PHY10'],  teacher: tMap['TCH012'] },
        { subject: subMap['CHEM10'], teacher: tMap['TCH003'] },
        { subject: subMap['BIO10'],  teacher: tMap['TCH004'] },
        { subject: subMap['ENG10'],  teacher: tMap['TCH005'] },
        { subject: subMap['HINDI10'],teacher: tMap['TCH006'] },
        { subject: subMap['PE10'],   teacher: tMap['TCH011'] },
      ],
    },
    {
      name: 'Class 11', section: 'A', grade: '11', department: 'Commerce',
      strength: 42, classTeacher: tMap['TCH009'], academicYear: ACADEMIC_YEAR,
      subjects: [
        { subject: subMap['ACC11'],  teacher: tMap['TCH009'] },
        { subject: subMap['BST11'],  teacher: tMap['TCH010'] },
        { subject: subMap['ECO11'],  teacher: tMap['TCH008'] },
        { subject: subMap['MATH10'], teacher: tMap['TCH001'] },
        { subject: subMap['ENG10'],  teacher: tMap['TCH005'] },
        { subject: subMap['PE10'],   teacher: tMap['TCH011'] },
      ],
    },
  ];
  const classes = await Class.insertMany(classDefs);
  console.log(` ${classes.length} classes created`);
  const teachingIndices = [0, 1, 2, 4, 5, 7, 8];
  const class10ASlots = [
    // Monday
    { day: 'Monday', periodIndex: 0, subject: subMap['MATH10'], teacher: tMap['TCH001'], room: rMap['101'] },
    { day: 'Monday', periodIndex: 1, subject: subMap['ENG10'],  teacher: tMap['TCH005'], room: rMap['101'] },
    { day: 'Monday', periodIndex: 2, subject: subMap['PHY10'],  teacher: tMap['TCH002'], room: rMap['101'] },
    { day: 'Monday', periodIndex: 4, subject: subMap['CHEM10'], teacher: tMap['TCH003'], room: rMap['101'] },
    { day: 'Monday', periodIndex: 5, subject: subMap['CS10'],   teacher: tMap['TCH007'], room: rMap['204'] },
    { day: 'Monday', periodIndex: 7, subject: subMap['HINDI10'],teacher: tMap['TCH006'], room: rMap['101'] },
    { day: 'Monday', periodIndex: 8, subject: subMap['PE10'],   teacher: tMap['TCH011'], room: rMap['101'] },
    // Tuesday
    { day: 'Tuesday', periodIndex: 0, subject: subMap['PHY10'],  teacher: tMap['TCH002'], room: rMap['201'] },
    { day: 'Tuesday', periodIndex: 1, subject: subMap['MATH10'], teacher: tMap['TCH001'], room: rMap['101'] },
    { day: 'Tuesday', periodIndex: 2, subject: subMap['ENG10'],  teacher: tMap['TCH005'], room: rMap['101'] },
    { day: 'Tuesday', periodIndex: 4, subject: subMap['HINDI10'],teacher: tMap['TCH006'], room: rMap['101'] },
    { day: 'Tuesday', periodIndex: 5, subject: subMap['CHEM10'], teacher: tMap['TCH003'], room: rMap['202'] },
    { day: 'Tuesday', periodIndex: 7, subject: subMap['MATH10'], teacher: tMap['TCH001'], room: rMap['101'] },
    { day: 'Tuesday', periodIndex: 8, subject: subMap['CS10'],   teacher: tMap['TCH007'], room: rMap['204'] },
    // Wednesday
    { day: 'Wednesday', periodIndex: 0, subject: subMap['CHEM10'], teacher: tMap['TCH003'], room: rMap['202'] },
    { day: 'Wednesday', periodIndex: 1, subject: subMap['PHY10'],  teacher: tMap['TCH002'], room: rMap['101'] },
    { day: 'Wednesday', periodIndex: 2, subject: subMap['MATH10'], teacher: tMap['TCH001'], room: rMap['101'] },
    { day: 'Wednesday', periodIndex: 4, subject: subMap['ENG10'],  teacher: tMap['TCH005'], room: rMap['101'] },
    { day: 'Wednesday', periodIndex: 5, subject: subMap['HINDI10'],teacher: tMap['TCH006'], room: rMap['101'] },
    { day: 'Wednesday', periodIndex: 7, subject: subMap['PHY10'],  teacher: tMap['TCH002'], room: rMap['201'] },
    { day: 'Wednesday', periodIndex: 8, subject: subMap['MATH10'], teacher: tMap['TCH001'], room: rMap['101'] },
    // Thursday
    { day: 'Thursday', periodIndex: 0, subject: subMap['ENG10'],  teacher: tMap['TCH005'], room: rMap['101'] },
    { day: 'Thursday', periodIndex: 1, subject: subMap['CHEM10'], teacher: tMap['TCH003'], room: rMap['101'] },
    { day: 'Thursday', periodIndex: 2, subject: subMap['HINDI10'],teacher: tMap['TCH006'], room: rMap['101'] },
    { day: 'Thursday', periodIndex: 4, subject: subMap['MATH10'], teacher: tMap['TCH001'], room: rMap['101'] },
    { day: 'Thursday', periodIndex: 5, subject: subMap['CS10'],   teacher: tMap['TCH007'], room: rMap['204'] },
    { day: 'Thursday', periodIndex: 7, subject: subMap['PHY10'],  teacher: tMap['TCH002'], room: rMap['201'] },
    { day: 'Thursday', periodIndex: 8, subject: subMap['PE10'],   teacher: tMap['TCH011'], room: rMap['101'] },
    // Friday
    { day: 'Friday', periodIndex: 0, subject: subMap['MATH10'], teacher: tMap['TCH001'], room: rMap['101'] },
    { day: 'Friday', periodIndex: 1, subject: subMap['PHY10'],  teacher: tMap['TCH002'], room: rMap['201'] },
    { day: 'Friday', periodIndex: 2, subject: subMap['CS10'],   teacher: tMap['TCH007'], room: rMap['204'] },
    { day: 'Friday', periodIndex: 4, subject: subMap['CHEM10'], teacher: tMap['TCH003'], room: rMap['202'] },
    { day: 'Friday', periodIndex: 5, subject: subMap['ENG10'],  teacher: tMap['TCH005'], room: rMap['101'] },
    { day: 'Friday', periodIndex: 7, subject: subMap['HINDI10'],teacher: tMap['TCH006'], room: rMap['101'] },
    { day: 'Friday', periodIndex: 8, subject: subMap['MATH10'], teacher: tMap['TCH001'], room: rMap['101'] },
  ];

 
  const breakEntries = [];
  for (const day of DAYS) {
    breakEntries.push({ day, periodIndex: 3, isBreak: true, subject: undefined, teacher: undefined, room: undefined });
    breakEntries.push({ day, periodIndex: 6, isBreak: true, subject: undefined, teacher: undefined, room: undefined });
  }

  await Timetable.create({
    class: classes[0]._id,
    academicYear: ACADEMIC_YEAR,
    periods: PERIODS,
    workingDays: DAYS,
    entries: [...class10ASlots, ...breakEntries],
    isPublished: true,
    publishedAt: new Date(),
    createdBy: admin._id,
    lastModifiedBy: admin._id,
  });

  console.log('Timetable for Class 10A created and published');
  console.log('\n🎉 Seed complete!\n');
  console.log('─────────────────────────────────────────');
  console.log(' Admin login:  admin@school.com / admin123');
  console.log(' API base:     http://localhost:5000/api');
  console.log('─────────────────────────────────────────\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
