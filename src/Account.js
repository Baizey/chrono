class Account extends Loading {

    constructor(useStored) {
        super(true);
        this._load(useStored).catch(e => Utils.logError(e));
    }

    async _load(useStored) {
        const data = await Request.accountInfo(useStored).catch(() => undefined);
        this.hasData = !!data;
        if (this.hasData) {
            this.email = data.email;
            this.coins = new Coins(data.coins);
        }
        this.doneLoading();
    }
}

class Coins {
    constructor(data) {
        this.balance = data.balance;
        this.last = new Date(data.last);
        this.spins = data.spins;
        this.legendaries = data.legendaries;
        this.new = data.new;
    }
}