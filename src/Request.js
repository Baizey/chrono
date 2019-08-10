class Request {
    /**
     * @param data
     * @return {Promise<any>}
     */
    static background(data) {
        return new Promise((resolve, reject) => chrome.runtime.sendMessage(data, function (resp) {
            if (resp.meta) Utils.log('HTTP', JSON.stringify(resp.meta));
            return resp.success ? resolve(resp.data) : reject(resp.data);
        }));
    }

    /**
     * @param {string} steamId
     * @return {Promise<{price: number, review: string, reviewers: number, currency: string}>}
     */
    static steamData(steamId) {
        return new Promise(async resolve => {
            const priceRequest = Request.background({
                method: 'httpGet',
                type: 'steamPrice',
                id: steamId
            });
            const reviewRequest = Request.background({
                method: 'httpGet',
                type: 'steamReview',
                id: steamId
            });

            const review = await reviewRequest;
            const price = (await priceRequest)[steamId].data;

            const result = {
                price: 'No price',
                currency: '?',
                reviewers: -1,
                review: null
            };

            try {
                result.price = (price.price_overview.final / 100).toFixed(2);
                result.currency = price.price_overview.currency;
            } catch (e) {}
            try {
                result.review = review.query_summary.review_score_desc;
                result.reviewers = review.query_summary.total_reviews;
            } catch (e) {}

            resolve(result);
        });

        const price = Request.background({
            method: 'httpGet',
            type: 'steamPrice',
            id: steamId
        });
        const review = Request.background({
            method: 'httpGet',
            type: 'steamReview',
            id: steamId
        });

    }

    /**
     * @return {Promise<ShopGame[]>}
     */
    static coinShop() {
        return Request.background({
            method: 'httpGet',
            type: 'coinshop'
        }).then(resp => resp.map(e => new ShopGame(e)));
    }

    /**
     * @return {Promise<object>}
     */
    static daily() {
        return Request.background({
            method: 'httpGet',
            type: 'daily'
        });
    }

    /**
     * @param data
     * @return {Promise<any>}
     */
    static popup(data) {
        return new Promise((resolve, reject) => chrome.runtime.sendMessage(data, function (resp) {
            return resp.success ? resolve(resp.data) : reject(resp.data);
        })).catch(error => Utils.logError(error));
    }

    /**
     * @param data
     * @return {Promise<any>}
     */
    static tab(data) {
        return new Promise((resolve, reject) => chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, data, function (resp) {
                return resp.success ? resolve(resp.data) : reject(resp.data);
            });
        })).catch(error => Utils.logError(error));
    }
}