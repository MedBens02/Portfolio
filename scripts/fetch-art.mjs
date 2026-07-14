/*
 * Downloads the final pixel-art imagery (generated with Higgsfield) into
 * the paths index.html expects. Run once after cloning, or re-run to
 * restore the files — it always overwrites:
 *   npm run fetch:art
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const CDN = 'https://d8j0ntlcm91z4.cloudfront.net/user_3GSu3gsUqHvyIEedYxaOLvpkw6v';

const ART = [
  ['public/char/portrait.png',  `${CDN}/hf_20260714_150148_25374f2f-ff11-4b5c-b1b2-106e2718b14f.png`],
  ['public/projects/nexa.png',  `${CDN}/hf_20260714_150445_f77f3029-69db-40cc-a5cc-cdeb043d4970.png`],
  ['public/projects/pulse.png', `${CDN}/hf_20260714_150526_f9eac3d2-4706-4c7b-be4d-4eefbc58423c.png`],
  ['public/projects/atlas.png', `${CDN}/hf_20260714_150550_98387d1f-eaf1-4cf3-894d-93aff6399e48.png`],
  ['public/projects/orbit.png', `${CDN}/hf_20260714_150626_6427288f-0ad7-402b-99be-98428cb64427.png`],
  ['public/char/tavern.png',    `${CDN}/hf_20260714_150654_c6a39d18-823c-4df9-9e81-1c63e542dd06.png`],
  ['public/og.png',             `${CDN}/hf_20260714_150802_893d8577-ece3-4237-bbba-ef34ea5396bd.png`],
];

let failed = 0;
for (const [file, url] of ART) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    console.log(`ok  ${file}`);
  } catch (err) {
    failed++;
    console.error(`ERR ${file}: ${err.message}`);
  }
}

if (failed) {
  console.error(`\n${failed} download(s) failed — re-run, or fetch the URLs above manually.`);
  process.exit(1);
}
