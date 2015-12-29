import _ from 'lodash';
import express from 'express';

import * as config from '../config';
import { errors } from '../constants';
import { errorCheck, createError } from '../utils/error';
import { generateAccessToken, processAccessToken } from '../utils/token';
import { workoutFactory } from '../factories/workout';
import { routineFactory } from '../factories/routine';
import { liftFactory } from '../factories/lift';
import { authorize } from '../utils/auth';
import UserModel from '../schemas/user';
import WorkoutModel from '../schemas/workout';

let router = express.Router();

router.post('/', (req, res, next) => {

});

export default router;