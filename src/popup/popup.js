const dailyDeal = new DailyGame(true);
const coinShop = new CoinShop(true);

coinShop.await().then(async () => {
    document.getElementById('coinShop-loading').remove();
    const wrapper = document.getElementById('coinShop');
    coinShop.games.filter(e => e.isActive)
        .forEach(game => wrapper.append(Utils.parseHtml(game.asPopupHtml())));
    document.getElementById('coinShop-timer').innerText = `More games in\n${coinShop.timeLeft()}`;
});

dailyDeal.await().then(async () => {
    document.getElementById('daily-loading').remove();
    const wrapper = document.getElementById('daily');
    wrapper.append(Utils.parseHtml(dailyDeal.asPopupHtml()));
    document.getElementById('daily-timer').innerText = `Deal ends in\n${dailyDeal.timeLeft()}`;
});