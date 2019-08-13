const dailyDeal = new DailyGame(true);
const coinShop = new CoinShop(true);

coinShop.await().then(async () => {
    document.getElementById('coinShop-loading').remove();
    const wrapper = document.getElementById('coinShop');
    coinShop.games.filter(e => e.isActive)
        .forEach(game => {
            wrapper.append(game.asPopupHtml());
            document.getElementById(`coinShop-game-${game.hash}`)
                .addEventListener('click', () => chrome.tabs.create({active: true, url: `https://chrono.gg/shop?chronoplusplus=${game.name}`}))});
    document.getElementById('coinShop-timer').innerText = `More games in\n${CoinShop.timeLeft()}`;
});

dailyDeal.await().then(async () => {
    document.getElementById('daily-loading').remove();
    const wrapper = document.getElementById('daily');
    wrapper.append(dailyDeal.asPopupHtml());
    document.getElementById('daily-game')
        .addEventListener('click', () => chrome.tabs.create({active: true, url: 'https://chrono.gg'}));
    document.getElementById('daily-timer').innerText = `Deal ends in\n${dailyDeal.timeLeft()}`;
    setInterval(() => {
        document.getElementById('daily-timer').innerText = `Deal ends in\n${dailyDeal.timeLeft()}`;
    }, 100);
});