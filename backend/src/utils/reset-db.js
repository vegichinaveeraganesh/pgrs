/**
 * Reset Database Utility
 * Clears all collections and re-seeds with clean production-ready data.
 * Users get proper name, email, password — NO OTP verification required.
 * All roles and permissions are set correctly.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Mandal = require('../models/Mandal');
const Village = require('../models/Village');
const Official = require('../models/Official');
const Grievance = require('../models/Grievance');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');
const AuditLog = require('../models/AuditLog');
const { connectDB, disconnectDB } = require('../config/database');

async function resetAndSeed() {
  console.log('[Reset] Clearing ALL collections...');

  await Promise.all([
    User.deleteMany({}),
    Mandal.deleteMany({}),
    Village.deleteMany({}),
    Official.deleteMany({}),
    Grievance.deleteMany({}),
    Notification.deleteMany({}),
    Setting.deleteMany({}),
    AuditLog.deleteMany({})
  ]);
  console.log('[Reset] All collections cleared.');

  // ─── 1. USERS (email + password login, NO OTP needed) ─────────────
  const passwordHash = await bcrypt.hash('Admin@12345', 10);

  const users = [
    {
      name: 'Super Administrator',
      email: 'admin@bhimili.gov.in',
      passwordHash,
      role: 'super_admin',
      designation: 'System Administrator',
      phone: '+91 94901 23000',
      active: true,
      isEmailVerified: true    // No OTP needed
    },
    {
      name: 'Revenue Divisional Officer',
      email: 'rdo@bhimili.gov.in',
      passwordHash,
      role: 'rdo',
      designation: 'Revenue Divisional Officer, Bhimunipatnam Division',
      phone: '+91 94901 23000',
      active: true,
      isEmailVerified: true
    },
    {
      name: 'Smt. K. Lakshmi Prasanna',
      email: 'tahsildar.bhimili@gov.in',
      passwordHash,
      role: 'tahsildar',
      designation: 'Tahsildar, Bheemunipatnam',
      mandal: 'Bheemunipatnam',
      phone: '+91 94901 23001',
      active: true,
      isEmailVerified: true
    },
    {
      name: 'Sri D. Satyanarayana',
      email: 'tahsildar.anandapuram@gov.in',
      passwordHash,
      role: 'tahsildar',
      designation: 'Tahsildar, Anandapuram',
      mandal: 'Anandapuram',
      phone: '+91 94901 23002',
      active: true,
      isEmailVerified: true
    },
    {
      name: 'Sri B. Rama Krishna',
      email: 'tahsildar.padmanabham@gov.in',
      passwordHash,
      role: 'tahsildar',
      designation: 'Tahsildar, Padmanabham',
      mandal: 'Padmanabham',
      phone: '+91 94901 23003',
      active: true,
      isEmailVerified: true
    },
    {
      name: 'Sri K. Venkata Rao',
      email: 'tahsildar.rural@gov.in',
      passwordHash,
      role: 'tahsildar',
      designation: 'Tahsildar, Visakhapatnam Rural',
      mandal: 'Visakhapatnam Rural',
      phone: '+91 94901 23004',
      active: true,
      isEmailVerified: true
    },
    {
      name: 'Smt. P. Sridevi',
      email: 'tahsildar.seethammadhara@gov.in',
      passwordHash,
      role: 'tahsildar',
      designation: 'Tahsildar, Seethammadhara',
      mandal: 'Seethammadhara',
      phone: '+91 94901 23005',
      active: true,
      isEmailVerified: true
    },
    {
      name: 'Sri M. Srinivasa Rao',
      email: 'vro.tagarapuvalasa@gov.in',
      passwordHash,
      role: 'vro',
      designation: 'Village Revenue Officer',
      mandal: 'Bheemunipatnam',
      village: 'Tagarapuvalasa',
      phone: '+91 94901 23102',
      active: true,
      isEmailVerified: true
    },
    {
      name: 'PGRS Helpdesk Staff',
      email: 'staff@bhimili.gov.in',
      passwordHash,
      role: 'staff',
      designation: 'PGRS Portal Operator',
      phone: '+91 94901 23000',
      active: true,
      isEmailVerified: true
    }
  ];

  await User.insertMany(users);
  console.log(`[Reset] Seeded ${users.length} users (all verified, no OTP needed).`);

  // ─── 2. MANDALS ────────────────────────────────────────────────────
  const mandals = [
    { name: 'Bheemunipatnam', code: 'BHM', tahsildarName: 'Smt. K. Lakshmi Prasanna', tahsildarPhone: '+91 94901 23001' },
    { name: 'Anandapuram', code: 'AND', tahsildarName: 'Sri D. Satyanarayana', tahsildarPhone: '+91 94901 23002' },
    { name: 'Padmanabham', code: 'PDM', tahsildarName: 'Sri B. Rama Krishna', tahsildarPhone: '+91 94901 23003' },
    { name: 'Visakhapatnam Rural', code: 'VSP-RUR', tahsildarName: 'Sri K. Venkata Rao', tahsildarPhone: '+91 94901 23004' },
    { name: 'Seethammadhara', code: 'STM', tahsildarName: 'Smt. P. Sridevi', tahsildarPhone: '+91 94901 23005' }
  ];
  await Mandal.insertMany(mandals);
  console.log(`[Reset] Seeded ${mandals.length} mandals.`);

  // ─── 3. OFFICIALS ──────────────────────────────────────────────────
  const officials = [
    { name: 'RDO Bhimunipatnam', role: 'RDO', phone: '+91 94901 23000', email: 'rdo@bhimili.gov.in' },
    // Tahsildars
    { name: 'Smt. K. Lakshmi Prasanna', role: 'Tahsildar', phone: '+91 94901 23001', mandal: 'Bheemunipatnam', email: 'tahsildar.bhimili@gov.in' },
    { name: 'Sri D. Satyanarayana', role: 'Tahsildar', phone: '+91 94901 23002', mandal: 'Anandapuram', email: 'tahsildar.anandapuram@gov.in' },
    { name: 'Sri B. Rama Krishna', role: 'Tahsildar', phone: '+91 94901 23003', mandal: 'Padmanabham', email: 'tahsildar.padmanabham@gov.in' },
    { name: 'Sri K. Venkata Rao', role: 'Tahsildar', phone: '+91 94901 23004', mandal: 'Visakhapatnam Rural', email: 'tahsildar.rural@gov.in' },
    { name: 'Smt. P. Sridevi', role: 'Tahsildar', phone: '+91 94901 23005', mandal: 'Seethammadhara', email: 'tahsildar.seethammadhara@gov.in' },
    // VROs - Bheemunipatnam
    { name: 'Sri P. Appa Rao', role: 'VRO', phone: '+91 94901 23101', mandal: 'Bheemunipatnam', village: 'Bheemunipatnam', assignedVillages: ['Bheemunipatnam'] },
    { name: 'Sri M. Srinivasa Rao', role: 'VRO', phone: '+91 94901 23102', mandal: 'Bheemunipatnam', village: 'Tagarapuvalasa', assignedVillages: ['Tagarapuvalasa'] },
    { name: 'Smt. V. Ramanamma', role: 'VRO', phone: '+91 94901 23103', mandal: 'Bheemunipatnam', village: 'Sangivalasa', assignedVillages: ['Sangivalasa'] },
    // VROs - Anandapuram
    { name: 'Sri Ch. Demudu Naidu', role: 'VRO', phone: '+91 94901 23201', mandal: 'Anandapuram', village: 'Anandapuram', assignedVillages: ['Anandapuram'] },
    { name: 'Smt. S. Parvathi', role: 'VRO', phone: '+91 94901 23202', mandal: 'Anandapuram', village: 'Gambheeram', assignedVillages: ['Gambheeram'] },
    { name: 'Sri K. Trinadh', role: 'VRO', phone: '+91 94901 23203', mandal: 'Anandapuram', village: 'Mamidilova', assignedVillages: ['Mamidilova'] },
    // VROs - Padmanabham
    { name: 'Sri G. Simhachalam', role: 'VRO', phone: '+91 94901 23301', mandal: 'Padmanabham', village: 'Padmanabham', assignedVillages: ['Padmanabham'] },
    { name: 'Smt. A. Jyothi', role: 'VRO', phone: '+91 94901 23302', mandal: 'Padmanabham', village: 'Nerellavalasa', assignedVillages: ['Nerellavalasa'] },
    { name: 'Sri T. Eswara Rao', role: 'VRO', phone: '+91 94901 23303', mandal: 'Padmanabham', village: 'Korada', assignedVillages: ['Korada'] },
    // VROs - Visakhapatnam Rural
    { name: 'Sri S. Ramesh Babu', role: 'VRO', phone: '+91 94901 23401', mandal: 'Visakhapatnam Rural', village: 'Madhurawada', assignedVillages: ['Madhurawada'] },
    { name: 'Smt. L. Nagamani', role: 'VRO', phone: '+91 94901 23402', mandal: 'Visakhapatnam Rural', village: 'Rushikonda', assignedVillages: ['Rushikonda'] },
    // VROs - Seethammadhara
    { name: 'Sri V. Krishna Murthy', role: 'VRO', phone: '+91 94901 23501', mandal: 'Seethammadhara', village: 'Venkojipalem', assignedVillages: ['Venkojipalem'] },
    { name: 'Smt. B. Padmavati', role: 'VRO', phone: '+91 94901 23502', mandal: 'Seethammadhara', village: 'Maddilapalem', assignedVillages: ['Maddilapalem'] }
  ];
  await Official.insertMany(officials);
  console.log(`[Reset] Seeded ${officials.length} officials.`);

  // ─── 4. VILLAGES ───────────────────────────────────────────────────
  const villages = [
    { name: 'Bheemunipatnam', mandal: 'Bheemunipatnam', vroName: 'Sri P. Appa Rao', vroPhone: '+91 94901 23101' },
    { name: 'Tagarapuvalasa', mandal: 'Bheemunipatnam', vroName: 'Sri M. Srinivasa Rao', vroPhone: '+91 94901 23102' },
    { name: 'Sangivalasa', mandal: 'Bheemunipatnam', vroName: 'Smt. V. Ramanamma', vroPhone: '+91 94901 23103' },
    { name: 'Anandapuram', mandal: 'Anandapuram', vroName: 'Sri Ch. Demudu Naidu', vroPhone: '+91 94901 23201' },
    { name: 'Gambheeram', mandal: 'Anandapuram', vroName: 'Smt. S. Parvathi', vroPhone: '+91 94901 23202' },
    { name: 'Mamidilova', mandal: 'Anandapuram', vroName: 'Sri K. Trinadh', vroPhone: '+91 94901 23203' },
    { name: 'Padmanabham', mandal: 'Padmanabham', vroName: 'Sri G. Simhachalam', vroPhone: '+91 94901 23301' },
    { name: 'Nerellavalasa', mandal: 'Padmanabham', vroName: 'Smt. A. Jyothi', vroPhone: '+91 94901 23302' },
    { name: 'Korada', mandal: 'Padmanabham', vroName: 'Sri T. Eswara Rao', vroPhone: '+91 94901 23303' },
    { name: 'Madhurawada', mandal: 'Visakhapatnam Rural', vroName: 'Sri S. Ramesh Babu', vroPhone: '+91 94901 23401' },
    { name: 'Rushikonda', mandal: 'Visakhapatnam Rural', vroName: 'Smt. L. Nagamani', vroPhone: '+91 94901 23402' },
    { name: 'Venkojipalem', mandal: 'Seethammadhara', vroName: 'Sri V. Krishna Murthy', vroPhone: '+91 94901 23501' },
    { name: 'Maddilapalem', mandal: 'Seethammadhara', vroName: 'Smt. B. Padmavati', vroPhone: '+91 94901 23502' }
  ];
  await Village.insertMany(villages);
  console.log(`[Reset] Seeded ${villages.length} villages.`);

  // ─── 5. DEFAULT SETTINGS ──────────────────────────────────────────
  const settings = [
    { key: 'sla_default_days', value: 15, description: 'Default resolution timeline in days' },
    { key: 'sms_mode', value: 'simulation', description: 'SMS gateway mode' },
    { key: 'ivrs_mode', value: 'simulation', description: 'IVRS call gateway mode' },
    { key: 'pgrs_sync_mode', value: 'simulation', description: 'PGRS portal sync mode' }
  ];
  await Setting.insertMany(settings);

  console.log('[Reset] ✅ Database reset and seeded successfully!');
  console.log('[Reset] Login credentials:');
  console.log('  Super Admin : admin@bhimili.gov.in  / Admin@12345');
  console.log('  RDO         : rdo@bhimili.gov.in    / Admin@12345');
  console.log('  Tahsildar   : tahsildar.bhimili@gov.in / Admin@12345');
  console.log('  VRO         : vro.tagarapuvalasa@gov.in / Admin@12345');
  console.log('  Staff       : staff@bhimili.gov.in / Admin@12345');

  return {
    users: users.length,
    mandals: mandals.length,
    officials: officials.length,
    villages: villages.length
  };
}

// Allow running directly: node src/utils/reset-db.js
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await resetAndSeed();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Reset] Error:', err);
      process.exit(1);
    }
  })();
}

module.exports = resetAndSeed;
