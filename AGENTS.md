# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

## Repo mechanics

- Change echoip in a clone of the fork, gStart9/echoip, and then move the `upstream-project` submodule to the pushed commit. A change left in the submodule's working tree reaches no other build.
- Clone with `--recurse-submodules`. Without the submodule, the image has nothing to build.
