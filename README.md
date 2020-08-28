# 'Sonos Control' - action for LaunchBar
A [LaunchBar](https://www.obdev.at/products/launchbar/index.html) action (macOS) written in Javascript - to allow control of your Sonos music players via the node-sonos-http-api server running locally.

This action requires:

1. Hosting of a local Node-Sonos-HTTP-API - https://github.com/jishi/node-sonos-http-api (@jishi )
2. Configuration of the serverRoot variable within the ```default.js``` to point at this

When action is invoked it should query the http api for 'zones' and allow find any Sonos Devices (switched on).