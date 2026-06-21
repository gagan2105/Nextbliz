import { ApiError } from './apiError.js';

export function createCrudController(Model, options = {}) {
  const { beforeCreate, beforeUpdate, filter } = options;

  return {
    list: async (req, res) => {
      const query = filter ? filter(req) : {};
      const items = await Model.find(query).sort({ createdAt: -1 });
      res.json({ success: true, data: items });
    },
    getOne: async (req, res) => {
      const item = await Model.findById(req.params.id);
      if (!item) throw new ApiError(404, 'Resource not found');
      res.json({ success: true, data: item });
    },
    create: async (req, res) => {
      const body = beforeCreate ? await beforeCreate(req) : req.body;
      const item = await Model.create(body);
      res.status(201).json({ success: true, data: item });
    },
    update: async (req, res) => {
      const body = beforeUpdate ? await beforeUpdate(req) : req.body;
      const item = await Model.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
      if (!item) throw new ApiError(404, 'Resource not found');
      res.json({ success: true, data: item });
    },
    remove: async (req, res) => {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) throw new ApiError(404, 'Resource not found');
      res.json({ success: true, message: 'Deleted successfully' });
    },
  };
}
