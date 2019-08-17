const dailyDeal = new DailyGame(true);
const coinShop = new CoinShop(true);
const account = new Account(true);

coinShop.await()
    .then(async () => await account.await())
    .then(async () => {
        const balance = account.hasData ? account.coins.balance : undefined;
        document.getElementById('coinShop-loading').remove();
        const wrapper = document.getElementById('coinShop');
        coinShop.games.filter(e => e.isActive)
            .map(e => e.calculateAffordability(balance))
            .forEach(game => {
                wrapper.append(game.asPopupHtml());
                document.getElementById(`coinShop-game-${game.hash}`)
                    .addEventListener('click', () =>
                        Browser.createTab(`https://chrono.gg/shop?chronoplusplus=${encodeURIComponent(game.name)}`))
            });
        document.getElementById('coinShop-timer').innerText = `More coin shop games in\n${CoinShop.timeLeft()}`;
    });

dailyDeal.await()
    .then(async () => {
        account.await().then(() => {
            document.getElementById('coinShop-coin-amount').innerText = account.coins.balance;
            const info = document.getElementById('coinShop-coin-info');
            if (!account.hasData) return info.innerText = "Refresh chrono.gg";
            const lastClick = account.coins.last.getTime();
            const lastRefresh = dailyDeal.startDate.getTime();
            if (lastClick < lastRefresh)
                info.innerText = "You can get more coins now!"
        });

        document.getElementById('daily-loading').remove();
        const wrapper = document.getElementById('daily');
        wrapper.append(dailyDeal.asPopupHtml());
        document.getElementById('daily-game')
            .addEventListener('click', () => Browser.createTab('https://chrono.gg'));
        document.getElementById('daily-timer').innerText = `Deal ends in\n${dailyDeal.timeLeft()}`;
        setInterval(
            () => document.getElementById('daily-timer').innerText = `Deal ends in\n${dailyDeal.timeLeft()}`,
            100);
    });