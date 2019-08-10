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
    timeLeft() {
        const start = new Date('2019-08-09T16:00:00Z').getTime();
        const now = Date.now();
        const twoWeeks = 1000 * 60 * 60 * 24 * 14;
        let at = start;
        while (at < now)
            at += twoWeeks;
        return Utils.timeLeft(at - Date.now());
    }

    preLoading(id = 'game-details--featured') {
        const gameDetails = document.getElementById(id);

        const shop = Utils.parseHtml(`<div style="width:950px">
    <div class="shop__games-header">
        <h2><span>Coin shop</span></h2>
    </div>
    <div id="plusplus-coinshop-games"></div>
    <div id="plusplus-coinshop-loading" style="padding:0" class="account__loading">
        <div class="loading">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        </div>
        <p>Loading shop...</p>
    </div>
    <h3>More games in... <span id="plusplus-timer"></span></h3>
</div>`);
        const gameDetailsWrapper = document.createElement('div');
        gameDetailsWrapper.id = 'chronoplusplus-game-details--featured';
        gameDetailsWrapper.class = 'game-details--featured';
        gameDetails.parentNode.insertBefore(gameDetailsWrapper, gameDetails);
        gameDetailsWrapper.appendChild(gameDetails);
        gameDetailsWrapper.parentNode.insertBefore(shop, gameDetailsWrapper);
        document.getElementById('plusplus-timer').innerText = this.timeLeft();
    }

    postLoading() {
        const shopGamesWrapper = document.getElementById('plusplus-coinshop-games');
        const games = this.games.filter(e => e.isActive);
        if (games.length === 0) {
            shopGamesWrapper.append(Utils.parseHtml('<div class="no-games"><img src="/assets/images/no-orders-box.9620fb5c.svg"><h4>The coin coinshop  is all sold out.</h4></div>'));
        } else {
            shopGamesWrapper.append(Utils.parseHtml(`<ul id="plusplus-available-games" class="chrono-shop__games"></ul>`));
            const ul = document.getElementById('plusplus-available-games');
            games.forEach(game => game.chronoIconHtml(ul));
        }
        document.getElementById('plusplus-coinshop-loading').style.display = 'none';
    }

    async _load() {
        this.games = await Request.coinShop();
        for (let i = 0; i < this.games.length; i++)
            await this.games[i].await();
        this.doneLoading();
    }
}