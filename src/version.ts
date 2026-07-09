// Package version, surfaced so the consuming apps can DISPLAY which finley-core
// build is live (e.g. next to the Finley "BETA" badge in both chatbots).
//
// KEEP IN SYNC with the "version" field in package.json — bump both together on
// every release/tag. (Single literal on purpose: no build-time magic that could
// silently drift or break the bundle.)
export const FINLEY_CORE_VERSION = '0.3.0';
