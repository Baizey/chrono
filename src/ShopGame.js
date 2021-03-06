class ShopGame extends Loading {
    /**
     * @param {{
     *     active:boolean,
     *     claimed: string,
     *     created: string,
     *     description: string,
     *     hash: string,
     *     name: string,
     *     properties: Array,
     *     platforms: string[],
     *     price: number,
     *     sold_out: boolean,
     *     status: string,
     *     url: string,
     *     _id: string
     * }} data
     */
    constructor(data) {
        super(data.active && !data.sold_out && data.status === 'active');
        this.isPreview = data.status === 'preview';
        this.isActive = this.isLoading;
        this.claimed = Math.floor(data.claimed * 100);
        this.created = new Date(data.created);
        this.description = data.description;
        this.hash = data.hash;
        this.platforms = this.isPreview ? [] : data.platforms.map(platform => platform === 'mac' ? 'osx' : platform).sort();
        this.name = data.name;
        this.price = data.price;
        this.url = data.url;
        this.id = data._id;

        this.affordability = {
            calculated: false,
            days: 0,
            affordable: true
        };

        if (this.isLoading && !this.isPreview) this._load().catch(error => Utils.logError(error));
    }

    /**
     * @param {number|undefined} initialBalance
     * @returns {ShopGame}
     */
    calculateAffordability(initialBalance) {
        if (Utils.isUndefined(initialBalance))
            return this;

        const missing = this.price - initialBalance;

        if (missing <= 0) {
            this.affordability.calculated = true;
            this.affordability.affordable = true;
            return this;
        }

        // Hardcoded estimates, updated when necessary
        const cycleLength = 30; // days
        const averageCoinsPerDay = 25; // +- 5
        const averageCoinsPer3DayChest = 150; // +- 50
        const averageCoinsPer7DayChest = 350; // +- 50
        const averageCoinsPer14DayChest = 900;  // +- 100
        const averageCoinsPer30DayChest = 2250; // +- 250
        const averageCoinsPerCycle = cycleLength * averageCoinsPerDay
            + averageCoinsPer3DayChest
            + averageCoinsPer7DayChest
            + averageCoinsPer14DayChest
            + averageCoinsPer30DayChest;
        const actualAverageCoinsPerDay = averageCoinsPerCycle / cycleLength;

        const cyclesAway = Math.floor(missing / averageCoinsPerCycle);
        const remaining = missing % averageCoinsPerCycle;
        const extra = Math.ceil(remaining / actualAverageCoinsPerDay);

        this.affordability.days = cyclesAway * cycleLength + extra;
        this.affordability.affordable = false;
        this.affordability.calculated = true;
        return this;
    }

    async _load() {
        const splits = this.url.split('/');
        this.steamId = splits[splits.length - 3];
        this.steamData = await Request.steamData(this.steamId);
        const lowcaseReview = this.steamData.review.toLowerCase();

        const bestExpected = 500; // coins per $
        const worstExpected = 5000; // coins per $

        this.score = {
            price: 1 - ((this.price / this.steamData.price - bestExpected) / (worstExpected - bestExpected)),
            review: Utils.steamReviewToScore(this.steamData.review),
            overall: 0,
        };
        this.score.overall = this.score.price * this.score.review;

        if (lowcaseReview === 'mixed'
            || lowcaseReview.indexOf('negative') >= 0
            || lowcaseReview.indexOf('positive') >= 0)
            this.steamData.review += ' reviews';
        this.doneLoading();
    }

    get isInactive() {
        return !this.isActive;
    }

    /**
     * {number} initialBalance
     * @return {Node}
     */
    asPopupHtml() {
        const affordText = this.affordability.calculated && !this.affordability.affordable ?
            `~${this.affordability.days} coin clicks away`
            : '';
        const affordTextColor = Utils.numberToColor(1 - this.affordability.days / 30);
        const steamOverall = !this.steamData ? '' : `
<span class="claimed-value" style="opacity: 1; color:${Utils.numberToColor(this.score.overall)}; display:${this.steamData.review ? 'block' : 'none'}">${Utils.numberToRating(this.score.overall)} overall value</span>
<span class="claimed-value" style="opacity: 1; color:${Utils.numberToColor(this.score.review)}; display:${this.steamData.review ? 'block' : 'none'}">${this.steamData.review}</span>`;
        const platforms = ['windows', 'linux', 'osx'].map(os => `<li class="game-os--${this.platforms.contains(os) ? os : 'none'}"></li>`).join('');
        return `<li id="coinShop-game-${this.hash}" class="gameWrapper">
    <div class="item__headerBG" style="background-image: url('https://chrono.gg/assets/images/shop/${this.hash}/item-header.jpg');">
        <img src="https://chrono.gg/assets/images/shop/${this.hash}/item-header--alt.jpg">
    </div>
    <hr>
    <div class="game-summary">
        <span class="game-name">${this.name}</span>
        <div style="width: 100%; min-height: 10px;">
            <div style="float: left; width:50%;" id="plusplus-steam-overview-info-${this.hash}">${steamOverall}</div>
            <div style="float: left; width:50%; text-align: right">
                <span class="claimed-value">Steam price ${this.steamData.price} ${this.steamData.currency}</span>
                <span class="claimed-value" style="opacity: 1; color: ${affordTextColor}">${affordText}</span>
            </div>
        </div>
        <br>
        <div class="game-summary__footer">
            <ul class="game-os">
                ${platforms}
             </ul>
             <span class="date-added">Added ${this.created.getFullYear()}-${(this.created.getMonth() + 1).padStart()}-${this.created.getDate().padStart()}</span>
            <span class="game-price"><img class="game-price-coin" alt="$" src="../icons/icon128.png"/>${this.price}</span></div>
    </div>
    <div class="game__claimed-progress"><span class="claimed-value">${this.claimed}% Claimed</span>
        <div class="progress-container">
            <div class="progress-bar" style="width: ${this.claimed}%;"></div>
        </div>
    </div>
</li>`.toHtmlNode();
    }

    /**
     * @param {HTMLElement} appendTo
     */
    chronoIconHtml(appendTo) {
        const affordText = this.affordability.calculated ?
            (this.affordability.affordable
                ? 'You got the coins!'
                : `~${this.affordability.days} coin clicks away`)
            : '';
        const affordTextColor = Utils.numberToColor(1 - this.affordability.days / 30);
        const game = this;
        const steamOverall = !this.steamData ? '' : `<span id="plusplus-steam-steamScore" class="claimed-value" style="opacity: 1; color:${Utils.numberToColor(game.score.overall)}; display:${game.steamData.review ? 'block' : 'none'}">${Utils.numberToRating(game.score.overall)} overall value</span>`;
        const platforms = this.platforms.map(platform => `<li class="game-os--${platform}"></li>`).join('');
        const html = `<li id="plusplus-game-${game.hash}" class="">
    <div class="grey-overlay"></div>
    <div class="item__headerBG" style="background-image: url('/assets/images/shop/${game.hash}/item-header.jpg');">
        <img src="/assets/images/shop/${game.hash}/item-header--alt.jpg">
    </div>
    <hr>
    <div class="game-summary">
        <span class="game-name">${game.name}</span>
        <div id="plusplus-steam-overview-info-${game.hash}">${steamOverall}</div>
        <span class="claimed-value" style="opacity: 1; color: ${affordTextColor}">${affordText}</span>
        <div class="game-summary__footer">
            <ul class="game-os">
                ${platforms}
             </ul>
            <span class="game-price">${game.price}</span></div>
    </div>
    <div class="game__claimed-progress"><span class="claimed-value">${game.claimed}% Claimed</span>
        <div class="progress-container">
            <div class="progress-bar" style="width: ${game.claimed}%;"></div>
        </div>
    </div>
</li>`;
        const node = html.toHtmlNode();
        appendTo.append(node);
        document.getElementById(`plusplus-game-${game.hash}`)
            .addEventListener("click", () => game.chronoFullHtml());
    }

    chronoFullHtml() {
        const platforms = this.platforms.map(platform => `<li class="game-os--${platform}"></li>`).join('');
        const game = this;
        const steamInfo = !this.steamData ? '' : `<span id="plusplus-steam-review" class="claimed-value" style="opacity: 1; color:${Utils.numberToColor(game.score.review)}; display:${game.steamData.review ? 'block' : 'none'}">${game.steamData.review}</span>
<span id="plusplus-steam-priceScore" class="claimed-value" style="opacity: 1; color:${Utils.numberToColor(game.score.price)}; display:${game.steamData.review ? 'block' : 'none'}">${Utils.numberToRating(game.score.price)} coin to money value</span>
<br>
<span id="plusplus-steam-price" class="claimed-value" style="opacity: 1; display:${game.steamData.review ? 'block' : 'none'}">${game.steamData.price} ${game.steamData.currency} (${Math.round(game.price / game.steamData.price)} coins per ${game.steamData.currency.toLowerCase()})</span>
<br>`;
        const html = `<div id="plusplus-game-fullview" class="ReactModalPortal">
    <div class="ReactModal__Overlay ReactModal__Overlay--after-open modal__overlay" aria-modal="true">
        <div class="ReactModal__Content ReactModal__Content--after-open modal shopitem-modal" tabindex="-1"
             aria-label="Shop Game Modal">
            <div class="shopitem-modal__wrapper"><span class="modal-close"></span>
                <div>
                    <div class="header-container">
                        <img src="/assets/images/shop/${game.hash}/item-header.jpg"></div>
                    <hr>
                    <div class="game-summary">
                        <div class="game-summary__header"><span class="game-name">${game.name}</span><span
                                class="game-price">${game.price}</span></div>
                        <div class="os-steam">
                            <ul class="game-os">
                                ${platforms}
                            </ul>
                            <span class="date-added">Added ${game.created.getFullYear()}-${(game.created.getMonth() + 1).padStart()}-${game.created.getDate().padStart()}</span>
                        </div>
                        <div class="game-info"><p class="game-desc">${game.description}</p>
                        <div id ="plusplus-steam-all-info-${game.hash}">${steamInfo}</div>
                        <a href="${game.url}" target="_blank">View game on Steam</a>
                            <div class="game__claimed-progress"><span class="claimed-value">${game.claimed}% Claimed</span>
                                <div class="progress-container">
                                    <div class="progress-bar" style="width: ${game.claimed}%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="game__footer">
                        <a href="https://www.chrono.gg/shop?chronoplusplus=${game.name}&chronoplusplusbuy=true">
                            <button class="btn" data-event-property="shop-buy-modal">
                                <div>Pay <span class="button__game-price">${game.price}</span></div>
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;

        const node = html.toHtmlNode();
        document.body.appendChild(node);
        const reactModelPortal = document.getElementById('plusplus-game-fullview');
        reactModelPortal.addEventListener('click', () => reactModelPortal.remove());
        document.getElementsByClassName('modal-close')[0]
            .addEventListener('click', () => reactModelPortal.remove());
        document.getElementsByClassName('shopitem-modal__wrapper')[0]
            .addEventListener('click', event => event.stopPropagation());
    }
}

