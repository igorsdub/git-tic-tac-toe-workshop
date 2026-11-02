# Setup picture refresh

The learner-facing setup page now uses the user-provided manual screenshot sequence in `docs/images/setup/manual-images/`: 9 template images, 12 Codespaces and Copilot images, and 7 cleanup images. These images are the main guide inventory and are separate from the automated capture contract.

The automated capture contract remains in `scripts/capture/captures.json` and is unchanged. Its capture targets and any pending capture work apply only to that automated workflow; they do not block or replace the manual screenshot sequence shown to learners.

The manual guide was reviewed in the in-app browser at 1440 px desktop and 390 px mobile widths: all 28 images loaded, with no horizontal overflow. The static guide tests pass. The seven headless DOM tests were skipped because no usable Chromium binary is available in this environment.
