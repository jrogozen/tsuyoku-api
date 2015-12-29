import mongoose from 'mongoose';

import { errors } from '../constants';
import { createError } from '../utils/error';

let Schema = mongoose.Schema;

let WorkoutSchema = new Schema({
    routine: {
        name: {type: String, required: true },
        week: Number,
        options: {
            accessory: String,
            deload: Boolean
        }
    },
    lifts: [{ name: String, weight: Array }],
    accessory_lifts: [{ name: String, weight: Array }],
    created_at: Number,
    updated_at: Number,
    userId: { type: Schema.Types.ObjectId, required: true }
});

WorkoutSchema.pre('save', function preSave(next) {
    WorkoutModel.ensureIndexes(() => {
        let workout = this;
        let currentDate = Date.now();

        workout.updated_at = currentDate;

        if (!workout.created_at) {
            workout.created_at = currentDate;
        }

        return next();
    });
});

let WorkoutModel = mongoose.model('Workout', WorkoutSchema);

export default WorkoutModel;