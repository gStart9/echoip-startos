# echoip

## Documentation

- [echoip README](https://github.com/mpolden/echoip/blob/master/README.md) — the endpoints and the response formats.

## What you get on StartOS

The **Web UI** interface shows each visitor the public IP address that the visitor's request came from. The same interface answers `/ip` with the address alone, as plain text, and `/json` with the address as JSON. With a location source chosen, the page also shows the country, the city or the network owner of each address, depending on the source.

## Getting set up

echoip is only useful to another server when that server can reach echoip from the internet.

1. Add a public domain to the **Web UI** interface, with a certificate from Let's Encrypt. StartOS checks the certificate of an echoip server, so a bare IP address or a self-signed certificate will not work.
2. Open the public address in a browser from outside your network, and confirm that the page shows your public IP address.
3. To have a StartOS server use this echoip server to learn its gateways' public addresses, run the following command against that server, with your own address in place of the example:

   ```
   start-cli server set-echoip-urls https://echoip.example.com/
   ```

   The command replaces the server's whole list of echoip servers, so include every server that you want the list to keep.

## Location data

Location data is optional, and echoip answers with the IP address whether or not a source is chosen. To show locations, run the **Location Data** action and choose a source:

- **IPFire Location** and **DB-IP Lite** need no account.
- **MaxMind GeoLite2**, **IPinfo Lite** and **IP2Location LITE** need a free account with that provider. The action asks for the account's credentials.

echoip downloads the database in the background and keeps checking for new releases. The **Location Data** health check shows when the database has loaded.

The **Hide the map** setting, which is on by default, shows a visitor's coordinates as text. With the setting off, the page embeds an OpenStreetMap map, which sends the visitor's approximate location to openstreetmap.org.
