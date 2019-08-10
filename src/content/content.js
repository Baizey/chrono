const login = async () => {
    const showFormButton = '.accountNav';
    const submitFormButton = '.modal__button--login';
    const loginFail = '.modal__server-error';
    const loginSuccess = '.user-name';
    const deadCoin = '.dead';
    if (!Utils.elementExists(loginSuccess)) {
        Utils.log("login", "Logging in...");
        await Utils.wait(() => Utils.elementExists(showFormButton));
        Utils.log("login", "Opening form...");
        Utils.getElements(showFormButton).children[0].children[0].children[0].click();
        await Utils.wait(() =>
            Utils.elementExists(submitFormButton) && !Utils.getElements(submitFormButton).disabled);
        Utils.log("login", "Clicking login...");
        Utils.getElements(submitFormButton).click();
        await Utils.wait(() => Utils.elementExists(loginFail) || Utils.elementExists(loginSuccess));
        Utils.log("login", "Logged in...");
        if (Utils.elementExists(loginFail)) throw 'Chrono.++: AutoLogin failed';
    }
    for (let i = 0; i < 10; i++) {
        if (!Utils.elementExists(deadCoin)) {
            document.getElementById('reward-coin').click();
            break;
        }
        await Utils.wait(1000);
    }
};

const chronoFrontPage = async () => {
    login().catch(error => Utils.logError(error));

    const coinShop = new CoinShop(true);
    const daily = new DailyGame(true);

    const gameDetails = document.getElementById('game-details--featured');
    const shop = CoinShop.asFrontPageHtml();
    const gameDetailsWrapper = document.createElement('div');
    gameDetailsWrapper.id = 'chronoplusplus-game-details--featured';
    gameDetailsWrapper.class = 'game-details--featured';
    gameDetails.parentNode.insertBefore(gameDetailsWrapper, gameDetails);
    gameDetailsWrapper.appendChild(gameDetails);
    gameDetailsWrapper.parentNode.insertBefore(shop, gameDetailsWrapper);
    document.getElementById('plusplus-coinShop-timer').innerText = CoinShop.timeLeft();

    coinShop.await().then(() => {
        document.getElementById('plusplus-coinShop-loading').remove();
        const gamesWrapper = document.getElementById('plusplus-coinShop-games');
        const games = coinShop.games.filter(e => e.isActive);

        if (games.length === 0)
            return gamesWrapper.append('<div class="no-games"><img src="/assets/images/no-orders-box.9620fb5c.svg"><h4>The coin coinshop  is all sold out.</h4></div>'.toHtmlNode());

        gamesWrapper.append(`<ul id="plusplus-available-games" class="chrono-shop__games"></ul>`.toHtmlNode());
        const ul = document.getElementById('plusplus-available-games');
        games.forEach(game => game.chronoIconHtml(ul));
    });

    daily.await().then(() =>
        document.getElementById('pricing-info').children[0].append(`<ul id="plusplus-daily-review"><li style="text-align:center; margin:auto; color:${Utils.numberToColor(daily.score.review)}">${daily.steamData.review}</li></ul>`.toHtmlNode()))
};

const chronoCoinShop = async () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('chronoplusplus')) {
        const title = params.get('chronoplusplus');
        const buy = params.has('chronoplusplusbuy') && params.get('chronoplusplusbuy') === 'true';
        await Utils.wait(() => document.getElementsByClassName('chrono-shop__games').length > 0);
        const titles = document.getElementsByClassName('game-name');
        for (let i = 0; i < titles.length; i++) {
            if (titles[i].innerText === title) {
                titles[i].click();
                if (buy)
                    document.getElementsByClassName('button__game-price')[0].click();
                break;
            }
        }
    }
};

switch (window.location.pathname) {
    case '/':
        Utils.log('content', 'running for frontpage');
        chronoFrontPage().catch(error => Utils.logError(error));
        break;
    case '/shop':
        Utils.log('content', 'running for coin shop');
        chronoCoinShop().catch(error => Utils.logError(error));
        break;
}