class DailyGame extends Loading {

    /**
     * @param {boolean} loadDailyGame
     */
    constructor(loadDailyGame) {
        super(loadDailyGame);
        if (this.isLoading) this._load().catch(error => Utils.logError(error));
    }

    async _load() {
        const data = await Request.daily();

        this.currency = data.currency;
        this.discount = data.discount;
        this.fullPrice = Number(data.normal_price);
        this.price = (data.sale_price);

        this.name = data.name;
        this.items = data.items;
        this.platforms = data.platforms.map(platform => platform === 'mac' ? 'osx' : platform).sort();

        this.ogImage = data.og_image;
        this.promoImage = data.promo_image;

        this.startDate = new Date(data.start_date);
        this.endDate = new Date(data.end_date);

        this.steamUrl = data.steam_url;
        this.uniqueUrl = data.unique_url;

        const splits = this.steamUrl.split('/');
        this.steamId = splits[splits.length - 3];

        this.steamData = await Request.steamData(this.steamId);
        this.score = {
            review: Utils.steamReviewToScore(this.steamData.review)
        };

        this.doneLoading();
    }

    /**
     * @return {string}
     */
    timeLeft() {
        return Utils.timeLeft(Date.now() - this.endDate.getTime());
    }

    asPopupHtml() {
        const id = 'dailyDeal';
        const steamOverall = !this.steamData ? '' : `<span id="plusplus-steam-steamScore" class="claimed-value" style="opacity: 1; color:${Utils.numberToColor(this.score.review)}; display:${this.steamData.review ? 'block' : 'none'}">${this.steamData.review} reviews</span>`;
        const platforms = this.platforms.map(platform => `<li class="game-os--${platform}"></li>`).join('');
        return `<li id="plusplus-game-${id}" class="gameWrapper">
    <div class="game-summary">
        <span class="game-name">${this.name}</span>
        <div id="plusplus-steam-overview-info-${id}">${steamOverall}</div>
        <div class="game-summary__footer">
            <ul class="game-os">
                ${platforms}
             </ul>
            <span class="game-price">
                ${this.price} ${this.currency}
                </span>
        </div>
    </div>
</li>`;
    }
}