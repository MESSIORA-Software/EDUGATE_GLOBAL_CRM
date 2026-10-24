import ExcelJS from 'exceljs';
import { StudentJourneyRepository, isUserAdmin } from '../repositories/StudentJourneyRepository.js';
import { StudentJourneyValidator } from '../validators/StudentJourneyValidator.js';
import { pool } from '../database/dbPool.js';

export async function assertStudentAccess(currentUser, clientId) {
  if (isUserAdmin(currentUser)) return true;

  const assignedIds = await StudentJourneyRepository.getAssignedClientIdsForStaff(currentUser.user_id);
  const isAssigned = assignedIds.map(Number).includes(Number(clientId));

  if (!isAssigned) {
    const err = new Error('Access denied: You are only permitted to access students assigned to you.');
    err.statusCode = 403;
    throw err;
  }
  return true;
}

/**
 * Sanitize cell values against CSV/Excel formula injection.
 */
function sanitizeExcelValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^[=+@-]/.test(trimmed)) {
      return `'${trimmed}`;
    }
    return trimmed;
  }
  if (typeof val === 'object') {
    if (Array.isArray(val)) return val.join(', ');
    return val.original_name || val.url || JSON.stringify(val);
  }
  return val;
}

export const StudentJourneyService = {
  /**
   * List active column definitions.
   */
  async getColumns(currentUser) {
    return await StudentJourneyRepository.getActiveColumns();
  },

  /**
   * List archived column definitions (Admin only).
   */
  async getArchivedColumns(currentUser) {
    if (!isUserAdmin(currentUser)) {
      const err = new Error('Administrator access required.');
      err.statusCode = 403;
      throw err;
    }
    return await StudentJourneyRepository.getArchivedColumns();
  },

  /**
   * Create a new configurable column (Admin only).
   */
  async createColumn(body, currentUser) {
    if (!isUserAdmin(currentUser)) {
      const err = new Error('Only administrators can configure custom columns.');
      err.statusCode = 403;
      throw err;
    }

    const validated = StudentJourneyValidator.validateCreateColumn(body);

    // Check if field_key already exists
    const existing = await StudentJourneyRepository.getColumnByKey(validated.field_key);
    if (existing) {
      const err = new Error(`A column with field key '${validated.field_key}' already exists.`);
      err.statusCode = 409;
      throw err;
    }

    const column = await StudentJourneyRepository.createColumn(validated, currentUser.user_id);

    await StudentJourneyRepository.logAudit({
      action: 'ADD_COLUMN',
      actorId: currentUser.user_id,
      details: { column_id: column.column_id, field_key: column.field_key, label: column.label },
    });

    return column;
  },

  /**
   * Update column metadata (Admin only).
   */
  async updateColumn(columnId, body, currentUser) {
    if (!isUserAdmin(currentUser)) {
      const err = new Error('Only administrators can edit columns.');
      err.statusCode = 403;
      throw err;
    }

    const existing = await StudentJourneyRepository.getColumnById(columnId);
    if (!existing) {
      const err = new Error(`Column with ID '${columnId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const validatedUpdates = StudentJourneyValidator.validateUpdateColumn(body, existing);
    const updated = await StudentJourneyRepository.updateColumn(columnId, validatedUpdates, currentUser.user_id);

    await StudentJourneyRepository.logAudit({
      action: 'UPDATE_COLUMN',
      actorId: currentUser.user_id,
      details: { column_id: columnId, updates: validatedUpdates },
    });

    return updated;
  },

  /**
   * Archive a column (Admin only).
   */
  async archiveColumn(columnId, currentUser) {
    if (!isUserAdmin(currentUser)) {
      const err = new Error('Only administrators can archive columns.');
      err.statusCode = 403;
      throw err;
    }

    const existing = await StudentJourneyRepository.getColumnById(columnId);
    if (!existing) {
      const err = new Error(`Column with ID '${columnId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const archived = await StudentJourneyRepository.archiveColumn(columnId, currentUser.user_id);

    await StudentJourneyRepository.logAudit({
      action: 'ARCHIVE_COLUMN',
      actorId: currentUser.user_id,
      details: { column_id: columnId, field_key: existing.field_key, label: existing.label },
    });

    return archived;
  },

  /**
   * Restore an archived column (Admin only).
   */
  async restoreColumn(columnId, currentUser) {
    if (!isUserAdmin(currentUser)) {
      const err = new Error('Only administrators can restore columns.');
      err.statusCode = 403;
      throw err;
    }

    const existing = await StudentJourneyRepository.getColumnById(columnId);
    if (!existing) {
      const err = new Error(`Column with ID '${columnId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const restored = await StudentJourneyRepository.restoreColumn(columnId, currentUser.user_id);

    await StudentJourneyRepository.logAudit({
      action: 'RESTORE_COLUMN',
      actorId: currentUser.user_id,
      details: { column_id: columnId, field_key: existing.field_key, label: existing.label },
    });

    return restored;
  },

  /**
   * Batch reorder columns (Admin only).
   */
  async reorderColumns(orderedColumnIds, currentUser) {
    if (!isUserAdmin(currentUser)) {
      const err = new Error('Only administrators can reorder columns.');
      err.statusCode = 403;
      throw err;
    }

    if (!Array.isArray(orderedColumnIds) || orderedColumnIds.length === 0) {
      const err = new Error('orderedColumnIds must be a non-empty array of column IDs.');
      err.statusCode = 400;
      throw err;
    }

    await StudentJourneyRepository.reorderColumns(orderedColumnIds, currentUser.user_id);
    return { success: true, message: 'Columns reordered successfully.' };
  },

  /**
   * Query records with pagination, filtering, and RBAC.
   */
  async getRecords(queryParams, currentUser) {
    return await StudentJourneyRepository.queryRecords({
      currentUser,
      page: queryParams.page,
      limit: queryParams.limit,
      search: queryParams.search,
      staffId: queryParams.staff_id,
      startDate: queryParams.start_date,
      endDate: queryParams.end_date,
      sortField: queryParams.sort_field,
      sortDirection: queryParams.sort_direction,
    });
  },

  /**
   * Retrieve a single student's journey record and values.
   */
  async getStudentJourney(clientId, currentUser) {
    await assertStudentAccess(currentUser, clientId);

    const clientRes = await pool.query(
      `SELECT c.client_id, c.name AS student_name, c.email, c.dob, c.source, c.created_at,
              staff.assigned_staff_id, staff.assigned_staff_name, staff.assigned_staff_email
       FROM public.clients c
       LEFT JOIN LATERAL (
         SELECT o.assigned_staff_id, u.name AS assigned_staff_name, u.email AS assigned_staff_email
         FROM public.opportunities o
         LEFT JOIN public.users u ON u.user_id = o.assigned_staff_id
         WHERE o.client_id = c.client_id AND o.assigned_staff_id IS NOT NULL
         ORDER BY o.updated_at DESC NULLS LAST, o.created_at DESC NULLS LAST
         LIMIT 1
       ) staff ON TRUE
       WHERE c.client_id = $1;`,
      [clientId]
    );

    if (clientRes.rows.length === 0) {
      const err = new Error(`Student with ID '${clientId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const client = clientRes.rows[0];

    // Ensure journey record exists
    const record = await StudentJourneyRepository.ensureRecordForClient(clientId, currentUser.user_id);
    const values = await StudentJourneyRepository.getValuesByRecordId(record.record_id);

    return {
      record_id: record.record_id,
      client_id: client.client_id,
      student_id: `EDU_STUDENT_${client.client_id}`,
      student_name: client.student_name,
      email: client.email,
      dob: client.dob,
      source: client.source,
      assigned_staff: client.assigned_staff_id ? {
        user_id: client.assigned_staff_id,
        name: client.assigned_staff_name || 'Staff Member',
        email: client.assigned_staff_email,
      } : null,
      values,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  },

  /**
   * Idempotently initialize a journey record for a student.
   */
  async initStudentJourney(clientId, currentUser) {
    await assertStudentAccess(currentUser, clientId);

    const clientRes = await pool.query('SELECT client_id FROM public.clients WHERE client_id = $1;', [clientId]);
    if (clientRes.rows.length === 0) {
      const err = new Error(`Student with ID '${clientId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const record = await StudentJourneyRepository.ensureRecordForClient(clientId, currentUser.user_id);

    await StudentJourneyRepository.logAudit({
      recordId: record.record_id,
      action: 'CREATE_RECORD',
      actorId: currentUser.user_id,
      details: { client_id: clientId },
    });

    return record;
  },

  /**
   * Batch update values for a student.
   */
  async updateStudentValues(clientId, valuesMap, currentUser) {
    await assertStudentAccess(currentUser, clientId);

    const record = await StudentJourneyRepository.ensureRecordForClient(clientId, currentUser.user_id);
    const columns = await StudentJourneyRepository.getActiveColumns();
    const columnsByKey = new Map(columns.map(c => [c.field_key, c]));

    const validatedItems = [];
    const auditDetails = {};

    for (const [key, rawVal] of Object.entries(valuesMap)) {
      const column = columnsByKey.get(key);
      if (!column) {
        // Check if it's archived
        const archivedRes = await pool.query(
          'SELECT column_id, label, is_archived FROM public.student_journey_columns WHERE field_key = $1;',
          [key]
        );
        if (archivedRes.rows.length > 0 && archivedRes.rows[0].is_archived) {
          const err = new Error(`Column '${archivedRes.rows[0].label}' is archived and cannot accept updates.`);
          err.statusCode = 400;
          throw err;
        }
        continue;
      }

      const parsed = StudentJourneyValidator.validateFieldValue(rawVal, column);
      validatedItems.push({
        column_id: column.column_id,
        ...parsed,
      });
      auditDetails[key] = rawVal;
    }

    if (validatedItems.length > 0) {
      await StudentJourneyRepository.upsertValues(record.record_id, validatedItems, currentUser.user_id);
      await StudentJourneyRepository.logAudit({
        recordId: record.record_id,
        action: 'UPDATE_VALUES',
        actorId: currentUser.user_id,
        details: auditDetails,
      });
    }

    const updatedValues = await StudentJourneyRepository.getValuesByRecordId(record.record_id);
    return {
      record_id: record.record_id,
      client_id: clientId,
      values: updatedValues,
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * Export student journey records to an Excel workbook.
   */
  async exportToExcel(queryParams, currentUser) {
    // Query records respecting caller's authorization and active filters
    const { records } = await StudentJourneyRepository.queryRecords({
      currentUser,
      search: queryParams.search,
      staffId: queryParams.staff_id,
      startDate: queryParams.start_date,
      endDate: queryParams.end_date,
      sortField: queryParams.sort_field,
      sortDirection: queryParams.sort_direction,
      isExport: true,
    });

    const activeColumns = await StudentJourneyRepository.getActiveColumns();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'EDUGATE GLOBAL CRM';
    workbook.lastModifiedBy = currentUser.name || 'System';
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet('Student Journey', {
      views: [{ state: 'frozen', xSplit: 3, ySplit: 1 }],
    });

    // Define Excel columns: Row #, Student ID, Student Name, Assigned Staff, then dynamic columns
    const excelColumns = [
      { header: '#', key: 'row_number', width: 8 },
      { header: 'Student ID', key: 'student_id', width: 20 },
      { header: 'Student Name', key: 'student_name', width: 25 },
      { header: 'Assigned Staff', key: 'assigned_staff', width: 22 },
      ...activeColumns.map(col => ({
        header: col.label,
        key: col.field_key,
        width: Math.max(16, Math.min(45, col.label.length + 5)),
      })),
    ];

    worksheet.columns = excelColumns;

    // Header styling
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' }, // Slate-800
      };
      cell.font = {
        name: 'Segoe UI',
        size: 10,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF334155' } },
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FF334155' } },
      };
    });

    // Populate rows
    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      const rowData = {
        row_number: i + 1,
        student_id: rec.student_id,
        student_name: rec.student_name,
        assigned_staff: rec.assigned_staff ? rec.assigned_staff.name : 'Unassigned',
      };

      for (const col of activeColumns) {
        const val = rec.values[col.field_key];
        rowData[col.field_key] = sanitizeExcelValue(val);
      }

      const row = worksheet.addRow(rowData);
      row.height = 22;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 9 };
        cell.alignment = { vertical: 'middle', horizontal: colNumber <= 2 ? 'center' : 'left' };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Student_Journey_${timestamp}.xlsx`;

    return { buffer, filename };
  },
};
