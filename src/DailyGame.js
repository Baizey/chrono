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
        this.price = Number(data.sale_price);

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
        return Utils.timeLeft(Date.now() - this.endDate.getTime(), 3);
    }

    /**
     * @return {Node}
     */
    asPopupHtml() {
        const steamOverall = !this.steamData ? '' : `<span id="plusplus-steam-steamScore" class="claimed-value" style="opacity: 1; color:${Utils.numberToColor(this.score.review)}; display:${this.steamData.review ? 'block' : 'none'}">${this.steamData.review} reviews</span>`;
        const platforms = ['windows', 'linux', 'osx'].map(os => `<li class="game-os--${this.platforms.contains(os) ? os : 'none'}"></li>`).join('');
        const url = this.ogImage;

        const price = number => this.currency === 'USD' ? `$${number}` : `${number} ${this.currency}`;

        return `<li id="daily-game" class="gameWrapper">
    <div class="item__headerBG" style="background-image: url(${url});">
        <img src="${url}">
    </div>
    <hr>
    <div class="game-summary">
        <span class="game-name">${this.name}</span>
        <div style="width: 100%; min-height: 10px;">
            <div style="float: left; width:50%" id="plusplus-steam-overview-info-daily-game">${steamOverall}</div>
            <div style="float: left; width:50%; text-align: right">
                <span class="claimed-value"><span class="strikethrough">${price(this.fullPrice)}</span> ${this.discount} off</span>
            </div>
        </div>
        <div class="game-summary__footer">
            <ul class="game-os">
                ${platforms}
             </ul>
            <span class="game-price">${price(this.price)}</span>
        </div>
    </div>
</li>`.toHtmlNode();
    }
}