import { StudentJourneyService } from '../services/StudentJourneyService.js';

export const StudentJourneyController = {
  async getColumns(req, res, next) {
    try {
      const columns = await StudentJourneyService.getColumns(req.user);
      res.status(200).json({ status: 'success', data: columns });
    } catch (err) {
      next(err);
    }
  },

  async getArchivedColumns(req, res, next) {
    try {
      const columns = await StudentJourneyService.getArchivedColumns(req.user);
      res.status(200).json({ status: 'success', data: columns });
    } catch (err) {
      next(err);
    }
  },

  async createColumn(req, res, next) {
    try {
      const column = await StudentJourneyService.createColumn(req.body, req.user);
      res.status(201).json({ status: 'success', message: 'Column created successfully', data: column });
    } catch (err) {
      next(err);
    }
  },

  async updateColumn(req, res, next) {
    try {
      const columnId = parseInt(req.params.id, 10);
      const column = await StudentJourneyService.updateColumn(columnId, req.body, req.user);
      res.status(200).json({ status: 'success', message: 'Column updated successfully', data: column });
    } catch (err) {
      next(err);
    }
  },

  async archiveColumn(req, res, next) {
    try {
      const columnId = parseInt(req.params.id, 10);
      const column = await StudentJourneyService.archiveColumn(columnId, req.user);
      res.status(200).json({ status: 'success', message: 'Column archived successfully', data: column });
    } catch (err) {
      next(err);
    }
  },

  async restoreColumn(req, res, next) {
    try {
      const columnId = parseInt(req.params.id, 10);
      const column = await StudentJourneyService.restoreColumn(columnId, req.user);
      res.status(200).json({ status: 'success', message: 'Column restored successfully', data: column });
    } catch (err) {
      next(err);
    }
  },

  async reorderColumns(req, res, next) {
    try {
      const result = await StudentJourneyService.reorderColumns(req.body.orderedColumnIds, req.user);
      res.status(200).json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  },

  async getRecords(req, res, next) {
    try {
      const data = await StudentJourneyService.getRecords(req.query, req.user);
      res.status(200).json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  },

  async getStudentJourney(req, res, next) {
    try {
      const clientId = parseInt(req.params.clientId, 10);
      const data = await StudentJourneyService.getStudentJourney(clientId, req.user);
      res.status(200).json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  },

  async initStudentJourney(req, res, next) {
    try {
      const clientId = parseInt(req.params.clientId, 10);
      const data = await StudentJourneyService.initStudentJourney(clientId, req.user);
      res.status(201).json({ status: 'success', message: 'Journey initialized', data });
    } catch (err) {
      next(err);
    }
  },

  async updateStudentValues(req, res, next) {
    try {
      const clientId = parseInt(req.params.clientId, 10);
      const values = req.body.values || req.body;
      const data = await StudentJourneyService.updateStudentValues(clientId, values, req.user);
      res.status(200).json({ status: 'success', message: 'Journey values saved successfully', data });
    } catch (err) {
      next(err);
    }
  },

  async exportToExcel(req, res, next) {
    try {
      const { buffer, filename } = await StudentJourneyService.exportToExcel(req.query, req.user);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      res.status(200).send(buffer);
    } catch (err) {
      next(err);
    }
  },
};
