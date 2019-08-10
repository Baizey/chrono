class CoinShop extends Loading {

    /**
     * @param {boolean} loadGames
     */
    constructor(loadGames) {
        super(loadGames);
        if (this.isLoading) this._load(this).catch(error => Utils.logError(error));
    }

    /**
     * @return {string}
     */
    static timeLeft() {
        const start = new Date('2019-08-09T16:00:00Z').getTime();
        const now = Date.now();
        const twoWeeks = 1000 * 60 * 60 * 24 * 14;
        let at = start;
        while (at < now)
            at += twoWeeks;
        return Utils.timeLeft(at - Date.now());
    }

    /**
     * @return {Node}
     */
    static asFrontPageHtml() {
        return `<div style="width:950px">
    <div class="shop__games-header"><h2><span>Coin shop</span></h2></div>
    <div id="plusplus-coinShop-games"></div>
    ${Loading.loadingHtml('plusplus-coinShop-loading', 'Loading shop...')}
    <h3>More games in... <span id="plusplus-coinShop-timer"></span></h3>
</div>`.toHtmlNode();
    }

    async _load() {
        this.games = await Request.coinShop();
        for (let i = 0; i < this.games.length; i++)
            await this.games[i].await();
        this.doneLoading();
    }
}