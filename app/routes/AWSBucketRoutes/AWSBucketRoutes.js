const express = require('express');
const AWSBucketController = require('../../controller/AWSBucketController/AWSBucketController');

const router = express.Router();
router.use(express.json());


router.post(
  '/create',
  AWSBucketController.createBucket
);

router.get(
    '/listAllBuckets',
    AWSBucketController.listAllBuckets
);

router.post(
    '/delete',
    AWSBucketController.deleteBucket
);


module.exports = router;