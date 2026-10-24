import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

import { getSanitizedDatabaseUrl } from '../dbPool.js';

export const INITIAL_COLUMNS = [
  // Group A — Student, Registration and University
  {
    field_key: 'reg_date',
    label: 'Registration Date',
    data_type: 'date',
    display_group: 'Group A — Student, Registration and University',
    display_order: 10,
    options: [],
  },
  {
    field_key: 'university',
    label: 'University',
    data_type: 'short_text',
    display_group: 'Group A — Student, Registration and University',
    display_order: 20,
    options: [],
  },
  {
    field_key: 'university_deadline',
    label: 'University Deadline',
    data_type: 'date',
    display_group: 'Group A — Student, Registration and University',
    display_order: 30,
    options: [],
  },
  {
    field_key: 'intake_details',
    label: 'Intake Details',
    data_type: 'short_text',
    display_group: 'Group A — Student, Registration and University',
    display_order: 40,
    options: [],
  },
  {
    field_key: 'visa_type',
    label: 'Visa Type',
    data_type: 'single_select',
    display_group: 'Group A — Student, Registration and University',
    display_order: 50,
    options: ['Student Visa (D-2)', 'Language Trainee (D-4)', 'General Trainee (D-4-1)', 'Job Seeking (D-10)', 'Other'],
  },
  {
    field_key: 'handover_consultant',
    label: 'Handover Consultant',
    data_type: 'short_text',
    display_group: 'Group A — Student, Registration and University',
    display_order: 60,
    options: [],
  },
  {
    field_key: 'document_consultant',
    label: 'Document Consultant',
    data_type: 'short_text',
    display_group: 'Group A — Student, Registration and University',
    display_order: 70,
    options: [],
  },
  {
    field_key: 'payment_method',
    label: 'Payment Method',
    data_type: 'single_select',
    display_group: 'Group A — Student, Registration and University',
    display_order: 80,
    options: ['Bank Transfer', 'Cash', 'Credit / Debit Card', 'Online Portal', 'Other'],
  },
  {
    field_key: 'payment_proof_link',
    label: 'Payment Proof Link',
    data_type: 'url',
    display_group: 'Group A — Student, Registration and University',
    display_order: 90,
    options: [],
  },
  {
    field_key: 'group_created_and_added',
    label: 'Group Created & Added to Community',
    data_type: 'single_select',
    display_group: 'Group A — Student, Registration and University',
    display_order: 100,
    options: ['Pending', 'Completed', 'In Progress', 'N/A'],
  },
  {
    field_key: 'agreement_sign_date',
    label: 'Agreement Sign Date',
    data_type: 'date',
    display_group: 'Group A — Student, Registration and University',
    display_order: 110,
    options: [],
  },
  {
    field_key: 'documents_consultation_date',
    label: 'Documents Consultation Date',
    data_type: 'date',
    display_group: 'Group A — Student, Registration and University',
    display_order: 120,
    options: [],
  },
  {
    field_key: 'student_qualification',
    label: "Student's Qualification",
    data_type: 'short_text',
    display_group: 'Group A — Student, Registration and University',
    display_order: 130,
    options: [],
  },
  {
    field_key: 'student_latest_update',
    label: "Student's Latest Update (Monday, Wednesday, Saturday)",
    data_type: 'long_text',
    display_group: 'Group A — Student, Registration and University',
    display_order: 140,
    options: [],
  },
  {
    field_key: 'foreign_ministry_res_date',
    label: 'Foreign Ministry Reservation Date (For Documents)',
    data_type: 'date',
    display_group: 'Group A — Student, Registration and University',
    display_order: 150,
    options: [],
  },
  {
    field_key: 'korean_embassy_res_date_docs',
    label: 'Korean Embassy Reservation Date (For Documents)',
    data_type: 'date',
    display_group: 'Group A — Student, Registration and University',
    display_order: 160,
    options: [],
  },
  {
    field_key: 'source_of_fund_docs',
    label: 'Source Of Fund Documents',
    data_type: 'single_select',
    display_group: 'Group A — Student, Registration and University',
    display_order: 170,
    options: ['Not Started', 'Pending', 'Received', 'Under Review', 'Verified', 'Rejected'],
  },
  {
    field_key: 'show_money_company_name',
    label: 'Show Money Company Name',
    data_type: 'short_text',
    display_group: 'Group A — Student, Registration and University',
    display_order: 180,
    options: [],
  },

  // Group B — Show Money and Bank Statements
  {
    field_key: 'show_money_start_date_student',
    label: 'Show Money Start Date-Student',
    data_type: 'date',
    display_group: 'Group B — Show Money and Bank Statements',
    display_order: 190,
    options: [],
  },
  {
    field_key: 'show_money_start_date_sponsor',
    label: 'Show Money Start Date-Sponsor',
    data_type: 'date',
    display_group: 'Group B — Show Money and Bank Statements',
    display_order: 200,
    options: [],
  },
  {
    field_key: 'show_money_completion_date',
    label: 'Show Money Completion Date',
    data_type: 'date',
    display_group: 'Group B — Show Money and Bank Statements',
    display_order: 210,
    options: [],
  },
  {
    field_key: 'bank_statement_status_at_month_1st',
    label: 'Bank Statement Status (At Month 1st)',
    data_type: 'single_select',
    display_group: 'Group B — Show Money and Bank Statements',
    display_order: 220,
    options: ['Pending', 'Requested', 'Received', 'Verified', 'Discrepancy Found'],
  },
  {
    field_key: 'bank_statement_status_1st_month',
    label: 'Bank Statement Status (1st Month)',
    data_type: 'single_select',
    display_group: 'Group B — Show Money and Bank Statements',
    display_order: 230,
    options: ['Pending', 'Requested', 'Received', 'Verified', 'Discrepancy Found'],
  },
  {
    field_key: 'bank_statement_status_2nd_month',
    label: 'Bank Statement Status (2nd Month)',
    data_type: 'single_select',
    display_group: 'Group B — Show Money and Bank Statements',
    display_order: 240,
    options: ['Pending', 'Requested', 'Received', 'Verified', 'Discrepancy Found'],
  },
  {
    field_key: 'bank_statement_status_3rd_month',
    label: 'Bank Statement Status (3rd Month)',
    data_type: 'single_select',
    display_group: 'Group B — Show Money and Bank Statements',
    display_order: 250,
    options: ['Pending', 'Requested', 'Received', 'Verified', 'Discrepancy Found'],
  },

  // Group C — University Application and Documentation
  {
    field_key: 'uni_app_fee_paid_date',
    label: 'University Application Fee Paid Date',
    data_type: 'date',
    display_group: 'Group C — University Application and Documentation',
    display_order: 260,
    options: [],
  },
  {
    field_key: 'uni_app_fee_payment_proof_link',
    label: 'University Application Fee - Payment Proof Link',
    data_type: 'url',
    display_group: 'Group C — University Application and Documentation',
    display_order: 270,
    options: [],
  },
  {
    field_key: 'uni_application_form',
    label: 'University Application Form',
    data_type: 'single_select',
    display_group: 'Group C — University Application and Documentation',
    display_order: 280,
    options: ['Not Started', 'Drafted', 'Student Review', 'Completed', 'Submitted'],
  },
  {
    field_key: 'sop',
    label: 'SOP',
    data_type: 'single_select',
    display_group: 'Group C — University Application and Documentation',
    display_order: 290,
    options: ['Not Started', 'First Draft', 'Revision 1', 'Revision 2', 'Approved', 'Finalized'],
  },
  {
    field_key: 'uni_docs_checking_scan_pdf',
    label: 'University Documents Checking & Scan PDF',
    data_type: 'single_select',
    display_group: 'Group C — University Application and Documentation',
    display_order: 300,
    options: ['Pending', 'In Progress', 'Completed', 'Needs Re-scan'],
  },
  {
    field_key: 'bank_balance_expired_date',
    label: 'Bank Balance Expired Date',
    data_type: 'date',
    display_group: 'Group C — University Application and Documentation',
    display_order: 310,
    options: [],
  },
  {
    field_key: 'korean_embassy_expired_date',
    label: 'Korean Embassy Expired Date',
    data_type: 'date',
    display_group: 'Group C — University Application and Documentation',
    display_order: 320,
    options: [],
  },
  {
    field_key: 'uni_docs_zip_file_single_pdf',
    label: 'University Documents Zip File / Single PDF',
    data_type: 'file_ref',
    display_group: 'Group C — University Application and Documentation',
    display_order: 330,
    options: [],
  },
  {
    field_key: 'uni_physical_docs_status',
    label: 'University Physical Documents Status',
    data_type: 'single_select',
    display_group: 'Group C — University Application and Documentation',
    display_order: 340,
    options: ['Not Sent', 'Dispatched', 'In Transit', 'Delivered to University', 'Verified by Uni'],
  },
  {
    field_key: 'dhl_date',
    label: 'DHL Date',
    data_type: 'date',
    display_group: 'Group C — University Application and Documentation',
    display_order: 350,
    options: [],
  },

  // Group D — Tests and Interviews
  {
    field_key: 'ielts_topik_status',
    label: 'IELTS / Topik Status',
    data_type: 'single_select',
    display_group: 'Group D — Tests and Interviews',
    display_order: 360,
    options: ['Not Required', 'Preparing', 'Exam Booked', 'Passed', 'Failed', 'Scores Received'],
  },
  {
    field_key: 'uni_interview_date',
    label: 'University Interview Date',
    data_type: 'datetime',
    display_group: 'Group D — Tests and Interviews',
    display_order: 370,
    options: [],
  },
  {
    field_key: 'uni_interview_results',
    label: 'University Interview Results',
    data_type: 'single_select',
    display_group: 'Group D — Tests and Interviews',
    display_order: 380,
    options: ['Pending', 'Passed', 'Conditional Pass', 'Failed', 'Rescheduled'],
  },

  // Group E — University Payments and Admission
  {
    field_key: 'uni_invoice',
    label: 'University Invoice',
    data_type: 'file_ref',
    display_group: 'Group E — University Payments and Admission',
    display_order: 390,
    options: [],
  },
  {
    field_key: 'uni_payment_status',
    label: 'University Payment Status',
    data_type: 'single_select',
    display_group: 'Group E — University Payments and Admission',
    display_order: 400,
    options: ['Pending Invoice', 'Invoice Received', 'Payment Processing', 'Paid', 'Receipt Verified'],
  },
  {
    field_key: 'uni_admission_status',
    label: 'University Admission Status',
    data_type: 'single_select',
    display_group: 'Group E — University Payments and Admission',
    display_order: 410,
    options: ['Applied', 'Interviewing', 'Accepted', 'Conditional Offer', 'Offer Letter Issued', 'Enrolled', 'Rejected'],
  },

  // Group F — Visa, Embassy and Travel
  {
    field_key: 'visa_docs_consultation',
    label: 'Visa Documents Consultation',
    data_type: 'single_select',
    display_group: 'Group F — Visa, Embassy and Travel',
    display_order: 420,
    options: ['Not Started', 'Scheduled', 'In Progress', 'Completed'],
  },
  {
    field_key: 'sop_visa',
    label: 'SOP Visa',
    data_type: 'single_select',
    display_group: 'Group F — Visa, Embassy and Travel',
    display_order: 430,
    options: ['Not Started', 'Drafted', 'Reviewing', 'Approved'],
  },
  {
    field_key: 'visa_docs_checking_scan_pdf',
    label: 'Visa Documents Checking & Scan PDF',
    data_type: 'single_select',
    display_group: 'Group F — Visa, Embassy and Travel',
    display_order: 440,
    options: ['Pending', 'In Progress', 'Verified', 'Issue Found'],
  },
  {
    field_key: 'korean_embassy_appointment_date',
    label: 'Korean Embassy Appointment Date',
    data_type: 'datetime',
    display_group: 'Group F — Visa, Embassy and Travel',
    display_order: 450,
    options: [],
  },
  {
    field_key: 'visa_submission_date',
    label: 'Visa Submission Date',
    data_type: 'date',
    display_group: 'Group F — Visa, Embassy and Travel',
    display_order: 460,
    options: [],
  },
  {
    field_key: 'visa_status_date',
    label: 'Visa Status Date',
    data_type: 'date',
    display_group: 'Group F — Visa, Embassy and Travel',
    display_order: 470,
    options: [],
  },
  {
    field_key: 'visa_status',
    label: 'Visa Status',
    data_type: 'single_select',
    display_group: 'Group F — Visa, Embassy and Travel',
    display_order: 480,
    options: ['Pending Submission', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Appeal Submitted'],
  },
  {
    field_key: 'after_visa_docs',
    label: 'After Visa Documents',
    data_type: 'single_select',
    display_group: 'Group F — Visa, Embassy and Travel',
    display_order: 490,
    options: ['Pending', 'In Progress', 'Completed'],
  },
  {
    field_key: 'final_invoice',
    label: 'Final Invoice',
    data_type: 'file_ref',
    display_group: 'Group F — Visa, Embassy and Travel',
    display_order: 500,
    options: [],
  },
  {
    field_key: 'full_payment_date',
    label: 'Full Payment Date',
    data_type: 'date',
    display_group: 'Group F — Visa, Embassy and Travel',
    display_order: 510,
    options: [],
  },
  {
    field_key: 'full_payment_status',
    label: 'Full Payment Status',
    data_type: 'single_select',
    display_group: 'Group F — Visa, Embassy and Travel',
    display_order: 520,
    options: ['Pending', 'Partial Payment', 'Paid in Full', 'Receipt Verified'],
  },
  {
    field_key: 'air_ticket',
    label: 'Air Ticket',
    data_type: 'single_select',
    display_group: 'Group F — Visa, Embassy and Travel',
    display_order: 530,
    options: ['Not Booked', 'Searching Flights', 'Booked', 'Ticket Issued', 'Travel Completed'],
  },
];

export async function runMigration() {
  const client = new pg.Client({ connectionString: getSanitizedDatabaseUrl(process.env.DATABASE_URL) });

  try {
    await client.connect();
    console.log('[Migration] Connected to PostgreSQL database.');

    await client.query('BEGIN');

    // 1. Column definitions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.student_journey_columns (
        column_id SERIAL PRIMARY KEY,
        field_key VARCHAR(100) UNIQUE NOT NULL,
        label VARCHAR(255) NOT NULL,
        data_type VARCHAR(50) NOT NULL,
        display_group VARCHAR(100) NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        is_required BOOLEAN NOT NULL DEFAULT FALSE,
        is_visible BOOLEAN NOT NULL DEFAULT TRUE,
        is_archived BOOLEAN NOT NULL DEFAULT FALSE,
        options JSONB DEFAULT '[]'::jsonb,
        created_by BIGINT REFERENCES public.users(user_id) ON DELETE SET NULL,
        updated_by BIGINT REFERENCES public.users(user_id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Journey records table (1:1 with clients/students)
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.student_journey_records (
        record_id SERIAL PRIMARY KEY,
        client_id INT UNIQUE NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
        created_by BIGINT REFERENCES public.users(user_id) ON DELETE SET NULL,
        updated_by BIGINT REFERENCES public.users(user_id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Dynamic values table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.student_journey_values (
        value_id SERIAL PRIMARY KEY,
        record_id INT NOT NULL REFERENCES public.student_journey_records(record_id) ON DELETE CASCADE,
        column_id INT NOT NULL REFERENCES public.student_journey_columns(column_id) ON DELETE CASCADE,
        value_text TEXT,
        value_number NUMERIC(15,2),
        value_boolean BOOLEAN,
        value_json JSONB,
        updated_by BIGINT REFERENCES public.users(user_id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT uq_journey_record_column UNIQUE (record_id, column_id)
      );
    `);

    // 4. Audit logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.student_journey_audit_logs (
        log_id SERIAL PRIMARY KEY,
        record_id INT REFERENCES public.student_journey_records(record_id) ON DELETE SET NULL,
        action VARCHAR(50) NOT NULL,
        actor_id BIGINT REFERENCES public.users(user_id) ON DELETE SET NULL,
        details JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 5. Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_journey_rec_client ON public.student_journey_records(client_id);
      CREATE INDEX IF NOT EXISTS idx_journey_val_rec_col ON public.student_journey_values(record_id, column_id);
      CREATE INDEX IF NOT EXISTS idx_journey_val_col ON public.student_journey_values(column_id);
      CREATE INDEX IF NOT EXISTS idx_journey_col_order ON public.student_journey_columns(display_order, is_archived);
      CREATE INDEX IF NOT EXISTS idx_journey_col_key ON public.student_journey_columns(field_key);
      CREATE INDEX IF NOT EXISTS idx_journey_audit_rec ON public.student_journey_audit_logs(record_id);
    `);

    // 6. Seed initial 53 columns if not already present
    for (const col of INITIAL_COLUMNS) {
      await client.query(`
        INSERT INTO public.student_journey_columns 
          (field_key, label, data_type, display_group, display_order, options, is_required, is_visible, is_archived)
        VALUES 
          ($1, $2, $3, $4, $5, $6, FALSE, TRUE, FALSE)
        ON CONFLICT (field_key) DO NOTHING;
      `, [
        col.field_key,
        col.label,
        col.data_type,
        col.display_group,
        col.display_order,
        JSON.stringify(col.options),
      ]);
    }

    await client.query('COMMIT');
    console.log('[Migration] Student Journey tables, indexes, and initial 53 columns verified successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Migration] Failed to run student journey migration:', err);
    throw err;
  } finally {
    await client.end();
  }
}

// Allow direct CLI execution: node src/database/migrations/createStudentJourneyTables.js
if (process.argv[1]?.endsWith('createStudentJourneyTables.js')) {
  runMigration().then(() => process.exit(0)).catch(() => process.exit(1));
}
