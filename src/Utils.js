class Utils {

    static steamReviewToScore(review) {
        const low = review.toLowerCase();
        if (low === 'mixed')
            return 0.5;
        const pos = low.indexOf('positive') >= 0;
        const neg = low.indexOf('negative') >= 0;
        if (!neg && !pos) return NaN;
        const direction = pos ? 1 : -1;

        switch (low.split(' ')[0]) {
            // -0.5 or 1.5
            case 'overhwelmingly':
                return .5 + direction * 1;
            // -0.35 or 1.35
            case 'very':
                return .5 + direction * .85;
            //  -0.1 or 1.1
            default:
                return .5 + direction * .6;
            //  -0.25 or 1.25
            case 'mostly':
                return .5 + direction * .75;
        }

        return NaN;
    };

    static numberToColor(score) {
        if (isNaN(score) || (typeof score !== 'number'))
            return '#929396';
        if (score >= .9)
            return '#70c5da';
        if (score >= .8)
            return '#6ac2e8';
        if (score >= .7)
            return '#66C0F4';
        if (score >= .6)
            return '#B9A074';
        if (score >= .5)
            return '#B9A074';
        if (score >= .4)
            return '#BD875A';
        if (score >= 0.3)
            return '#c35c2c';
        return '#E96230';
    };

    static numberToRating(score) {
        if (isNaN(score) || (typeof score !== 'number'))
            return 'Unknown';
        if (score >= .9)
            return 'Great';
        if (score >= .8)
            return 'Good';
        if (score >= .7)
            return 'Decent';
        if (score >= .6)
            return 'Okay';
        if (score >= .5)
            return 'So-so';
        if (score >= .4)
            return 'Bad';
        if (score >= .2)
            return 'Horrible';
        return 'Shitty';
    };

    /**
     * @param {number} unixTime
     * @return {string}
     */
    static timeLeft(unixTime) {
        unixTime = Math.abs(unixTime);
        const convert = (range, unit) => range ? `${range} ${unit}${range > 1 ? 's' : ''}` : undefined;
        const days = convert(Math.floor(unixTime / (1000 * 60 * 60 * 24)), 'day');
        const hours = convert(Math.floor(unixTime / (1000 * 60 * 60)) % 24, 'hour');
        if (days) return days + (hours ? ' and ' + hours : '');
        const minutes = convert(Math.floor(unixTime / (1000 * 60)) % 60, 'minute');
        if (hours) return hours + (minutes ? ' and ' + minutes : '');
        const seconds = convert(Math.floor(unixTime / (1000)) % 60, 'second');
        if (minutes) return minutes + (seconds ? ' and ' + seconds : '');
        if (seconds) return seconds;
        return 'Yes';
    }

    /**
     * @param name
     * @return {Element|Element[]}
     */
    static getElementByClass(name) {
        const elements = document.getElementsByClassName(name);
        if (elements.length === 1)
            return elements[0];
        const result = [];
        for (let i = 0; i < elements.length; i++)
            result.push(elements[i]);
        return result;
    };

    /**
     * @param name
     * @return {Element|Element[]}
     */
    static getElements(name) {
        switch (name[0]) {
            case '.':
                return Utils.getElementByClass(name.substring(1));
            case '#':
                return document.getElementById(name.substring(1));
            default:
                return document.getElementById(name) || Utils.getElementByClass(name);
        }
    };

    /**
     * @param name
     * @return {boolean}
     */
    static elementExists(name) {
        const elements = Utils.getElements(name);
        return elements && (!Array.isArray(elements) || elements.length > 0);
    };


    /**
     * @param exception
     */
    static logError(exception) {
        Utils.log('error', JSON.stringify(exception))
    }

    /**
     * @param from
     * @param data
     */
    static log(from, data) {
        console.log(`CggE ${from}: ${data}`);
    }

    /**
     * @param {number} number
     * @return {boolean}
     */
    static isSafeNumber(number) {
        return isFinite(number) && !isNaN(number);
    }

    /**
     * @param {number|function} time
     * @param {number|undefined} funcDelay
     * @return {Promise<void>}
     */
    static wait(time = 500, funcDelay = 100) {
        return (typeof time === 'number')
            ? new Promise(resolve => setTimeout(() => resolve(), time))
            : time() ? Promise.resolve() : new Promise(async resolve => {
                while (!time()) await Utils.wait(funcDelay);
                resolve();
            });
    }

    /**
     * @param {string} html
     * @return {Node}
     */
    static parseHtml(html) {
        const t = document.createElement('template');
        t.innerHTML = html;
        return t.content.cloneNode(true);
    };

    /**
     * @param item
     * @return {boolean}
     */
    static isDefined(item) {
        return item !== null && (typeof item) !== 'undefined';
    }

    /**
     * @param item
     * @return {boolean}
     */
    static isUndefined(item) {
        return !Utils.isDefined(item);
    }

    /**
     * @param {function} func
     * @param {number} time
     * @return {*}
     */
    static delay(func, time = 1000) {
        return setTimeout(() => func(), time);
    }
}