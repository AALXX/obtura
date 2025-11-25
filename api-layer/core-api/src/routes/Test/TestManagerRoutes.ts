import express from 'express';
import { param } from 'express-validator';

import TestServices from '../../Services/TestService/TestServices';

const router = express.Router();

router.get('/test-get/:testParam', param('testParam').not().isEmpty(), TestServices.GetTest);

export = router;
