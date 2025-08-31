// controllers/modelController.js
const Project = require('../models/Project');
const { generate3DModel } = require('../services/modelService');

// @desc    Create a new project with image uploads
// @route   POST /api/models
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const imageData = req.files.map(file => ({
      originalName: file.originalname,
      path: file.path
    }));

    const project = await Project.create({
      userId: req.user.id,
      name: name || `Project ${Date.now()}`,
      images: imageData,
      status: 'processing'
    });

    // Start 3D model generation (async)
    generate3DModel(project._id, imageData.map(img => img.path));

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for a user
// @route   GET /api/models
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single project
// @route   GET /api/models/:id
// @access  Private
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project
// @route   DELETE /api/models/:id
// @access  Private
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    await Project.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Project removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  deleteProject
};