# Updating the upstream version

The package builds echoip from [gStart9/echoip](https://github.com/gStart9/echoip), a fork of [mpolden/echoip](https://github.com/mpolden/echoip), which is the `upstream-project` git submodule. Upstream publishes no releases or version tags, so the package version is the date of the fork commit that the submodule pins.

## Determining the upstream version

Compare upstream's `master` with the fork's `master`:

```
git -C upstream-project fetch https://github.com/mpolden/echoip.git master
git -C upstream-project log --oneline HEAD..FETCH_HEAD
```

Any commit listed is an upstream change that the fork has not merged yet.

## Applying the bump

1. In a clone of the fork, merge upstream's `master` into the fork's `master`, run `go test ./...`, and push the result.
2. Point the submodule at the fork's new `master`:

   ```
   git -C upstream-project fetch origin
   git -C upstream-project checkout origin/master
   ```

3. Set the upstream part of the version in `startos/versions/current.ts` to the date of the fork's new commit as `YYYY.M.D`, without leading zeros, for example `2026.11.23`.
