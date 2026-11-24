<p align="center">
  <img src="icon.svg" alt="echoip Logo" width="21%">
</p>

# echoip on StartOS

> Everything not listed in this document should behave the same as upstream
> echoip. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[echoip](https://github.com/mpolden/echoip) answers each request with the public IP address that the request came from, so StartOS servers can learn their gateways' public addresses from a server that their owner runs. The package shows location data from DB-IP Lite by default, and the **Location Data** action chooses another source or turns location data off.

The package builds echoip from [gStart9/echoip](https://github.com/gStart9/echoip), a fork of upstream that adds the following:

- The page uses the system's fonts instead of loading Google Fonts.
- The `-n` flag shows a visitor's coordinates as text instead of embedding an OpenStreetMap map.
- echoip reads IPFire Location, IPinfo Lite and IP2Location LITE databases, as well as upstream's MaxMind and DB-IP databases, and credits the source on the page.
- The `echoip-geoupdate` command downloads and verifies a source's databases, and echoip's `-R` flag reloads them when they change.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The image is built from the fork, which is the `upstream-project` git submodule, with the fork's own `Dockerfile`. The image is built from `scratch` and holds only the `echoip` and `echoip-geoupdate` binaries, the HTML templates and the CA certificates, so the subcontainers have no shell.

| Property      | Value                                              |
| ------------- | -------------------------------------------------- |
| Image         | Built from `upstream-project` (gStart9/echoip)     |
| Architectures | x86_64, aarch64                                    |
| Entrypoint    | Replaced by an explicit command (below)            |
| Subcontainers | `echoip`, and `geoupdate` while a source is chosen |

The `echoip` daemon runs `/opt/echoip/echoip -l :8080 -t /opt/echoip/html -H X-Forwarded-For -L`, plus `-n` while **Hide the map** is on. While a source is chosen, the daemon also passes the source's database flags and `-R 1m`. echoip then starts without location data and loads the databases as soon as their files appear or change.

While a source is chosen, the `geoupdate` daemon runs `/opt/echoip/echoip-geoupdate -source <source> -dir /data -interval <interval>`. The interval is 168 hours for IP2Location and 24 hours for every other source. The daemon receives the source's credentials as environment variables.

## Volume and Data Layout

| Volume    | Mount point                                                | Contents                                                    |
| --------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| `main`    | `/data`, read-only in `echoip` and writable in `geoupdate` | The downloaded databases, and each download's `.state` file |
| `startos` | not mounted                                                | `store.json`, the settings of the **Location Data** action  |

Changing the source deletes everything in `main`, because two sources can write files with the same name.

## File Models

`store.json` on the `startos` volume holds the **Location Data** settings:

| Key                                     | Meaning                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| `source`                                | `none`, `ipfire`, `dbip` (the default), `maxmind`, `ipinfo` or `ip2location`  |
| `maxmindAccountId`, `maxmindLicenseKey` | The MaxMind credentials                                                       |
| `ipinfoToken`                           | The IPinfo token                                                              |
| `ip2locationToken`                      | The IP2Location token                                                         |
| `noMap`                                 | Whether echoip shows coordinates as text instead of a map. Defaults to `true` |

A change to any of these keys restarts the daemons.

## Dependencies

None.

## Network Access and Interfaces

The package exposes one interface, which serves the web page and the plain-text and JSON endpoints that clients query.

| Interface id | Type | Port | Protocol | Purpose                                                                                    |
| ------------ | ---- | ---- | -------- | ------------------------------------------------------------------------------------------ |
| `ui`         | `ui` | 8080 | HTTP     | The web page, `/ip` (the address as plain text), `/json`, and the other upstream endpoints |

echoip reads the caller's address from the `X-Forwarded-For` header. The StartOS proxy discards any `X-Forwarded-For` header that the client sends and sets the header to the address that the connection came from, so a caller cannot make echoip report a different address.

While a source is chosen, `geoupdate` downloads from that source's server: `location.ipfire.org`, `download.db-ip.com`, `download.maxmind.com`, `ipinfo.io` or `www.ip2location.com`.

## Installation and First-Run Flow

The service starts serving as soon as it is installed and started, with no setup and no credentials. A new install uses DB-IP Lite, so `geoupdate` downloads DB-IP's databases at first start, and the page shows location data about a minute after the download finishes.

## Actions

**Location Data** chooses the database that echoip shows locations and network owners from, and asks for credentials only for a source that needs them. The action can run whether the service is running or stopped.

| Source                   | Account                    | Shows                                        |
| ------------------------ | -------------------------- | -------------------------------------------- |
| None                     | none                       | the IP address only                          |
| IPFire Location          | none                       | country and network owner                    |
| DB-IP Lite (the default) | none                       | country, city, coordinates and network owner |
| MaxMind GeoLite2         | account ID and license key | country, city, coordinates and network owner |
| IPinfo Lite              | token                      | country and network owner                    |
| IP2Location LITE         | token                      | country, region, city and coordinates        |

The action's **Hide the map** toggle, on by default, passes `-n`.

## Tasks

None. The service is never held on a prompt, and its ordinary controls are always available.

## Health Checks

**Web Interface** passes once echoip is listening on port 8080. echoip starts listening within a second of launch, even before any database has downloaded. A check that stays red means that the daemon exited, and the service log shows the reason.

**Location Data** exists only while a source is chosen. The check passes once every database file of the source is in `main`, and shows "Downloading" until then. A check that stays on "Downloading" means that the download failed, usually from a wrong credential, and the service log shows the error from `echoip-geoupdate`.

## Backups and Restore

The package backs up the `startos` volume, which holds the settings. The databases on `main` are left out, because `geoupdate` downloads them again after a restore.

## Limitations and Differences

1. With the source set to None, the country, city and ASN fields and endpoints return nothing.
2. Custom-IP lookups are disabled. echoip ignores the `?ip=` parameter and always reports the caller's own address.
3. The port test (`/port/<n>`) is disabled. With the port test enabled, any visitor could make the server open connections to ports on the visitor's address.
4. Reverse hostname lookups are disabled, so echoip sends no DNS query for its callers.
5. IP2Location LITE has no network owner, so the ASN fields stay empty with that source.
6. echoip reports the address that reaches StartOS. A caller on the same LAN sees its LAN address. A caller through a tunnel sees its public address only when the tunnel preserves the caller's source address.

---

## Quick Reference for AI Consumers

```yaml
package_id: echoip
image: built from upstream-project (gStart9/echoip, a fork of mpolden/echoip)
architectures: [x86_64, aarch64]
subcontainers: [echoip, geoupdate]
volumes:
  main: /data (downloaded databases; not backed up)
  startos: not mounted (store.json)
file_models:
  - store.json
startos_managed_env_vars:
  - MAXMIND_ACCOUNT_ID
  - GEOIP_LICENSE_KEY
  - IPINFO_TOKEN
  - IP2LOCATION_TOKEN
dependencies: none
interfaces:
  ui: { type: ui, port: 8080 }
actions:
  - location-data
tasks: []
health_checks:
  - echoip
  - geoupdate (only while a source is chosen)
```
