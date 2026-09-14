import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';

// Load env
const envText = readFileSync('.env', 'utf-8');
const env = {};
envText.split('\n').forEach(line => {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase credentials. Check .env for VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const PASSWORD_HASH = bcrypt.hashSync('password123', 10);

// ===== Helper functions =====
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ===== Data definitions =====
const FACULTIES = [
  { name: 'Faculty of Engineering', code: 'ENG' },
  { name: 'Faculty of Computing & IT', code: 'CIT' },
  { name: 'Faculty of Sciences', code: 'SCI' },
  { name: 'Faculty of Arts & Humanities', code: 'ART' },
  { name: 'Faculty of Management Sciences', code: 'MGT' },
  { name: 'Faculty of Agriculture', code: 'AGR' },
];

const DEPARTMENTS = [
  { name: 'Computer Science', code: 'CS', faculty: 'CIT', evening: true },
  { name: 'Information Technology', code: 'IT', faculty: 'CIT', evening: true },
  { name: 'Artificial Intelligence', code: 'AI', faculty: 'CIT', evening: true },
  { name: 'Software Engineering', code: 'SE', faculty: 'CIT', evening: false },
  { name: 'English', code: 'EN', faculty: 'ART', evening: true },
  { name: 'Mathematics', code: 'MTH', faculty: 'SCI', evening: false },
  { name: 'Physics', code: 'PHY', faculty: 'SCI', evening: false },
  { name: 'Psychology', code: 'PSY', faculty: 'ART', evening: false },
  { name: 'Civil Engineering', code: 'CIV', faculty: 'ENG', evening: false },
  { name: 'Electrical Engineering', code: 'ELE', faculty: 'ENG', evening: false },
];

const COURSE_NAMES = [
  'Database Systems', 'Operating Systems', 'Data Structures', 'Algorithms',
  'Computer Networks', 'Software Engineering', 'Web Development', 'Mobile Computing',
  'Machine Learning', 'Artificial Intelligence', 'Theory of Automata', 'Compiler Construction',
  'Digital Logic Design', 'Computer Architecture', 'Object Oriented Programming',
  'Discrete Mathematics', 'Linear Algebra', 'Probability & Statistics',
  'Technical Writing', 'Professional Ethics', 'Human Computer Interaction',
  'Cloud Computing', 'Cyber Security', 'Data Mining', 'Image Processing',
  'Information Systems', 'Quantitative Methods', 'Research Methods',
  'Project Management', 'Business Communication',
];

const FIRST_NAMES = [
  'Ahmad', 'Ali', 'Khan', 'Usman', 'Bilal', 'Hamza', 'Hassan', 'Hussain',
  'Imran', 'Junaid', 'Kamran', 'Mahmood', 'Nadeem', 'Omar', 'Qasim', 'Rashid',
  'Saeed', 'Tariq', 'Umair', 'Wasim', 'Yasir', 'Zubair', 'Asad', 'Faisal',
  'Ghufran', 'Ibrahim', 'Jamal', 'Kashif', 'Luqman', 'Mansoor', 'Naveed', 'Pervaiz',
  'Rizwan', 'Salman', 'Tahir', 'Umar', 'Wajid', 'Yousuf', 'Zeeshan', 'Adeel',
  'Ayesha', 'Fatima', 'Sara', 'Hira', 'Mahnoor', 'Sana', 'Ayesha', 'Zainab',
  'Maryam', 'Hira', 'Rabia', 'Saba', 'Nimra', 'Sadia', 'Tayyaba', 'Uzma',
  'Wajiha', 'Yusra', 'Zara', 'Aneeqa', 'Bushra', 'Fariha', 'Gulnaz', 'Iqra',
];

const LAST_NAMES = [
  'Khan', 'Ahmed', 'Malik', 'Sheikh', 'Qureshi', 'Abbasi', 'Chaudhry', 'Butt',
  'Rana', 'Tiwana', 'Awan', 'Hashmi', 'Raza', 'Siddiqui', 'Farooqi', 'Usmani',
  'Bhatti', 'Khokhar', 'Mirza', 'Baig', 'Sattar', 'Memon', 'Jamal', 'Lodhi',
  'Shah', 'Wali', 'Afzal', 'Aslam', 'Akram', 'Asghar', 'Iqbal', 'Mustafa',
];

function generateFullName() {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const title = pick(['Dr.', 'Dr.', 'Dr.', 'Prof.', 'Mr.', 'Ms.', 'Mr.']);
  return { first, last, title, display: `${title} ${first} ${last}` };
}

function emailFromName(name) {
  return name.toLowerCase()
    .replace(/dr\.\s*/g, '')
    .replace(/prof\.\s*/g, '')
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.@-]/g, '') + '@quest.edu.pk';
}

