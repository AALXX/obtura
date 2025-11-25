const NAMESPACE = 'TestServices';

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import logging from '../../config/logging';

/**
 * Validates and cleans the CustomRequest form
 */
const CustomRequestValidationResult = validationResult.withDefaults({
    formatter: (error) => {
        return {
            errorMsg: error.msg,
        };
    },
});

/**
 * Gets a personal user account data by User Private Token
 * @param {CustomRequest} req
 * @param {Response} res
 * @return {Response}
 */
const GetTest = async (req: Request, res: Response) => {
    const errors = CustomRequestValidationResult(req);
    if (!errors.isEmpty()) {
        errors.array().map((error) => {
            logging.error('GET-TEST', error.errorMsg);
        });

        return res.status(200).json({ error: true, errors: errors.array() });
    }

    try {
        return res.status(200).json({
            error: false,
            param: req.params,
        });
    } catch (error: any) {
        logging.error(NAMESPACE, error.message);

        res.status(202).json({
            error: true,
            errmsg: error.message,
        });
    }
};

export default {
    GetTest,
};
