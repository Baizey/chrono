const Browsers = {
    Firefox: 'Firefox',
    Chrome: 'Chrome',
    Edge: 'Edge'
};

let _browserInstance;

class Browser {

    static instance(dummy) {
        if (dummy) return (_browserInstance = new Browser(dummy));
        return _browserInstance ? _browserInstance : (_browserInstance = new Browser(dummy));
    }

    static updateFooter() {
        //const manifest = chrome.runtime.getManifest();
        const footer = document.getElementById('footer');
        if (footer)
            footer.innerText = footer.innerText
                .replace('{version}', Browser.extensionVersion)
                .replace('{author}', Browser.author);
    }

    static isChrome() {
        return Browser.instance().isChrome();
    }

    static isFirefox() {
        return Browser.instance().isFirefox();
    }

    static updateReviewLink() {
        const url = Browser.isChrome()
            ? 'https://chrome.google.com/webstore/detail/universal-automatic-curre/hbjagjepkeogombomfeefdmjnclgojli'
            : 'https://addons.mozilla.org/en-US/firefox/addon/ua-currency-converter/';
        chrome.tabs.create({url: url});
    }

    static get author() {
        return chrome.runtime.getManifest().author;
    }

    static get extensionVersion() {
        return chrome.runtime.getManifest().version;
    }
    /**
     * @param key
     * @return {Promise<any>}
     */
    static load(key) {
        return Browser.instance().load(key);
    }

    /**
     * @param key
     * @param value
     * @return {Promise<any>}
     */
    static save(key, value) {
        return Browser.instance().save(key, value);
    }

    constructor(dummy = null) {
        if (dummy) {
            this.type = dummy.type;
            this.access = dummy.access;
            return;
        }

        this.type = typeof chrome !== "undefined"
            ? ((typeof browser !== "undefined")
                ? Browsers.Firefox
                : Browsers.Chrome)
            : Browsers.Edge;

        this.access = this.isFirefox() ? browser : chrome;
    }

    /**
     * @return {boolean}
     */
    isFirefox() {
        return this.type === Browsers.Firefox;
    }

    /**
     * @return {boolean}
     */
    isChrome() {
        return this.type === Browsers.Chrome;
    }

    /**
     * @param {string|string[]} key
     * @return {Promise<object>}
     */
    load(key) {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(key)) key = [key];
            this.access.storage.sync.get(key, function (resp) {
                if (Utils.isUndefined(resp))
                    return reject(resp);

                Utils.log('LOAD', `From keys: ${key.join(', ')}\nGot: ${JSON.stringify(resp)}`);

                Object.keys(resp).forEach(key => {
                    try {
                        resp[key] = JSON.parse(resp[key])
                    } catch (e) {
                    }
                });
                resolve(resp);
            });
        })
    }

    /**
     * @param {string|object} key
     * @param {*} value
     */
    save(key, value) {
        const toStore = ((typeof key) === 'string') ? {[key]: value} : key;
        const self = this;
        return new Promise(resolve => {
            self.access.storage.sync.set(toStore, () => {
                Utils.log('SAVE', JSON.stringify(toStore));
                resolve();
            });
        });
    }
}