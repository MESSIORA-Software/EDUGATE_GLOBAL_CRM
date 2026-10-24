import { pool } from '../database/dbPool.js';

export function isUserAdmin(currentUser) {
  if (!currentUser) return false;
  const roleId = String(currentUser.role_id || '').toUpperCase();
  const roleName = String(currentUser.role_name || '').toLowerCase();
  return (
    roleId === 'SUPER_ADMIN' ||
    roleId === 'ADMIN' ||
    roleId === 'EDUGATE_SUPER_ADMIN' ||
    roleId === 'EDUGATE_ADMIN' ||
    roleId.endsWith('ADMIN') ||
    roleName === 'admin' ||
    roleName === 'super admin'
  );
}

export const StudentJourneyRepository = {
  /**
   * Get all active column definitions ordered by display_order.
   */
  async getActiveColumns() {
    const query = `
      SELECT column_id, field_key, label, data_type, display_group,
             display_order, is_required, is_visible, is_archived, options,
             created_by, updated_by, created_at, updated_at
      FROM public.student_journey_columns
      WHERE is_archived = FALSE
      ORDER BY display_order ASC, column_id ASC;
    `;
    const res = await pool.query(query);
    return res.rows;
  },

  /**
   * Get all archived column definitions.
   */
  async getArchivedColumns() {
    const query = `
      SELECT column_id, field_key, label, data_type, display_group,
             display_order, is_required, is_visible, is_archived, options,
             created_by, updated_by, created_at, updated_at
      FROM public.student_journey_columns
      WHERE is_archived = TRUE
      ORDER BY display_order ASC, column_id ASC;
    `;
    const res = await pool.query(query);
    return res.rows;
  },

  /**
   * Get single column definition by column_id.
   */
  async getColumnById(columnId) {
    const query = `
      SELECT * FROM public.student_journey_columns WHERE column_id = $1;
    `;
    const res = await pool.query(query, [columnId]);
    return res.rows[0] || null;
  },

  /**
   * Get single column definition by field_key.
   */
  async getColumnByKey(fieldKey) {
    const query = `
      SELECT * FROM public.student_journey_columns WHERE field_key = $1;
    `;
    const res = await pool.query(query, [fieldKey]);
    return res.rows[0] || null;
  },

  /**
   * Create a new column definition.
   */
  async createColumn(columnData, actorId) {
    const query = `
      INSERT INTO public.student_journey_columns
        (field_key, label, data_type, display_group, display_order, options, is_required, is_visible, is_archived, created_by, updated_by)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, $9, $9)
      RETURNING *;
    `;
    const maxOrderRes = await pool.query(
      'SELECT COALESCE(MAX(display_order), 0) + 10 AS next_order FROM public.student_journey_columns;'
    );
    const displayOrder = columnData.display_order ?? maxOrderRes.rows[0].next_order;

    const res = await pool.query(query, [
      columnData.field_key,
      columnData.label,
      columnData.data_type,
      columnData.display_group,
      displayOrder,
      JSON.stringify(columnData.options || []),
      columnData.is_required || false,
      columnData.is_visible !== false,
      actorId || null,
    ]);
    return res.rows[0];
  },

  /**
   * Update column metadata.
   */
  async updateColumn(columnId, updates, actorId) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (updates.label !== undefined) {
      fields.push(`label = $${idx++}`);
      values.push(updates.label);
    }
    if (updates.display_group !== undefined) {
      fields.push(`display_group = $${idx++}`);
      values.push(updates.display_group);
    }
    if (updates.display_order !== undefined) {
      fields.push(`display_order = $${idx++}`);
      values.push(updates.display_order);
    }
    if (updates.is_required !== undefined) {
      fields.push(`is_required = $${idx++}`);
      values.push(updates.is_required);
    }
    if (updates.is_visible !== undefined) {
      fields.push(`is_visible = $${idx++}`);
      values.push(updates.is_visible);
    }
    if (updates.options !== undefined) {
      fields.push(`options = $${idx++}`);
      values.push(JSON.stringify(updates.options));
    }
    if (updates.data_type !== undefined) {
      fields.push(`data_type = $${idx++}`);
      values.push(updates.data_type);
    }

    fields.push(`updated_by = $${idx++}`);
    values.push(actorId || null);

    fields.push(`updated_at = NOW()`);

    values.push(columnId);
    const query = `
      UPDATE public.student_journey_columns
      SET ${fields.join(', ')}
      WHERE column_id = $${idx}
      RETURNING *;
    `;
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  },

  /**
   * Archive a column.
   */
  async archiveColumn(columnId, actorId) {
    const query = `
      UPDATE public.student_journey_columns
      SET is_archived = TRUE, is_visible = FALSE, updated_by = $1, updated_at = NOW()
      WHERE column_id = $2
      RETURNING *;
    `;
    const res = await pool.query(query, [actorId || null, columnId]);
    return res.rows[0] || null;
  },

  /**
   * Restore an archived column.
   */
  async restoreColumn(columnId, actorId) {
    const query = `
      UPDATE public.student_journey_columns
      SET is_archived = FALSE, is_visible = TRUE, updated_by = $1, updated_at = NOW()
      WHERE column_id = $2
      RETURNING *;
    `;
    const res = await pool.query(query, [actorId || null, columnId]);
    return res.rows[0] || null;
  },

  /**
   * Batch reorder columns.
   */
  async reorderColumns(orderedIds, actorId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < orderedIds.length; i++) {
        const order = (i + 1) * 10;
        await client.query(
          `UPDATE public.student_journey_columns 
           SET display_order = $1, updated_by = $2, updated_at = NOW() 
           WHERE column_id = $3;`,
          [order, actorId || null, orderedIds[i]]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Get or check journey record by client_id.
   */
  async getRecordByClientId(clientId) {
    const query = `
      SELECT * FROM public.student_journey_records WHERE client_id = $1;
    `;
    const res = await pool.query(query, [clientId]);
    return res.rows[0] || null;
  },

  /**
   * Ensure a student journey record exists for a client (idempotent).
   */
  async ensureRecordForClient(clientId, actorId) {
    const query = `
      INSERT INTO public.student_journey_records (client_id, created_by, updated_by)
      VALUES ($1, $2, $2)
      ON CONFLICT (client_id) DO UPDATE SET updated_at = NOW()
      RETURNING *;
    `;
    const res = await pool.query(query, [clientId, actorId || null]);
    return res.rows[0];
  },

  /**
   * Fetch all values for a single record.
   */
  async getValuesByRecordId(recordId) {
    const query = `
      SELECT v.value_id, v.record_id, v.column_id, c.field_key, c.data_type, c.label,
             v.value_text, v.value_number, v.value_boolean, v.value_json, v.updated_at
      FROM public.student_journey_values v
      JOIN public.student_journey_columns c ON c.column_id = v.column_id
      WHERE v.record_id = $1;
    `;
    const res = await pool.query(query, [recordId]);
    const valuesMap = {};
    for (const row of res.rows) {
      valuesMap[row.field_key] = this.resolveStoredValue(row);
    }
    return valuesMap;
  },

  /**
   * Batch fetch values for multiple record IDs.
   */
  async getValuesByRecordIds(recordIds) {
    if (!recordIds || recordIds.length === 0) return {};
    const query = `
      SELECT v.value_id, v.record_id, v.column_id, c.field_key, c.data_type, c.label,
             v.value_text, v.value_number, v.value_boolean, v.value_json, v.updated_at
      FROM public.student_journey_values v
      JOIN public.student_journey_columns c ON c.column_id = v.column_id
      WHERE v.record_id = ANY($1::int[]);
    `;
    const res = await pool.query(query, [recordIds]);
    const result = {};
    for (const row of res.rows) {
      if (!result[row.record_id]) {
        result[row.record_id] = {};
      }
      result[row.record_id][row.field_key] = this.resolveStoredValue(row);
    }
    return result;
  },

  /**
   * Helper to format a stored value by its column data type.
   */
  resolveStoredValue(row) {
    switch (row.data_type) {
      case 'boolean':
        return row.value_boolean;
      case 'number':
      case 'currency':
        return row.value_number !== null ? Number(row.value_number) : null;
      case 'multi_select':
      case 'file_ref':
        return row.value_json !== null ? row.value_json : null;
      default:
        return row.value_text !== null ? row.value_text : '';
    }
  },

  /**
   * Upsert a batch of field values for a journey record.
   */
  async upsertValues(recordId, validatedValues, actorId) {
    // validatedValues: array of { column_id, value_text, value_number, value_boolean, value_json }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO public.student_journey_values 
          (record_id, column_id, value_text, value_number, value_boolean, value_json, updated_by, updated_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (record_id, column_id) DO UPDATE SET
          value_text = EXCLUDED.value_text,
          value_number = EXCLUDED.value_number,
          value_boolean = EXCLUDED.value_boolean,
          value_json = EXCLUDED.value_json,
          updated_by = EXCLUDED.updated_by,
          updated_at = NOW();
      `;

      for (const item of validatedValues) {
        await client.query(query, [
          recordId,
          item.column_id,
          item.value_text,
          item.value_number,
          item.value_boolean,
          item.value_json ? JSON.stringify(item.value_json) : null,
          actorId || null,
        ]);
      }

      await client.query(
        'UPDATE public.student_journey_records SET updated_by = $1, updated_at = NOW() WHERE record_id = $2;',
        [actorId || null, recordId]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Get assigned client IDs for a staff user.
   */
  async getAssignedClientIdsForStaff(userId) {
    const query = `
      SELECT DISTINCT client_id FROM (
        SELECT client_id FROM public.opportunities WHERE assigned_staff_id = $1
        UNION
        SELECT client_id FROM public.conversations WHERE assigned_staff_id = $1
      ) assigned
      WHERE client_id IS NOT NULL;
    `;
    const res = await pool.query(query, [userId]);
    return res.rows.map(r => Number(r.client_id));
  },

  /**
   * Query student journey records with server-side pagination, search, filters, and sorting.
   */
  async queryRecords({
    currentUser,
    page = 1,
    limit = 25,
    search = '',
    staffId = null,
    startDate = null,
    endDate = null,
    sortField = 'client_id',
    sortDirection = 'DESC',
    isExport = false,
  }) {
    const isAdmin = isUserAdmin(currentUser);
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = isExport ? 5000 : Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const offset = (safePage - 1) * safeLimit;

    const whereConditions = [];
    const queryParams = [];
    let paramIdx = 1;

    // RBAC: Staff sees only assigned clients
    if (!isAdmin) {
      const assignedIds = await this.getAssignedClientIdsForStaff(currentUser.user_id);
      if (assignedIds.length === 0) {
        return { records: [], total: 0, page: safePage, limit: safeLimit };
      }
      whereConditions.push(`c.client_id = ANY($${paramIdx++}::int[])`);
      queryParams.push(assignedIds);
    } else if (staffId) {
      // Admin filtering by a specific staff member
      const staffClientIds = await this.getAssignedClientIdsForStaff(staffId);
      if (staffClientIds.length === 0) {
        return { records: [], total: 0, page: safePage, limit: safeLimit };
      }
      whereConditions.push(`c.client_id = ANY($${paramIdx++}::int[])`);
      queryParams.push(staffClientIds);
    }

    // Search by student name or student ID
    if (search && search.trim().length > 0) {
      const term = search.trim();
      const numMatch = term.replace(/^EDU_STUDENT_/i, '').trim();
      const isNum = /^\d+$/.test(numMatch);

      if (isNum) {
        whereConditions.push(`(c.client_id = $${paramIdx++} OR c.name ILIKE $${paramIdx++})`);
        queryParams.push(parseInt(numMatch, 10));
        queryParams.push(`%${term}%`);
      } else {
        whereConditions.push(`c.name ILIKE $${paramIdx++}`);
        queryParams.push(`%${term}%`);
      }
    }

    // Date range filter on clients.created_at
    if (startDate) {
      whereConditions.push(`c.created_at >= $${paramIdx++}`);
      queryParams.push(startDate);
    }
    if (endDate) {
      whereConditions.push(`c.created_at <= $${paramIdx++}`);
      queryParams.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count query
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM public.clients c
      ${whereClause};
    `;
    const countRes = await pool.query(countQuery, queryParams);
    const total = parseInt(countRes.rows[0].total, 10);

    if (total === 0) {
      return { records: [], total: 0, page: safePage, limit: safeLimit };
    }

    // Direction and sort field validation
    const validDir = String(sortDirection).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    let orderColumn = 'c.client_id';
    if (sortField === 'student_name' || sortField === 'name') orderColumn = 'c.name';
    if (sortField === 'created_at') orderColumn = 'c.created_at';

    // Main query
    const recordsQuery = `
      SELECT 
        c.client_id,
        c.name AS student_name,
        c.email,
        c.dob,
        c.source,
        c.created_at AS client_created_at,
        jr.record_id,
        jr.created_at AS journey_created_at,
        jr.updated_at AS journey_updated_at,
        staff.assigned_staff_id,
        staff.assigned_staff_name,
        staff.assigned_staff_email
      FROM public.clients c
      LEFT JOIN public.student_journey_records jr ON jr.client_id = c.client_id
      LEFT JOIN LATERAL (
        SELECT o.assigned_staff_id, u.name AS assigned_staff_name, u.email AS assigned_staff_email
        FROM public.opportunities o
        LEFT JOIN public.users u ON u.user_id = o.assigned_staff_id
        WHERE o.client_id = c.client_id AND o.assigned_staff_id IS NOT NULL
        ORDER BY o.updated_at DESC NULLS LAST, o.created_at DESC NULLS LAST
        LIMIT 1
      ) staff ON TRUE
      ${whereClause}
      ORDER BY ${orderColumn} ${validDir}
      LIMIT $${paramIdx++} OFFSET $${paramIdx++};
    `;

    queryParams.push(safeLimit, offset);
    const recordsRes = await pool.query(recordsQuery, queryParams);
    const clients = recordsRes.rows;

    // Auto-create / collect record_ids
    const recordIds = [];
    for (const row of clients) {
      if (row.record_id) {
        recordIds.push(row.record_id);
      }
    }

    // Fetch batch values for these records
    const valuesMap = await this.getValuesByRecordIds(recordIds);

    const enrichedRecords = clients.map((c, index) => {
      const recId = c.record_id;
      return {
        row_number: offset + index + 1,
        client_id: c.client_id,
        student_id: `EDU_STUDENT_${c.client_id}`,
        student_name: c.student_name,
        email: c.email,
        dob: c.dob,
        source: c.source,
        record_id: recId || null,
        assigned_staff: c.assigned_staff_id ? {
          user_id: c.assigned_staff_id,
          name: c.assigned_staff_name || 'Staff Member',
          email: c.assigned_staff_email,
        } : null,
        values: (recId && valuesMap[recId]) ? valuesMap[recId] : {},
        created_at: c.journey_created_at || c.client_created_at,
        updated_at: c.journey_updated_at || c.client_created_at,
      };
    });

    return {
      records: enrichedRecords,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  },

  /**
   * Log an audit action.
   */
  async logAudit({ recordId, action, actorId, details }) {
    try {
      const query = `
        INSERT INTO public.student_journey_audit_logs (record_id, action, actor_id, details, created_at)
        VALUES ($1, $2, $3, $4, NOW());
      `;
      await pool.query(query, [recordId || null, action, actorId || null, JSON.stringify(details || {})]);
    } catch (err) {
      console.warn('[StudentJourneyRepository] Failed to write audit log:', err.message);
    }
  },
};
