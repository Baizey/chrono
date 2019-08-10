class Loading {

    /**
     * @param {boolean} isLoading
     */
    constructor(isLoading) {
        this.isLoading = isLoading;
    }

    doneLoading() {
        this.isLoading = false;
    }

    static loadingHtml(id, text = '') {
        return `<div id="${id}" style="padding:0" class="account__loading">
        <div class="loading">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        </div>
        <p>${text}</p>
    </div>`;
    }

    /**
     * @return {Promise<void>}
     */
    await() {
        return Utils.wait(() => !this.isLoading);
    }

}