import _ from 'lodash';

import { requireObject, repeater, reduceWeek, weekToMonth } from '../utils/generic';
import { liftFactory } from './lift';
import { routineFactory } from './routine';
import { createError, errorCheck } from '../utils/error';
import { errors } from '../constants';

/*
    guides are api generated prospective workouts.
    1. generate guide based off of routine options and oneRepMax
    2. user works out and generates workout details in app
    3. app sends workout details to api, which saves in db
    4. todo: user 1 rep maxes are potentially updated
*/

let calculateFiveThreeOne = function calculateFiveThreeOne(options) {
    let max = options.max;
    let accessory = options.accessory;
    let week = options.week;
    let type = options.type;

    let lifts = { sets: [] };
    let accessoryLifts = {};
    let reducedWeek = reduceWeek(week);
    let reducedMax = 0.9 * max;
    let warmupDict = [0.4, 0.5, 0.6];
    let mainDict = { // key = week, values = set coefficient
        '1': [0.65, 0.75, 0.85],
        '2': [0.70, 0.80, 0.90],
        '3': [0.75, 0.85, 0.95],
        '4': [0.40, 0.50, 0.60]
    };
    let weekToReps = function weekToReps(week, set) {
        if (week === 1) {
            return 5;
        } else if (week === 2) {
            return 3;
        } else if (week === 3) {
            if (set === 1) {
                return 5;
            } else if (set === 2) {
                return 3;
            } else if (set === 3) {
                return 1;
            }
        }

        return null;
    };
    let weekToAccessory = function weekToAccessory(week, type, reducedMax, accessory) {
        let month = weekToMonth(week);
        let typeDict = {
            'press': 'chin-up',
            'deadlift': 'hanging leg raise',
            'bench press': 'dumbbell row',
            'squat': 'leg curl'
        };
        let monthDict = {
            '1': 0.5,
            '2': 0.6,
            '3': 0.7
        };
        let accessoryLifts = {};

        if (accessory === 'boring but big') {
            if (week !== 4) {
                accessoryLifts[type] = {
                    sets: [
                        repeater(reducedMax * monthDict[month], 10),
                        repeater(reducedMax * monthDict[month], 10),
                        repeater(reducedMax * monthDict[month], 10),
                        repeater(reducedMax * monthDict[month], 10),
                        repeater(reducedMax * monthDict[month], 10)
                    ]
                };
            }

            accessoryLifts[typeDict[type]] = {
                sets: [
                    type === 'deadlift' ? repeater(0, 15) : repeater(0, 10),
                    type === 'deadlift' ? repeater(0, 15) : repeater(0, 10),
                    type === 'deadlift' ? repeater(0, 15) : repeater(0, 10),
                    type === 'deadlift' ? repeater(0, 15) : repeater(0, 10),
                    type === 'deadlift' ? repeater(0, 15) : repeater(0, 10)
                ]
            };
        }

        return accessoryLifts;
    };

    lifts.warmup = [
        repeater(reducedMax * warmupDict[0], 5),
        repeater(reducedMax * warmupDict[1], 5),
        repeater(reducedMax * warmupDict[2], 3)
    ];

    if (week !== 4) {
        lifts.sets = [
            repeater(reducedMax * mainDict[reducedWeek][0], weekToReps(reducedWeek, 1)),
            repeater(reducedMax * mainDict[reducedWeek][1], weekToReps(reducedWeek, 2)),
            repeater(reducedMax * mainDict[reducedWeek][2], weekToReps(reducedWeek, 3))
        ];
    }

    if (accessory) {
        lifts.accessoryLifts = weekToAccessory(week, type, reducedMax, accessory);
    }

    return lifts;
};

let calculateLifts = function calculateLifts(guideDetails) {
    let routine = guideDetails.routine;
    let week = routine.week;
    let maxes = guideDetails.maxes;
    let routineOptions = routine.options || {};
    let lifts = {};
    let routineBank = {
        '5/3/1': function fiveThreeOne(calcOptions) {
            return calculateFiveThreeOne(calcOptions)
        }
        // '5x5': {

        // },
        // '3x5': {

        // }
    };

    _.forEach(maxes, (max, type) => {
        let calcOptions = {
            max: max,
            accessory: routineOptions.accessory,
            week: week,
            type: type
        };
        lifts[type] = routineBank[routine.name](calcOptions);
    });


    return lifts;
};

let guideFactory = function guideFactory(guideDetails) {
    try {
        requireObject(guideDetails, ['routine', 'maxes']);
    } catch(err) {
        return err;
    }

    let guide = {
        routine: guideDetails.routine,
        lifts: calculateLifts(guideDetails)
    };

    return guide;
};

export { guideFactory }