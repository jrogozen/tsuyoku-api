import promise from 'promise';

import { createError } from './error';
import { errors } from '../constants';
import UserModel from '../schemas/user';

let authorize = function authorize(requestId, tokenId) {
    return new promise((resolve, reject) => {
        if (typeof requestId !== 'string' || typeof tokenId !== 'string') {
            reject(createError(errors.notEnoughData));
        }

        UserModel.findOne({ _id: tokenId })
            .then((u) => {
                let admin = false;

                if (!u) {
                    reject(createError(errors.noAuthorization, 402));
                } else if (u.admin) {
                    admin = true;
                }

                if (!admin && String(requestId) !== String(tokenId)) {
                    reject(createError(errors.noAuthorization, 402));
                }

                resolve(true);
            })
            .then(null, (err) => reject(createError(errors.noAuthorization, 402)));
    });
};

export { authorize };