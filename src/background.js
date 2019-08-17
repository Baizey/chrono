/**
 * @param request
 * @return {string|undefined}
 */
const constructUrl = request => {
    const chronoBaseUrl = 'https://api.chrono.gg/';
    const steamBaseUrl = `https://store.steampowered.com/`;
    switch (request.type) {
        case 'daily':
            return `${chronoBaseUrl}sale`;
        case 'coinshop':
            return `${chronoBaseUrl}shop`;
        case 'steamPrice':
            return `${steamBaseUrl}api/appdetails?appids=${encodeURIComponent(request.id)}`;
        case 'steamReview':
            return `${steamBaseUrl}appreviews/${encodeURIComponent(request.id)}?json=1`;
        case 'account':
            return `${chronoBaseUrl}account`;
    }
};

/**
 * @type {{get: (function(string): Promise<*>)}}
 */
const Ajax = {
    _call: (url, data, method, headers) => new Promise((resolve, reject) => {
        if (!url) return reject('No url given');
        const request = new XMLHttpRequest();
        request.open(method, url, true);
        if (headers) {
            headers.keyValuePairs().forEach(pair => {
                switch (pair.key) {
                    case 'Authorization':
                        return request.setRequestHeader('Authorization', pair.value);
                    default:
                    // Ignore any unknown headers
                }
            });
        }
        request.onreadystatechange = function () {
            if (request.readyState !== XMLHttpRequest.DONE)
                return;
            return request.status >= 200 && request.status < 300
                ? resolve(request.responseText)
                : reject(request.responseText);
        };
        if (data)
            request.send(data);
        else
            request.send();
    }),
    get: (url, headers) => Ajax._call(url, undefined, 'GET', headers),
    post: (url, data, headers) => Ajax._call(url, data, 'POST', headers)
};

const postChangeMeta = meta => {
    if (!meta) return meta;
    if (meta.time)
        meta.time = (Math.abs(meta.time - Date.now()) / 1000).toFixed(3);
    return meta;
};

const Respond = {
    success: (data, meta = undefined) => ({
        success: true,
        data: data,
        meta: postChangeMeta(meta)
    }),
    failure: (data, meta = undefined) => ({
        success: false,
        data: data,
        meta: postChangeMeta(meta)
    })
};

chrome.runtime.onMessage.addListener(function (request, sender, respond) {
    switch (request.method) {
        case 'httpGet':
            const url = constructUrl(request);
            const meta = {url: url, method: 'GET', time: Date.now()};
            Ajax.get(url, request.headers)
                .then(JSON.parse)
                .then(resp => respond(Respond.success(resp, meta)))
                .catch(error => respond(Respond.failure(error, meta)));
            break;
        default:
            respond(Respond.failure(`Unknown method ${request.method}`));
            break;
    }
    return true;
});