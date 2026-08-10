# TheGitDown

Client-side tool for downloading a public GitHub file or directory as a zip — or sharing a one-click download link. Live at [gitdown.xyz](https://gitdown.xyz).

![See it in action](images/screenshot.png)

## Deep links

Customize the zip name or root-folder behavior via:

```
https://gitdown.xyz/#/home?url=<GitHub link>&fileName=<name>&rootDirectory=<true|false|name>
```

Example (directory zip without the root folder):

```
https://gitdown.xyz/#/home?url=https://github.com/taylorsegell/TheGitDown/tree/master/images&rootDirectory=false
```

That downloads `images.zip` with the folder contents at the zip root.

## Optional GitHub token

Unauthenticated GitHub API calls are rate-limited. Paste a personal access token in the app settings to raise limits; it is stored only in this browser’s `localStorage`, never sent to a TheGitDown backend (there isn’t one — the SPA talks to GitHub from the browser).

## Security

A GitHub PAT was previously exposed in client source and has been removed from the working tree. Rotate any leaked credentials; do not commit tokens. History scrubbing (`git filter-repo` / BFG) is operator-owned and out-of-band — see [SECURITY.md](SECURITY.md).

## Develop

```bash
npm install
npm run dev      # Vite dev server
npm test         # Vitest
npm run build    # production static assets → dist/
```

## License

[MIT](https://opensource.org/licenses/MIT)
