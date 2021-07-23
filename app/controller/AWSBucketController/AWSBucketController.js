const awsAdmin = require('aws-sdk'); 
const Joi = require('joi');
const dataFormat = require('../../../format/data.json'); 
const errorFormat = require('../../../format/error.json'); 

// AWS S3 configuration
const s3Client = new awsAdmin.S3({
    accessKeyId: process.env.AWSAccessKeyId, 
    secretAccessKey: process.env.AWSSecretKey
}); 

const bucketParams = {
    Bucket: ''
}


function validateCreateBucket(fileData) {
    const joiAbsentDetailSchema = Joi.object({
      bucketName: Joi.string().required(),
    }).required();
    return joiAbsentDetailSchema.validate(fileData);
}
async function createBucket(req, res) {
    const { error } = validateCreateBucket(req.body);
    if (error) {
        errorFormat.error = error.details[0].message;
        return res.status(422).send(errorFormat);
    }

    bucketParams.Bucket = req.body.bucketName; 
    s3Client.createBucket(bucketParams, (err, data) => {
        if(err){
            errorFormat.error = err.message; 
            return res.status(500).json(errorFormat);
        }else{
            return res.send({data}); 
        }
    })

}


async function listAllBuckets(req, res) {
    s3Client.listBuckets((err, data) => {
        if(err) {
            errorFormat.error = err.message; 
            return res.status(500).json(errorFormat); 
        }else{
            dataFormat.data = data; 
            return res.send(dataFormat); 
        }
    })
    
}


function validateDeleteBucket(fileData) {
    const joiAbsentDetailSchema = Joi.object({
      bucketName: Joi.string().required(),
    }).required();
    return joiAbsentDetailSchema.validate(fileData);
}
async function deleteBucket(req, res) {
    const { error } = validateDeleteBucket(req.body);
    if (error) {
        errorFormat.error = error;
        return res.status(422).send(errorFormat);
    }

    bucketParams.Bucket = req.body.bucketName; 
    s3Client.deleteBucket(bucketParams, (err, data) => {
        if(err){
            errorFormat.error = err.message; 
            return res.status(500).json(errorFormat); 
        }else{
            return res.send({success: true}); 
        }
    })

}

module.exports = {
    createBucket, 
    listAllBuckets, 
    deleteBucket,
}