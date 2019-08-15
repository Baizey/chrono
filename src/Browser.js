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
        const footer = document.getElementById('footer');
        if (footer)
            footer.innerText = footer.innerText
                .replace('{version}', Browser.extensionVersion)
                .replace('{author}', Browser.author);
    }

    /**
     * @param {string} url
     */
    static createTab(url) {
        chrome.tabs.create({active: true, url: url});
    }

    static isChrome() {
        return Browser.instance().isChrome();
    }

    static isFirefox() {
        return Browser.instance().isFirefox();
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
     * @param {string|object} key
     * @param {string|number|boolean|undefined} value
     * @return {Promise<void>}
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
                resp.remapValues((k, v) => Utils.tryOrElse(() => JSON.parse(v), v));
                resolve(resp);
            });
        })
    }

    /**
     * @param {string|object} key
     * @param {string|number|boolean|undefined} value
     * @return {Promise<void>}
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