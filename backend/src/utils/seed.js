const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const User = require('../models/User');
const Mandal = require('../models/Mandal');
const Village = require('../models/Village');
const Official = require('../models/Official');
const Grievance = require('../models/Grievance');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');
const { connectDB, disconnectDB } = require('../config/database');

async function seedData() {
  console.log('[Seed] Starting database population...');

  // 1. Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Mandal.deleteMany({}),
    Village.deleteMany({}),
    Official.deleteMany({}),
    Grievance.deleteMany({}),
    Notification.deleteMany({}),
    Setting.deleteMany({})
  ]);

  // 2. Seed Users
  const passwordHash = await bcrypt.hash('Admin@12345', 10);
  const users = [
    {
      name: 'RDO Bhimunipatnam Administrator',
      email: 'admin@bhimili.gov.in',
      passwordHash,
      role: 'super_admin',
      designation: 'System Administrator',
      phone: '+91 94901 23000'
    },
    {
      name: 'Revenue Divisional Officer',
      email: 'rdo@bhimili.gov.in',
      passwordHash,
      role: 'rdo',
      designation: 'Revenue Divisional Officer, Bhimili',
      phone: '+91 94901 23000'
    },
    {
      name: 'Smt. K. Lakshmi Prasanna',
      email: 'tahsildar.bhimili@gov.in',
      passwordHash,
      role: 'tahsildar',
      designation: 'Tahsildar, Bheemunipatnam',
      mandal: 'Bheemunipatnam',
      phone: '+91 94901 23001'
    },
    {
      name: 'Sri M. Srinivasa Rao',
      email: 'vro.tagarapuvalasa@gov.in',
      passwordHash,
      role: 'vro',
      designation: 'Village Revenue Officer',
      mandal: 'Bheemunipatnam',
      village: 'Tagarapuvalasa',
      phone: '+91 94901 23102'
    },
    {
      name: 'PGRS Helpdesk Staff',
      email: 'staff@bhimili.gov.in',
      passwordHash,
      role: 'staff',
      designation: 'PGRS Portal Operator',
      phone: '+91 94901 23000'
    }
  ];
  await User.insertMany(users);
  console.log(`[Seed] Seeded ${users.length} users.`);

  // 3. Seed Mandals
  const mandals = [
    {
      name: 'Bheemunipatnam',
      code: 'BHM',
      tahsildarName: 'Smt. K. Lakshmi Prasanna',
      tahsildarPhone: '+91 94901 23001'
    },
    {
      name: 'Anandapuram',
      code: 'AND',
      tahsildarName: 'Sri D. Satyanarayana',
      tahsildarPhone: '+91 94901 23002'
    },
    {
      name: 'Padmanabham',
      code: 'PDM',
      tahsildarName: 'Sri B. Rama Krishna',
      tahsildarPhone: '+91 94901 23003'
    }
  ];
  await Mandal.insertMany(mandals);
  console.log(`[Seed] Seeded ${mandals.length} mandals.`);

  // 4. Seed Officials
  const officials = [
    {
      name: 'RDO Bhimunipatnam',
      role: 'RDO',
      phone: '+91 94901 23000',
      email: 'rdo@bhimili.gov.in'
    },
    {
      name: 'Smt. K. Lakshmi Prasanna',
      role: 'Tahsildar',
      phone: '+91 94901 23001',
      mandal: 'Bheemunipatnam',
      email: 'tahsildar.bhimili@gov.in'
    },
    {
      name: 'Sri D. Satyanarayana',
      role: 'Tahsildar',
      phone: '+91 94901 23002',
      mandal: 'Anandapuram',
      email: 'tahsildar.anandapuram@gov.in'
    },
    {
      name: 'Sri B. Rama Krishna',
      role: 'Tahsildar',
      phone: '+91 94901 23003',
      mandal: 'Padmanabham',
      email: 'tahsildar.padmanabham@gov.in'
    },
    // VROs for Bheemunipatnam
    {
      name: 'Sri P. Appa Rao',
      role: 'VRO',
      phone: '+91 94901 23101',
      mandal: 'Bheemunipatnam',
      village: 'Bheemunipatnam',
      assignedVillages: ['Bheemunipatnam']
    },
    {
      name: 'Sri M. Srinivasa Rao',
      role: 'VRO',
      phone: '+91 94901 23102',
      mandal: 'Bheemunipatnam',
      village: 'Tagarapuvalasa',
      assignedVillages: ['Tagarapuvalasa']
    },
    {
      name: 'Smt. V. Ramanamma',
      role: 'VRO',
      phone: '+91 94901 23103',
      mandal: 'Bheemunipatnam',
      village: 'Sangivalasa',
      assignedVillages: ['Sangivalasa']
    },
    // VROs for Anandapuram
    {
      name: 'Sri Ch. Demudu Naidu',
      role: 'VRO',
      phone: '+91 94901 23201',
      mandal: 'Anandapuram',
      village: 'Anandapuram',
      assignedVillages: ['Anandapuram']
    },
    {
      name: 'Smt. S. Parvathi',
      role: 'VRO',
      phone: '+91 94901 23202',
      mandal: 'Anandapuram',
      village: 'Gambheeram',
      assignedVillages: ['Gambheeram']
    },
    {
      name: 'Sri K. Trinadh',
      role: 'VRO',
      phone: '+91 94901 23203',
      mandal: 'Anandapuram',
      village: 'Mamidilova',
      assignedVillages: ['Mamidilova']
    },
    // VROs for Padmanabham
    {
      name: 'Sri G. Simhachalam',
      role: 'VRO',
      phone: '+91 94901 23301',
      mandal: 'Padmanabham',
      village: 'Padmanabham',
      assignedVillages: ['Padmanabham']
    },
    {
      name: 'Smt. A. Jyothi',
      role: 'VRO',
      phone: '+91 94901 23302',
      mandal: 'Padmanabham',
      village: 'Nerellavalasa',
      assignedVillages: ['Nerellavalasa']
    },
    {
      name: 'Sri T. Eswara Rao',
      role: 'VRO',
      phone: '+91 94901 23303',
      mandal: 'Padmanabham',
      village: 'Korada',
      assignedVillages: ['Korada']
    }
  ];
  await Official.insertMany(officials);
  console.log(`[Seed] Seeded ${officials.length} officials.`);

  // 5. Seed Villages
  const villages = [
    { name: 'Bheemunipatnam', mandal: 'Bheemunipatnam', vroName: 'Sri P. Appa Rao', vroPhone: '+91 94901 23101' },
    { name: 'Tagarapuvalasa', mandal: 'Bheemunipatnam', vroName: 'Sri M. Srinivasa Rao', vroPhone: '+91 94901 23102' },
    { name: 'Sangivalasa', mandal: 'Bheemunipatnam', vroName: 'Smt. V. Ramanamma', vroPhone: '+91 94901 23103' },
    { name: 'Anandapuram', mandal: 'Anandapuram', vroName: 'Sri Ch. Demudu Naidu', vroPhone: '+91 94901 23201' },
    { name: 'Gambheeram', mandal: 'Anandapuram', vroName: 'Smt. S. Parvathi', vroPhone: '+91 94901 23202' },
    { name: 'Mamidilova', mandal: 'Anandapuram', vroName: 'Sri K. Trinadh', vroPhone: '+91 94901 23203' },
    { name: 'Padmanabham', mandal: 'Padmanabham', vroName: 'Sri G. Simhachalam', vroPhone: '+91 94901 23301' },
    { name: 'Nerellavalasa', mandal: 'Padmanabham', vroName: 'Smt. A. Jyothi', vroPhone: '+91 94901 23302' },
    { name: 'Korada', mandal: 'Padmanabham', vroName: 'Sri T. Eswara Rao', vroPhone: '+91 94901 23303' }
  ];
  await Village.insertMany(villages);
  console.log(`[Seed] Seeded ${villages.length} villages.`);

  // 6. Seed Grievances
  const seedAppsPath = path.resolve(__dirname, '../../../seed_reference/applications.json');
  let sampleApps = [];
  if (fs.existsSync(seedAppsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(seedAppsPath, 'utf8'));
      sampleApps = data.applications || [];
    } catch (e) {
      console.warn('[Seed] Could not read seed_reference applications:', e.message);
    }
  }

  if (sampleApps.length > 0) {
    const formattedGrievances = sampleApps.map(a => {
      const g = { ...a };
      // Strip sla object as it's computed as a virtual
      delete g.sla;
      return g;
    });
    await Grievance.insertMany(formattedGrievances);
    console.log(`[Seed] Seeded ${formattedGrievances.length} grievances from reference dataset.`);
  }

  // 7. Seed Notifications
  const seedMsgsPath = path.resolve(__dirname, '../../../seed_reference/messages.json');
  if (fs.existsSync(seedMsgsPath)) {
    try {
      const msgs = JSON.parse(fs.readFileSync(seedMsgsPath, 'utf8'));
      if (Array.isArray(msgs) && msgs.length > 0) {
        await Notification.insertMany(msgs);
        console.log(`[Seed] Seeded ${msgs.length} notification messages.`);
      }
    } catch (e) {
      console.warn('[Seed] Could not read seed_reference messages:', e.message);
    }
  }

  // 8. Seed Default Settings
  const defaultSettings = [
    { key: 'sla_default_days', value: 15, description: 'Default resolution timeline in days' },
    { key: 'sms_mode', value: 'simulation', description: 'SMS gateway mode' },
    { key: 'ivrs_mode', value: 'simulation', description: 'IVRS call gateway mode' },
    { key: 'pgrs_sync_mode', value: 'simulation', description: 'PGRS portal sync mode' }
  ];
  await Setting.insertMany(defaultSettings);

  console.log('[Seed] Database seeding completed successfully.');
}

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedData();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    }
  })();
}

module.exports = seedData;
