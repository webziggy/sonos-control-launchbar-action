# 'Sonos Control' - action for LaunchBar
A [LaunchBar](https://www.obdev.at/products/launchbar/index.html) action (macOS) written in Javascript - to allow control of your Sonos music players via the node-sonos-http-api server running locally.

This action requires:

1. Hosting of a local Node-Sonos-HTTP-API - https://github.com/jishi/node-sonos-http-api
2. Configuration of the serverRoot variable below to point at this.
3. Configuration of the Sonos IDs variable below, this should be an array containing strings each with the 'Sonos ID' - this can be found by requesting <serverRoot>:5005/zones and looking for the 'roomName' parameters in there.

