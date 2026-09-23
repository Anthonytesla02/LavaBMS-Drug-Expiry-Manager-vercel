# LavaBMS Drug Expiry Alerts

This folder is a ready-to-load Chrome extension.

1. Open the Chrome extensions page and enable Developer mode.
2. Choose **Load unpacked** and select this folder.
3. Open the extension details, choose **Extension options**, and save the admin app API URL ending in `/api`.
4. Open `http://lava-server:62/pos` in Chrome.

The content script listens to text and searchable fields, looks up the entered name against generic names, alternative names, and brand names, and shows a top-right alert:

- light green: good date
- light yellow: close to expiry (90 days or fewer)
- light red: expired