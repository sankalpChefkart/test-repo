const awsAdmin = require('aws-sdk'); 
const path = require('path'); 
const fs = require('fs'); 
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const dataFormat = require('../../../format/data.json'); 
const errorFormat = require('../../../format/error.json'); 

// AWS S3 configuration
const s3Client = new awsAdmin.S3({
    accessKeyId: process.env.AWSAccessKeyId, 
    secretAccessKey: process.env.AWSSecretKey
}); 

const uploadParams = {
    Bucket: "", 
    Key: '', 
    Body: null
}

const downloadParams = {
    Bucket: '', 
    Key: '',
}

const bucketParams = {
    Bucket: ''
}

const deleteParams = {
    Bucket: '', 
    Key: '', 
}


function validateUploadFile(fileData) {
    const joiAbsentDetailSchema = Joi.object({
      fieldname: Joi.string().required(),
      originalname: Joi.string().required(), 
      encoding: Joi.string().required(), 
      mimetype: Joi.string().required(), 
      buffer: Joi.object({
          type: Joi.string(), 
          data: Joi.array()
      }).required(),
    }).required();
    return joiAbsentDetailSchema.validate(fileData);
  }
async function uploadFile(req, res) {
    if (!req.body.bucketName) {
        errorFormat.error = "bucketName cannot be empty";
        return res.status(422).send(errorFormat);
    } 

    // const { error } = validateUploadFile(req.file);
    // if (error) {
    //     errorFormat.error = error.details[0].message;
    //     return res.status(422).send(errorFormat);
    // }

    try{
        let uniqueID = await uuidv4(); 
        let fileName = req.file.originalname.split(' ').join('-'); 
        fileName = uniqueID + '-' + fileName; 

        uploadParams.Bucket = req.body.bucketName; 
        uploadParams.Key = fileName; 
        uploadParams.Body = req.file.buffer; 

        s3Client.upload(uploadParams, (err, data) => {
            if(err) {
                errorFormat.error = err.message; 
                return res.status(500).json(errorFormat); 
            }
            return res.json({success: true}); 
        })
    } catch(err) {
        errorFormat.error = err.message; 
        return res.send(errorFormat);
    }

}


function validateDownloadFile(fileData) {
    const joiAbsentDetailSchema = Joi.object({
      bucketName: Joi.string().required(),
      fileName: Joi.string().required(),
    }).required();
    return joiAbsentDetailSchema.validate(fileData);
  }
async function downloadFile(req, res) {
    const { error } = validateDownloadFile(req.query);
    if (error) {
        errorFormat.error = error.details[0].message;
        return res.status(422).send(errorFormat);
    }

    try{
        downloadParams.Bucket = req.query.bucketName;
        downloadParams.Key = req.query.fileName; 
        
        return s3Client.getObject(downloadParams, (err, data) => {
            if (err){
                errorFormat.error = err.message; 
                return res.status(500).json(errorFormat);
            }
            fs.writeFileSync(`./${downloadParams.Key}`, data.Body);
        
            res.download(`./${downloadParams.Key}`, function (err) {
            if (err) {
                errorFormat.error = err.message; 
                return res.status(500).json(errorFormat);
            } else {
                fs.unlink(`./${downloadParams.Key}`, function (err) {
                    if (err) {
                        console.error(err);
                    }
                    console.log('Temp File Delete');
                });
            }
            })
        });
    } catch(err) {
        errorFormat.error = err.message; 
        return res.send(errorFormat); 
    }
}


function validateDeleteFile(fileData) {
    const joiAbsentDetailSchema = Joi.object({
      bucketName: Joi.string().required(),
      fileName: Joi.string().required(),
    }).required();
    return joiAbsentDetailSchema.validate(fileData);
  }
async function deleteFile(req, res) {
    const { error } = validateDeleteFile(req.body);
    if (error) {
        errorFormat.error = error.details[0].message;
        return res.status(422).send(errorFormat);
    }

    try{
        deleteParams.Bucket = req.query.bucketName;
        deleteParams.Key = req.query.filename; 
        s3Client.deleteObject(deleteParams, (err, data) => {
            if(err) {
                errorFormat.error = err.message; 
                return res.status(500).json(errorFormat);
            }else{
                return res.send({success: true});
            }
        })
    }catch(err) {
        errorFormat.error = err.message; 
        return res.send(errorFormat); 
    }
}


function validateGetAllFiles(fileData) {
    const joiAbsentDetailSchema = Joi.object({
      bucketName: Joi.string().required()
    }).required();
    return joiAbsentDetailSchema.validate(fileData);
  }
async function getAllFiles(req, res) {
    const { error } = validateGetAllFiles(req.query);
    if (error) {
        errorFormat.error = error.details[0].message;
        return res.status(422).send(errorFormat);
    }

    try{
        bucketParams.Bucket = req.query.bucketName;
        s3Client.listObjects(bucketParams, (err, data) => {
            const fileList = data.Contents.map(ele => ele.Key)
            if(err){
                errorFormat.error = err.message; 
                return res.status(500).json(errorFormat); 
            }else{
                dataFormat.data = fileList; 
                return res.send(dataFormat); 
            }
        })
    }catch(err) {
        errorFormat.error = err.message; 
        return res.send(errorFormat); 
    }
}

module.exports = {
    uploadFile, 
    downloadFile, 
    deleteFile,
    getAllFiles,
}