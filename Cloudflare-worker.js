/**
 * Copy and paste the whole script in your Cloudflare Worker editor
 * Only works for Siteground users
 * Check the md file for the tutorial!
 */

addEventListener('fetch', event => {
    event.respondWith(supportWebpCloudflare(event.request))
})


async function supportWebpCloudflare(request) {

    let regex = /\.jpg$|\.png$/

    if (request.headers.get('Accept')
        && request.headers.get('Accept').match(/image\/webp/)
        && request.url.match(regex)) {
        /**
         * Changes the URL to the .webp file which is created by the SG optimizer Plugin
         */
        let url = new URL(request.url + '.webp')

        /**
         * Create a new request with the webp url
         */
        const modifiedRequest = new Request(url, {
            method: request.method,
            headers: request.headers
        })

        /**
         * Fetch the webp response
         */
        const webpResponse = await fetch(modifiedRequest)

        /**
         * Add webworker header to the webp response so we can
         * check live if the webworking is doing what it should do
         */
        const webpHeaders = new Headers(webpResponse.headers)
        webpHeaders.append('X-CloudWorker', 'active')
        webpHeaders.append('Browser-accepts-webp', 'true')

        /**
         * Return a new response object
         */
        return new Response(webpResponse.body, {
            status: webpResponse.status,
            statusText: webpResponse.statusText,
            headers: webpHeaders
        })

    } else {
        // Browser didn't allow webp 
        if (request.headers.get('Accept')
            && request.url.match(regex)) {
            /**
             *  First add the page rule to cloudflare which bypasses all cache!
             */
            let url = new URL(request.url + "?nocache=true")

            const modifiedRequest = new Request(url, {
                method: request.method,
                headers: request.headers
            })

            const webpResponse = await fetch(modifiedRequest)

            const webpHeaders = new Headers(webpResponse.headers)
            webpHeaders.append('X-CloudWorker', 'active')
            webpHeaders.append('Browser-accepts-webp', 'false')

            response = new Response(webpResponse.body, {
                status: webpResponse.status,
                statusText: webpResponse.statusText,
                headers: webpHeaders
            })

            return response;

        } else {
            const response = await fetch(request)
            return response
        }
    }


}