// ===== Batch & semester mapping =====
const BATCHES = [23, 24, 25, 26];
function semesterFromBatch(batch) {
  return Math.min(8, Math.max(1, 26 - batch + 1));
}

// ===== Main seeding function =====
async function seed() {
  console.log('Starting QUEST Portal seeding...\n');

  // 1. Insert faculties
  console.log('Inserting faculties...');
  const { data: facultyData } = await supabase.from('faculties').upsert(
    FACULTIES.map(f => ({ name: f.name, code: f.code })),
    { onConflict: 'code' }
  ).select();
  
  const facultyMap = {};
  const { data: faculties } = await supabase.from('faculties').select('*');
  faculties.forEach(f => facultyMap[f.code] = f.id);

  // 2. Insert departments
  console.log('Inserting departments...');
  await supabase.from('departments').upsert(
    DEPARTMENTS.map(d => ({
      name: d.name,
      code: d.code,
      faculty_id: facultyMap[d.faculty],
      is_evening_active: d.evening,
    })),
    { onConflict: 'code' }
  );
  
  const { data: depts } = await supabase.from('departments').select('*');
  const deptMap = {};
  depts.forEach(d => deptMap[d.code] = d);

  // 3. Insert shift types
  console.log('Inserting shift types...');
  await supabase.from('shift_types').upsert(
    [
      { name: 'Morning', start_time: '08:00', end_time: '14:00' },
      { name: 'Evening', start_time: '14:00', end_time: '20:30' },
    ],
    { onConflict: 'name' }
  );
  const { data: shifts } = await supabase.from('shift_types').select('*');
  const morningShiftId = shifts.find(s => s.name === 'Morning').id;
  const eveningShiftId = shifts.find(s => s.name === 'Evening').id;

  // 4. Create auth users + user_profiles + student_profiles
  // For auth users, we use supabase.auth.admin.createUser
  
  // 4a. HOD accounts (one per department)
  console.log('Creating HOD accounts...');
  let hodCount = 0;
  for (const dept of depts) {
    const email = `hod.${dept.code.toLowerCase()}@quest.edu.pk`;
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password: 'password123',
      email_confirm: true,
    });
    if (authErr && !authErr.message.includes('already')) {
      console.error(`HOD auth error for ${email}:`, authErr.message);
      continue;
    }
    const authId = authUser?.user?.id;
    
    const { data: existingProfile } = await supabase.from('user_profiles')
      .select('id').eq('email', email).maybeSingle();
    
    if (existingProfile) {
      // Update auth_id if needed
      if (authId && existingProfile.auth_id !== authId) {
        await supabase.from('user_profiles').update({ auth_id: authId }).eq('id', existingProfile.id);
      }
      hodCount++;
      continue;
    }
    
    const { data: profile } = await supabase.from('user_profiles').insert({
      auth_id: authId,
      email,
      role: 'hod',
      full_name: `HOD ${dept.name}`,
      department_id: dept.id,
    }).select().single();
    hodCount++;
  }
  console.log(`HOD accounts: ${hodCount}`);

  // 4b. Teacher accounts (100 morning teachers, 10 per department)
  console.log('Creating teacher accounts...');
  const TEACHERS_PER_DEPT = 10;
  const TOTAL_TEACHERS = TEACHERS_PER_DEPT * depts.length; // 100
  
  const { count: existingTeachers } = await supabase.from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'teacher');
  
  let teacherCount = existingTeachers || 0;
  
  if (teacherCount < TOTAL_TEACHERS) {
    for (const dept of depts) {
      // Count existing teachers in this dept
      const { count: deptTeacherCount } = await supabase.from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher')
        .eq('department_id', dept.id);
      const needed = TEACHERS_PER_DEPT - (deptTeacherCount || 0);
      
      for (let i = 0; i < needed; i++) {
        const name = generateFullName();
        const email = emailFromName(name.display);
        
        const { data: existing } = await supabase.from('user_profiles')
          .select('id').eq('email', email).maybeSingle();
        if (existing) continue;
        
        const { data: authUser } = await supabase.auth.admin.createUser({
          email,
          password: 'password123',
          email_confirm: true,
        });
        
        const { data: profile } = await supabase.from('user_profiles').insert({
          auth_id: authUser?.user?.id,
          email,
          role: 'teacher',
          full_name: name.display,
          department_id: dept.id,
        }).select().single();
        
        await supabase.from('teacher_shift_assignments').upsert({
          user_id: profile.id,
          shift_type_id: morningShiftId,
          department_id: dept.id,
        }, { onConflict: 'user_id,shift_type_id,department_id' });
        
        teacherCount++;
      }
    }
  }
  console.log(`Teacher accounts: ${teacherCount}`);

  // 4c. Dual-shift assignments (50 teachers also assigned evening)
  console.log('Creating dual-shift assignments...');
  const DUAL_SHIFT_COUNT = 50;
  const { data: allTeachers } = await supabase.from('user_profiles')
    .select('id, department_id').eq('role', 'teacher').limit(DUAL_SHIFT_COUNT);
  
  let dualCount = 0;
  for (const teacher of allTeachers) {
    const { data: existing } = await supabase.from('teacher_shift_assignments')
      .select('id')
      .eq('user_id', teacher.id)
      .eq('shift_type_id', eveningShiftId)
      .maybeSingle();
    if (existing) { dualCount++; continue; }
    
    await supabase.from('teacher_shift_assignments').insert({
      user_id: teacher.id,
      shift_type_id: eveningShiftId,
      department_id: teacher.department_id,
    });
    dualCount++;
  }
  console.log(`Dual-shift assignments: ${dualCount}`);

  // 4d. Morning students (200 total, 20 per department, 5 per batch)
  console.log('Creating morning students...');
  const eveningDepts = depts.filter(d => d.is_evening_active);
  const MORNING_PER_DEPT = 20; // 20 * 10 = 200
  
  const { count: morningCount } = await supabase.from('student_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('shift_type_id', morningShiftId);
  let morningStudentCount = morningCount || 0;
  
  if (morningStudentCount < MORNING_PER_DEPT * depts.length) {
    for (const dept of depts) {
      const { count: deptMorningCount } = await supabase.from('student_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('shift_type_id', morningShiftId)
        .eq('department_id', dept.id);
      const needed = MORNING_PER_DEPT - (deptMorningCount || 0);
      
      let seqNum = 1;
      for (let i = 0; i < needed; i++) {
        const batchIdx = Math.floor(i / 5); // 5 per batch, 4 batches
        const batch = BATCHES[batchIdx % BATCHES.length];
        const idStr = String(seqNum).padStart(2, '0');
        const rollNumber = `${batch}BS${dept.code}-${idStr}`;
        const email = `${rollNumber.toLowerCase()}@quest.edu.pk`;
        seqNum++;
        
        const { data: existing } = await supabase.from('user_profiles')
          .select('id').eq('email', email).maybeSingle();
        if (existing) continue;
        
        const name = generateFullName();
        const { data: authUser } = await supabase.auth.admin.createUser({
          email,
          password: 'password123',
          email_confirm: true,
        });
        
        const { data: profile } = await supabase.from('user_profiles').insert({
          auth_id: authUser?.user?.id,
          email,
          role: 'student',
          full_name: `${name.first} ${name.last}`,
          department_id: dept.id,
        }).select().single();
        
        await supabase.from('student_profiles').insert({
          user_id: profile.id,
          roll_number: rollNumber,
          department_id: dept.id,
          shift_type_id: morningShiftId,
          batch,
          section: 'A',
          semester: semesterFromBatch(batch),
        });
        
        morningStudentCount++;
      }
    }
  }
  console.log(`Morning students: ${morningStudentCount}`);

  // 4e. Evening students (150 total, only in evening-active depts: CS, IT, AI, EN)
  console.log('Creating evening students...');
  const EVENING_PER_DEPT = Math.ceil(150 / eveningDepts.length); // ~38 per dept
  
  const { count: eveningCount } = await supabase.from('student_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('shift_type_id', eveningShiftId);
  let eveningStudentCount = eveningCount || 0;
  
  if (eveningStudentCount < 150) {
    let totalEveningTarget = 150;
    for (const dept of eveningDepts) {
      const { count: deptEveningCount } = await supabase.from('student_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('shift_type_id', eveningShiftId)
        .eq('department_id', dept.id);
      const needed = EVENING_PER_DEPT - (deptEveningCount || 0);
      
      let seqNum = 1;
      for (let i = 0; i < needed; i++) {
        if (eveningStudentCount >= totalEveningTarget) break;
        const batchIdx = Math.floor(i / 10);
        const batch = BATCHES[batchIdx % BATCHES.length];
        const idStr = String(seqNum).padStart(2, '0');
        const rollNumber = `${batch}BS${dept.code}-${idStr}(E)`;
        const email = `${rollNumber.toLowerCase()}@quest.edu.pk`;
        seqNum++;
        
        const { data: existing } = await supabase.from('user_profiles')
          .select('id').eq('email', email).maybeSingle();
        if (existing) continue;
        
        const name = generateFullName();
        const { data: authUser } = await supabase.auth.admin.createUser({
          email,
          password: 'password123',
          email_confirm: true,
        });
        
        const { data: profile } = await supabase.from('user_profiles').insert({
          auth_id: authUser?.user?.id,
          email,
          role: 'student',
          full_name: `${name.first} ${name.last}`,
          department_id: dept.id,
        }).select().single();
        
        await supabase.from('student_profiles').insert({
          user_id: profile.id,
          roll_number: rollNumber,
          department_id: dept.id,
          shift_type_id: eveningShiftId,
          batch,
          section: 'A',
          semester: semesterFromBatch(batch),
        });
        
        eveningStudentCount++;
      }
    }
  }
  console.log(`Evening students: ${eveningStudentCount}`);

  // 5. Course catalog (15+ courses per department)
  console.log('Creating course catalog...');
  for (const dept of depts) {
    const { data: existingCourses } = await supabase.from('course_catalog')
      .select('id').eq('department_id', dept.id).limit(1);
    if (existingCourses && existingCourses.length > 0) continue;
    
    const numCourses = randInt(15, 20);
    const usedNames = new Set();
    for (let i = 0; i < numCourses; i++) {
      let courseName = pick(COURSE_NAMES);
      while (usedNames.has(courseName)) {
        courseName = pick(COURSE_NAMES);
      }
      usedNames.add(courseName);
      
      const code = `${dept.code}${randInt(101, 499)}`;
      const type = pick(['theory', 'lab', 'both']);
      
      await supabase.from('course_catalog').insert({
        department_id: dept.id,
        code,
        name: courseName,
        credit_hours: type === 'lab' ? 1 : 3,
        course_type: type,
      });
    }
  }
  const { data: allCourses } = await supabase.from('course_catalog').select('*');
  console.log(`Courses created: ${allCourses.length}`);

  // 6. Academic terms
  console.log('Creating academic terms...');
  for (const dept of depts) {
    const { data: existingTerm } = await supabase.from('academic_terms')
      .select('id').eq('department_id', dept.id).eq('is_active', true).limit(1);
    if (existingTerm && existingTerm.length > 0) continue;
    
    const semester = randInt(1, 8);
    await supabase.from('academic_terms').insert({
      department_id: dept.id,
      name: `Fall 2026 - Semester ${semester}`,
      session: '2023-2027',
      semester,
      is_active: true,
    });
  }
  const { data: allTerms } = await supabase.from('academic_terms').select('*');

  // 7. Course offerings (for each dept, create offerings for active batch/section combos)
  console.log('Creating course offerings...');
  const { data: existingOfferings } = await supabase.from('course_offerings').select('id').limit(1);
  if (!existingOfferings || existingOfferings.length === 0) {
    for (const dept of depts) {
      const deptCourses = allCourses.filter(c => c.department_id === dept.id);
      const deptTerms = allTerms.filter(t => t.department_id === dept.id);
      if (deptTerms.length === 0) continue;
      const term = deptTerms[0];
      
      // Get all unique batch/section combos from students in this dept
      const { data: deptStudents } = await supabase
        .from('student_profiles')
        .select('batch, section, shift_type_id')
        .eq('department_id', dept.id);
      
      if (!deptStudents || deptStudents.length === 0) continue;
      
      const batchSectionCombos = {};
      deptStudents.forEach(s => {
        const key = `${s.batch}-${s.section}-${s.shift_type_id}`;
        if (!batchSectionCombos[key]) {
          batchSectionCombos[key] = { batch: s.batch, section: s.section, shift_type_id: s.shift_type_id };
        }
      });
      
      for (const combo of Object.values(batchSectionCombos)) {
        // Pick 5-8 courses per combo
        const numOfferings = Math.min(deptCourses.length, randInt(5, 8));
        const selectedCourses = deptCourses.slice(0, numOfferings);
        
        for (const course of selectedCourses) {
          const assignmentDeadline = new Date();
          assignmentDeadline.setDate(assignmentDeadline.getDate() + randInt(5, 30));
          const marksDeadline = new Date();
          marksDeadline.setDate(marksDeadline.getDate() + randInt(35, 90));
          
          const { data: offering } = await supabase.from('course_offerings').insert({
            course_id: course.id,
            academic_term_id: term.id,
            department_id: dept.id,
            batch: combo.batch,
            section: combo.section,
            shift_type_id: combo.shift_type_id,
            assignment_deadline: assignmentDeadline.toISOString().split('T')[0],
            marks_deadline: marksDeadline.toISOString().split('T')[0],
          }).select().single();
          
          // Assign a teacher from this dept to this offering
          const { data: deptTeachers } = await supabase
            .from('teacher_shift_assignments')
            .select('user_id')
            .eq('department_id', dept.id)
            .eq('shift_type_id', combo.shift_type_id);
          
          if (deptTeachers && deptTeachers.length > 0) {
            const teacher = pick(deptTeachers);
            const types = course.course_type === 'both' ? ['theory', 'lab'] : [course.course_type];
            for (const ct of types) {
              await supabase.from('class_schedules').upsert({
                teacher_id: teacher.user_id,
                course_offering_id: offering.id,
                class_type: ct,
              }, { onConflict: 'teacher_id,course_offering_id,class_type' });
            }
          }
          
          // Enroll all students in this batch/section/shift combo for this dept
          const { data: enrolledStudents } = await supabase
            .from('student_profiles')
            .select('user_id')
            .eq('department_id', dept.id)
            .eq('batch', combo.batch)
            .eq('section', combo.section)
            .eq('shift_type_id', combo.shift_type_id);
          
          if (enrolledStudents) {
            for (const student of enrolledStudents) {
              await supabase.from('student_enrollments').upsert({
                student_id: student.user_id,
                course_offering_id: offering.id,
              }, { onConflict: 'student_id,course_offering_id' });
            }
          }
        }
      }
    }
  }
  
  const { count: offeringCount } = await supabase.from('course_offerings').select('*', { count: 'exact', head: true });
  const { count: enrollmentCount } = await supabase.from('student_enrollments').select('*', { count: 'exact', head: true });
  const { count: scheduleCount } = await supabase.from('class_schedules').select('*', { count: 'exact', head: true });
  console.log(`Course offerings: ${offeringCount}`);
  console.log(`Enrollments: ${enrollmentCount}`);
  console.log(`Class schedules: ${scheduleCount}`);

  // 8. Create grades for enrolled students (initial random grades for some)
  console.log('Creating grades...');
  const { data: existingGrades } = await supabase.from('grades').select('id').limit(1);
  if (!existingGrades || existingGrades.length === 0) {
    const { data: allEnrollments } = await supabase.from('student_enrollments').select(`
      student_id, course_offering_id, 
      course_offerings!inner(course_id, course_catalog!inner(course_type))
    `).limit(5000);
    
    if (allEnrollments) {
      const gradesToInsert = [];
      for (const enrollment of allEnrollments) {
        // Only create grades for ~60% of enrollments (some pending)
        if (Math.random() > 0.6) continue;
        
        const courseType = enrollment.course_offerings?.course_catalog?.course_type;
        if (!courseType) continue;
        
        const types = courseType === 'both' ? ['theory'] : [courseType === 'lab' ? 'lab' : 'theory'];
        for (const ct of types) {
          if (ct === 'theory') {
            gradesToInsert.push({
              student_id: enrollment.student_id,
              course_offering_id: enrollment.course_offering_id,
              class_type: 'theory',
              theory_sessional: randInt(0, 20),
              theory_mid: randInt(0, 20),
              theory_final: randInt(0, 60),
            });
          } else {
            gradesToInsert.push({
              student_id: enrollment.student_id,
              course_offering_id: enrollment.course_offering_id,
              class_type: 'lab',
              lab_viva: randInt(0, 10),
              lab_work: randInt(0, 10),
              lab_project: randInt(0, 10),
              lab_mid: randInt(0, 20),
            });
          }
        }
      }
      
      // Insert in batches of 100
      for (let i = 0; i < gradesToInsert.length; i += 100) {
        await supabase.from('grades').upsert(gradesToInsert.slice(i, i + 100), { onConflict: 'student_id,course_offering_id,class_type' });
      }
      console.log(`Grades created: ${gradesToInsert.length}`);
    }
  } else {
    console.log('Grades already exist, skipping.');
  }

  // 9. Create some submissions
  console.log('Creating submissions...');
  const { data: existingSubs } = await supabase.from('submissions').select('id').limit(1);
  if (!existingSubs || existingSubs.length === 0) {
    const { data: allEnrollments } = await supabase.from('student_enrollments').select('student_id, course_offering_id').limit(2000);
    if (allEnrollments) {
      const subsToInsert = [];
      for (const enrollment of allEnrollments) {
        if (Math.random() > 0.4) continue;
        subsToInsert.push({
          student_id: enrollment.student_id,
          course_offering_id: enrollment.course_offering_id,
          file_name: `assignment_${randInt(1, 999)}.pdf`,
          file_path: `/uploads/${randInt(1000, 9999)}_${randInt(100, 999)}.pdf`,
          file_hash: Array.from({length: 64}, () => pick('0123456789abcdef')).join(''),
          file_size: randInt(50000, 5000000),
        });
      }
      for (let i = 0; i < subsToInsert.length; i += 100) {
        await supabase.from('submissions').upsert(subsToInsert.slice(i, i + 100), { onConflict: 'student_id,course_offering_id' });
      }
      console.log(`Submissions created: ${subsToInsert.length}`);
    }
  } else {
    console.log('Submissions already exist, skipping.');
  }

  // ===== Final counts =====
  console.log('\n========== SEED SUMMARY ==========');
  const { count: dayStudents } = await supabase.from('student_profiles').select('*', { count: 'exact', head: true }).eq('shift_type_id', morningShiftId);
  const { count: eveStudents } = await supabase.from('student_profiles').select('*', { count: 'exact', head: true }).eq('shift_type_id', eveningShiftId);
  const { count: teachers } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher');
  const { count: dualShift } = await supabase.from('teacher_shift_assignments').select('*', { count: 'exact', head: true }).eq('shift_type_id', eveningShiftId);
  const { count: hods } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('role', 'hod');
  
  console.log(`Day Students: ${dayStudents}`);
  console.log(`Evening Students: ${eveStudents}`);
  console.log(`Teachers: ${teachers}`);
  console.log(`Dual-Shift Assignments: ${dualShift}`);
  console.log(`Total Primary Records: ${(dayStudents || 0) + (eveStudents || 0) + (teachers || 0)}`);
  console.log(`HOD Accounts: ${hods}`);
  console.log('==================================\n');
  console.log('Seeding complete!');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
