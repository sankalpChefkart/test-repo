const express = require('express');
const AWSStorageController = require('../../controller/AWSStorageController/AWSStorageController');


const multer = require('multer'); 

const router = express.Router();
router.use(express.json());

// Multer Config
var storage = multer.memoryStorage(); 
var upload = multer({storage: storage}); 

router.post(
  '/upload',
  upload.single("file"), 
  AWSStorageController.uploadFile
);

router.get(
  '/download',
  AWSStorageController.downloadFile 
)

router.post(
  '/delete', 
  AWSStorageController.deleteFile
)

router.get(
  '/getAllFiles', 
  AWSStorageController.getAllFiles
)

module.exports = router;