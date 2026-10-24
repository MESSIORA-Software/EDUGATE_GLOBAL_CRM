/**
 * Input validator for Student Journey columns, records, and values.
 */

export const ALLOWED_DATA_TYPES = [
  'short_text',
  'long_text',
  'date',
  'datetime',
  'number',
  'currency',
  'boolean',
  'single_select',
  'multi_select',
  'url',
  'file_ref',
];

export const ALLOWED_GROUPS = [
  'Group A — Student, Registration and University',
  'Group B — Show Money and Bank Statements',
  'Group C — University Application and Documentation',
  'Group D — Tests and Interviews',
  'Group E — University Payments and Admission',
  'Group F — Visa, Embassy and Travel',
  'Custom Tracking Columns',
];

export const StudentJourneyValidator = {
  /**
   * Validate column creation payload.
   */
  validateCreateColumn(body) {
    const errors = [];
    const { field_key, label, data_type, display_group, options, is_required } = body || {};

    if (!field_key || typeof field_key !== 'string' || !/^[a-z0-9_]{2,64}$/.test(field_key.trim())) {
      errors.push('field_key must be 2-64 characters and contain only lowercase letters, numbers, and underscores.');
    }

    if (!label || typeof label !== 'string' || label.trim().length === 0 || label.trim().length > 200) {
      errors.push('label is required and must be between 1 and 200 characters.');
    }

    if (!data_type || !ALLOWED_DATA_TYPES.includes(data_type)) {
      errors.push(`data_type must be one of: ${ALLOWED_DATA_TYPES.join(', ')}.`);
    }

    if (!display_group || typeof display_group !== 'string' || display_group.trim().length === 0) {
      errors.push('display_group is required.');
    }

    if ((data_type === 'single_select' || data_type === 'multi_select')) {
      if (!Array.isArray(options) || options.length === 0) {
        errors.push('Select fields must have at least one allowed option defined in "options".');
      }
    }

    if (errors.length > 0) {
      const err = new Error(errors.join(' '));
      err.statusCode = 400;
      throw err;
    }

    return {
      field_key: field_key.trim().toLowerCase(),
      label: label.trim(),
      data_type,
      display_group: display_group.trim(),
      options: Array.isArray(options) ? options.map(o => String(o).trim()).filter(Boolean) : [],
      is_required: Boolean(is_required),
    };
  },

  /**
   * Validate column update payload.
   */
  validateUpdateColumn(body, existingColumn) {
    const errors = [];
    const updates = {};
    const { label, display_group, display_order, is_required, is_visible, options, data_type } = body || {};

    if (label !== undefined) {
      if (typeof label !== 'string' || label.trim().length === 0 || label.trim().length > 200) {
        errors.push('label must be between 1 and 200 characters.');
      } else {
        updates.label = label.trim();
      }
    }

    if (display_group !== undefined) {
      if (typeof display_group !== 'string' || display_group.trim().length === 0) {
        errors.push('display_group cannot be empty.');
      } else {
        updates.display_group = display_group.trim();
      }
    }

    if (display_order !== undefined) {
      const order = parseInt(display_order, 10);
      if (isNaN(order)) {
        errors.push('display_order must be an integer.');
      } else {
        updates.display_order = order;
      }
    }

    if (is_required !== undefined) {
      updates.is_required = Boolean(is_required);
    }

    if (is_visible !== undefined) {
      updates.is_visible = Boolean(is_visible);
    }

    if (options !== undefined) {
      if (!Array.isArray(options)) {
        errors.push('options must be an array of strings.');
      } else {
        updates.options = options.map(o => String(o).trim()).filter(Boolean);
      }
    }

    // Safe data type conversion check:
    // Only allow type changes that do not corrupt data, e.g.
    // short_text <-> long_text, number <-> currency, date <-> datetime
    if (data_type !== undefined && data_type !== existingColumn.data_type) {
      const allowedTransitions = [
        ['short_text', 'long_text'],
        ['long_text', 'short_text'],
        ['number', 'currency'],
        ['currency', 'number'],
        ['date', 'datetime'],
        ['datetime', 'date'],
      ];

      const isAllowed = allowedTransitions.some(
        ([from, to]) => existingColumn.data_type === from && data_type === to
      );

      if (!isAllowed) {
        errors.push(`Changing data type from '${existingColumn.data_type}' to '${data_type}' is unsafe and not permitted because existing values cannot be guaranteed to convert without loss.`);
      } else {
        updates.data_type = data_type;
      }
    }

    if (errors.length > 0) {
      const err = new Error(errors.join(' '));
      err.statusCode = 400;
      throw err;
    }

    return updates;
  },

  /**
   * Validate a single dynamic field value against its column definition.
   */
  validateFieldValue(val, column) {
    const isBlank = val === undefined || val === null || val === '';

    if (column.is_required && isBlank) {
      throw new Error(`Field '${column.label}' is required and cannot be empty.`);
    }

    if (isBlank) {
      return {
        value_text: null,
        value_number: null,
        value_boolean: null,
        value_json: null,
      };
    }

    switch (column.data_type) {
      case 'short_text': {
        const str = String(val).trim();
        if (str.length > 500) {
          throw new Error(`Field '${column.label}' exceeds maximum 500 characters.`);
        }
        return { value_text: str, value_number: null, value_boolean: null, value_json: null };
      }

      case 'long_text': {
        const str = String(val).trim();
        if (str.length > 10000) {
          throw new Error(`Field '${column.label}' exceeds maximum 10000 characters.`);
        }
        return { value_text: str, value_number: null, value_boolean: null, value_json: null };
      }

      case 'date': {
        const str = String(val).trim();
        // Accepts YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) {
          throw new Error(`Field '${column.label}' must be a valid date in YYYY-MM-DD format.`);
        }
        const parsed = new Date(str);
        if (isNaN(parsed.getTime())) {
          throw new Error(`Field '${column.label}' contains an invalid calendar date.`);
        }
        return { value_text: str, value_number: null, value_boolean: null, value_json: null };
      }

      case 'datetime': {
        const str = String(val).trim();
        const parsed = new Date(str);
        if (isNaN(parsed.getTime())) {
          throw new Error(`Field '${column.label}' must be a valid date/time.`);
        }
        return { value_text: parsed.toISOString(), value_number: null, value_boolean: null, value_json: null };
      }

      case 'number':
      case 'currency': {
        const num = Number(val);
        if (isNaN(num) || !isFinite(num)) {
          throw new Error(`Field '${column.label}' must be a valid number.`);
        }
        return { value_text: null, value_number: num, value_boolean: null, value_json: null };
      }

      case 'boolean': {
        const bool = val === true || val === 'true' || val === 1 || val === '1';
        return { value_text: null, value_number: null, value_boolean: bool, value_json: null };
      }

      case 'single_select': {
        const str = String(val).trim();
        const validOptions = Array.isArray(column.options) ? column.options : [];
        if (validOptions.length > 0 && !validOptions.includes(str)) {
          throw new Error(`Invalid option '${str}' for '${column.label}'. Allowed options: ${validOptions.join(', ')}.`);
        }
        return { value_text: str, value_number: null, value_boolean: null, value_json: null };
      }

      case 'multi_select': {
        if (!Array.isArray(val)) {
          throw new Error(`Field '${column.label}' must be an array of selected options.`);
        }
        const validOptions = Array.isArray(column.options) ? column.options : [];
        for (const item of val) {
          if (validOptions.length > 0 && !validOptions.includes(item)) {
            throw new Error(`Invalid option '${item}' for '${column.label}'.`);
          }
        }
        return { value_text: null, value_number: null, value_boolean: null, value_json: val };
      }

      case 'url': {
        const str = String(val).trim();
        try {
          const parsed = new URL(str);
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            throw new Error();
          }
        } catch {
          throw new Error(`Field '${column.label}' must be a valid URL starting with http:// or https://.`);
        }
        return { value_text: str, value_number: null, value_boolean: null, value_json: null };
      }

      case 'file_ref': {
        // Can be a JSON object referencing media or an ID/name object
        if (typeof val === 'object' && val !== null) {
          return { value_text: val.original_name || val.url || null, value_number: null, value_boolean: null, value_json: val };
        }
        return { value_text: String(val).trim(), value_number: null, value_boolean: null, value_json: null };
      }

      default:
        return { value_text: String(val).trim(), value_number: null, value_boolean: null, value_json: null };
    }
  },
};
