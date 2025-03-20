import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';

import { ERROR_CODE } from '../config/error.config';
import { TValidationAccepted } from '../types';

export const validate = (schema: ZodSchema, validationTarget: TValidationAccepted = TValidationAccepted.BODY) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req[validationTarget]);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((issue: any) => ({
                    message: `${issue.path.join('.')} is ${issue.message}`,
                }));
                res.status(ERROR_CODE.BAD_REQUEST).json({ error: 'Invalid data', details: errorMessages });
            } else {
                res.status(ERROR_CODE.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
            }
        }
    };
}; 