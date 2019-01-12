const jwt = require('jsonwebtoken');
const pics = require('./pics');
const phrases = require('./phrases');

module.exports = function (options = {}) {

    const maxFails = options.maxFails || 10;
    const secret = options.secret || throwIfMissing('secret');

    function create({
        userId = '',
        expiresIn = 60,
        language = 'en',
        length = 5,
        failCount = 0
    } = {}) {
        const data = [],
            indexes = [],
            names = [],
            solution = [];
        /* istanbul ignore next */
        while (data.length < length) {
            const x = Math.floor(Math.random() * pics.length);
            if (indexes.indexOf(x) === -1) {
                indexes.push(x);
                data.push(pics[x].data);
            }
        }
        /* istanbul ignore next */
        while (solution.length < 2) {
            const y = Math.floor(Math.random() * length);
            const z = indexes[y];
            if (solution.indexOf(y) === -1) {
                solution.push(indexes.indexOf(z));
                names.push(pics[z][language]);
            }
        }

        const JSONSolution = JSON.stringify(solution);
        const key = jwt.sign({
            userId,
            expiresIn,
            language,
            length,
            failCount,
            JSONSolution
        }, secret, { expiresIn: expiresIn });
        const phrase = phrases(language, names);

        return ({ key, data, names, phrase });
    }

    function solve({
        key = throwIfMissing('key'),
        solution = throwIfMissing('solution'),
    }, callback = throwIfMissing('callback')) {
        const JSONSolution = isJSON(solution) ? solution : JSON.stringify(solution);
        jwt.verify(key, secret, function (err, decoded) {
            /* istanbul ignore if */
            if (err) {
                throw err
            }
            if (decoded.JSONSolution === JSONSolution) {
                callback(true);
            } else if (!decoded.userId || decoded.failCount < maxFails) {
                if (decoded.userId) decoded.failCount++;
                callback(false, create(decoded));
            } else {
                callback(false, null);
            }
        });
    }

    return {
        create,
        solve
    };

}

function isJSON(param) {
    try {
        JSON.parse(param);
        return true;
    } catch (e) {
        return false;
    }
}

function throwIfMissing(param) {
    throw new Error(`Missing parameter : ${param}`);
}