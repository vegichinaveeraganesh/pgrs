const mongoose = require('mongoose');

const timelineItemSchema = new mongoose.Schema({
  stage: {
    type: String,
    enum: ['RECEIVED', 'GIST_PREPARED', 'ROUTED', 'IVRS_SENT', 'IN_PROGRESS', 'ENDORSED', 'CLOSED'],
    required: true
  },
  label: { type: String, required: true },
  note: { type: String, required: true },
  at: { type: Date, default: Date.now },
  officerName: { type: String, trim: true }
}, { _id: false });

const endorsementSchema = new mongoose.Schema({
  remarks: { type: String, required: true },
  officer_name: { type: String, required: true },
  document_url: { type: String },
  original_filename: { type: String },
  at: { type: Date, default: Date.now }
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true },
  at: { type: Date, default: Date.now }
}, { _id: false });

const grievanceSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true }, // UUID or formatted id
  pgrs_no: { type: String, unique: true, required: true, index: true },
  applicant_name: { type: String, required: true, trim: true, index: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  mandal: { type: String, required: true, trim: true, index: true },
  mandalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mandal' },
  village: { type: String, required: true, trim: true, index: true },
  villageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Village' },
  category: { type: String, required: true, trim: true, index: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  gist: { type: String },
  stage: {
    type: String,
    enum: ['RECEIVED', 'GIST_PREPARED', 'ROUTED', 'IVRS_SENT', 'IN_PROGRESS', 'ENDORSED', 'CLOSED'],
    default: 'RECEIVED',
    index: true
  },
  stage_label: { type: String, default: 'Application Received' },
  vro: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    officialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Official' }
  },
  tahsildar: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    officialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Official' }
  },
  sla_days: { type: Number, default: 15 },
  sla_deadline: { type: Date, required: true, index: true },
  sla_alert_sent: { type: Boolean, default: false },
  timeline: [timelineItemSchema],
  endorsement: endorsementSchema,
  feedback: feedbackSchema,
  created_at: { type: Date, default: Date.now, index: true },
  closed_at: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual SLA computation
grievanceSchema.virtual('sla').get(function() {
  if (this.stage === 'ENDORSED' || this.stage === 'CLOSED') {
    return {
      status: 'resolved',
      days_remaining: null,
      label: 'Resolved'
    };
  }

  const now = new Date();
  const deadline = new Date(this.sla_deadline);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdue = Math.abs(diffDays);
    return {
      status: 'beyond_sla',
      days_remaining: diffDays,
      label: `${overdue} day${overdue === 1 ? '' : 's'} overdue`
    };
  } else if (diffDays <= 3) {
    return {
      status: 'near_breach',
      days_remaining: diffDays,
      label: `${diffDays} day${diffDays === 1 ? '' : 's'} left`
    };
  } else {
    return {
      status: 'on_track',
      days_remaining: diffDays,
      label: `${diffDays} day${diffDays === 1 ? '' : 's'} left`
    };
  }
});

module.exports = mongoose.model('Grievance', grievanceSchema);
