# Mopeli Mopeli Teboho | Developer Portfolio

A fast, interactive personal portfolio for a full-stack developer, hosted on **GitHub Pages** and powered by **Firebase**. Visitors see a polished public site. The owner logs in through a hidden admin login to add or delete projects and edit contact details, with no code changes or redeploys needed.

**Live site:** https://mceex17.github.io/myportfolio/

## Features

**Public site**
- Hero section with profile photo, animated glow ring, floating tech chips and a typing role line
- "What I do" section covering web apps, Flutter mobile apps and Firebase/cloud work
- Project gallery that updates live from Firestore, with each website's icon fetched automatically
- Contact cards (email, phone, GitHub, Instagram, Facebook) that appear only when filled in. Clicking the email card copies the address.
- CV download button, a count-up stat for projects, scroll-reveal animations and cursor-spotlight cards
- Responsive and mobile-friendly, and it respects reduced-motion settings

**Admin (owner only)**
- Hidden login: click the **M** logo **5 times** quickly (or press **Ctrl+Shift+L** on desktop)
- Full-screen login with a custom background image
- **Add website**: name, link, tech used, description, optional icon link
- **Contact info**: edit email, phone, GitHub, Instagram and Facebook
- Delete any project with the red **x** on its card

## Tech stack

| Area | Tool |
| --- | --- |
| Front end | HTML5, CSS3, vanilla JavaScript (ES modules) |
| Auth | Firebase Authentication (email and password) |
| Database | Cloud Firestore |
| Hosting | GitHub Pages |
| Fonts and icons | Plus Jakarta Sans, JetBrains Mono, Font Awesome |

There is no build step and no dependencies to install. It is plain static files.

## Project structure

```text
my-portfolio/
├── index.html        # Page markup: hero, about, work, contact, admin panel, login
├── style.css         # Theme, layout, animations, responsive rules
├── app.js            # Firebase auth + Firestore, rendering, icons, effects
├── firestore.rules   # Security rules to paste into the Firebase console
├── me.jpg            # Profile photo (replace the file to change it)
├── login-bg.jpg      # Login screen background
├── cv.pdf            # Your CV (add this yourself)
├── .nojekyll         # Tells GitHub Pages to serve files as-is
└── .gitignore
```

## Data model (Firestore)

| Path | Fields |
| --- | --- |
| `projects/{id}` | `title`, `url`, `tech`, `desc`, `iconUrl` (optional), `createdAt` |
| `site/profile` | `email`, `phone`, `github`, `instagram`, `facebook` |

## Setup

### 1. Firebase
1. Create a Firebase project and register a **web app**.
2. Enable **Authentication > Sign-in method > Email/Password**.
3. Under **Authentication > Users**, add your admin user and copy its **User UID**.
4. Create a **Firestore Database**.
5. Open **Firestore > Rules**, paste the contents of `firestore.rules`, replace **both** `PASTE_YOUR_UID_HERE` values with your UID, then **Publish**.
6. In `app.js`, make sure the `firebaseConfig` block matches your project.

### 2. Add your files
- Put your CV in the folder as `cv.pdf`.
- Replace `me.jpg` with your own photo (about 4:5 portrait, around 600x750 px works well).

### 3. Deploy to GitHub Pages
```bash
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
Then go to **Settings > Pages**, choose **Deploy from a branch > main > / (root)** and save. The site is live in a minute or two.

### 4. Authorize your domain in Firebase
Go to **Authentication > Settings > Authorized domains** and add `YOUR_USERNAME.github.io`. Login will not work on the live site without this.

## Using the admin panel

1. Open the site and click the **M** logo 5 times quickly (a small counter shows your progress).
2. Sign in with your Firebase admin email and password.
3. Use the **Admin** panel in the bottom-right corner:
   - **Add website** to publish a project. Its icon is found automatically.
   - **Contact info** to set the details shown in the Contact section.
4. Delete a project with the red **x** on its card.
5. **Log out** at the bottom of the panel.

### How website icons are found
For each project the site tries, in order:
1. The **icon link** you pasted in the form (best option for small or new sites)
2. The site's own icon, looked up from its full link
3. `favicon.ico` in the site's folder, then at the main domain
4. A DuckDuckGo icon lookup
5. If nothing loads, the **first letter** of the project name, or a **star** if there isn't one

## Security notes

- The Firebase `apiKey` in `app.js` is **not a secret**. Every Firebase web app exposes it. Your data is protected by the **Firestore rules**, which allow only your UID to write.
- Restrict the key to your website: Google Cloud Console > **APIs & Services > Credentials > Browser key > Websites**. Add `https://YOUR_USERNAME.github.io/*` and your `firebaseapp.com` domain.
- Turn off public sign-ups: **Authentication > Settings > User actions > Enable create (sign-up)**.
- Use a long, unique admin password.
- All text from the database is escaped before display, and links are checked to be `http(s)`.
- Never put real secrets (payment keys, email API keys) in this front-end code.

## Customizing

| To change | Edit |
| --- | --- |
| Name, tagline, "What I do" text | `index.html` |
| Rotating role lines | `roles` array in `app.js` |
| Colors | the `:root` variables at the top of `style.css` |
| Tech chips around the photo | `.chip` elements in `index.html` |
| Default GitHub link | `contacts` object in `app.js` |

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Login fails on the live site | Add your `github.io` domain to Firebase authorized domains |
| "Missing or insufficient permissions" | Publish the rules with your real UID in both places |
| Contact info won't save | The `site` collection rule is missing. Republish `firestore.rules`. |
| CV button shows 404 | Add `cv.pdf` to the repo root |
| A project shows a letter instead of an icon | Re-add it with a direct **Icon link** |
| Changes don't show after pushing | Wait a minute, then hard refresh (Ctrl+Shift+R) |

## Credits

Designed and built by Mopeli Mopeli Teboho (React, Flutter, Firebase, C# MVC).
