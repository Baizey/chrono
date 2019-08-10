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

    /**
     * @return {Promise<void>}
     */
    await() {
        return Utils.wait(() => !this.isLoading);
    }

}