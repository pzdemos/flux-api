import mongoose, { Schema, models } from 'mongoose';

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  collection: 'api_projects',
});

export default models.ApiProject || mongoose.model('ApiProject', ProjectSchema);
