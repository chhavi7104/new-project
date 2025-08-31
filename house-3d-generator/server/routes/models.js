// routes/models.js
const express = require('express');
const router = express.Router();
const { 
  createProject, 
  getProjects, 
  getProject, 
  deleteProject 
} = require('../controllers/modelController');
const { protect } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(upload.array('images', 10), handleUploadError, createProject);

router.route('/:id')
  .get(getProject)
  .delete(deleteProject);

module.exports = router;