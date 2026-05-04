# 🎬 DX-Anime — Premium Anime Streaming Platform

A modern, Netflix-inspired anime streaming web application built entirely with **Vanilla HTML, CSS, and JavaScript**. DX-Anime leverages the **Jikan API (MyAnimeList)** for real-time anime data and features a powerful hidden admin dashboard for managing a custom content library — all without a backend server.

---

## ✨ Key Features

### 📺 Immersive User Experience

- **Netflix-Style UI** — Dark theme, horizontal sliders, auto-playing hero section, and glassmorphism effects.
- **Light & Dark Mode** — Toggle themes instantly with the moon/sun icon in the navbar.
- **My List** — Save favorite anime to a personal watchlist that persists via `localStorage`.
- **Genre Filtering** — Browse content by genre (Action, Romance, Sci-Fi, etc.) from the navbar dropdown.
- **Voice & Text Search** — Find anime instantly with the search bar or the built-in voice search.
- **Responsive Design** — Fully optimized for desktop, tablet, and mobile with a bottom navigation bar on small screens.

### 🎥 Advanced Video Player

- **Multi-Season & Episode Grid** — Series are displayed with a season selector dropdown and a responsive episode card grid.
- **Server Selection Sidebar** — Choose between HD/SD server options inside the player.
- **Smart Recommendations** — Dynamic "Recommended Series" slider below the active video player.
- **Direct Video & YouTube Support** — Play `.mp4` files directly or embed YouTube trailers.

### 🛡️ Secret Admin Dashboard

- **Overview Analytics** — Circular progress ring graphs showing Total Content, Anime Series, Movies, and Active Users at a glance.
- **Add/Edit Content** — Glassmorphism-styled form with support for:
  - Single Direct Video / Movie uploads
  - Multi-Episode Anime Series (batch-paste URLs under `[Season Name]` tags)
  - YouTube Trailer IDs
- **Manage Library** — Edit, reorder, or delete content across all categories (Custom Anime, Movies, Indian Toons, Old Cartoons).
- **User Management** — View and manage registered users with role badges and status indicators.

### 📩 Request Anime / Movie

- **Floating Action Button** — A glowing, animated FAB on the main site lets any user request content.
- **Request Form** — Users submit their name, desired anime/movie title, content type, and an optional message.
- **Admin Requests Panel** — A dedicated "Requests" tab in the admin dashboard featuring:
  - **Pending / Approved / All** filter tabs
  - Live stats pills showing pending and completed request counts
  - Premium request cards with colored status stripes, type icons, time-ago timestamps, and Approve / Dismiss actions
  - Notification badge on the sidebar showing the number of pending requests

### ⚡ Powered by Jikan API

- Seamless integration with the **Jikan v4 API** for dynamic anime metadata — Titles, Posters, Synopsis, Scores, Genres, and YouTube Trailer IDs.

---

## 🛠️ Technology Stack

| Layer         | Technology                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------- |
| **Structure** | HTML5 (Semantic elements)                                                                    |
| **Styling**   | CSS3 — Flexbox, Grid, Custom Properties, Glassmorphism, Conic Gradients, Keyframe Animations |
| **Logic**     | Vanilla JavaScript (ES6+) — Fetch API, LocalStorage, DOM Manipulation                        |
| **Data**      | Jikan API v4 (MyAnimeList) + LocalStorage for custom content                                 |
| **Backend**   | None required — 100% client-side                                                             |

---

## 🚀 How to Run Locally

No build steps, no `npm install`, no `webpack` — just open and go.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/dx-anime.git
   cd dx-anime
   ```
2. **Open in browser:**
   Simply open `index.html` in your browser, or use **Live Server** in VS Code for hot-reloading.

---

## 📂 Project Structure

```text
📦 dx-anime
 ┣ 📜 index.html    # Layout, modals, admin dashboard, request system
 ┣ 📜 styles.css    # Responsive styling, animations, themes, glassmorphism
 ┣ 📜 script.js     # API calls, player logic, admin CRUD, request handling
 ┗ 📜 README.md     # Project documentation
```

---

## 📱 Responsive Breakpoints

| Breakpoint      | Behavior                                                      |
| --------------- | ------------------------------------------------------------- |
| `> 900px`       | Full sidebar admin layout, desktop nav                        |
| `768px – 900px` | Admin sidebar collapses to horizontal tabs                    |
| `< 768px`       | Bottom navigation bar, compact cards, mobile-optimized modals |

---

## 🎨 Design Highlights

- **Circular Progress Graphs** — Admin analytics rendered with CSS `conic-gradient` rings
- **Glassmorphism Forms** — Frosted-glass admin forms with `backdrop-filter: blur`
- **Animated FAB** — Floating request button with a smooth bobbing animation
- **Status-Colored Request Cards** — Yellow stripe for pending, green for approved
- **Hover Micro-Animations** — Card scaling, shadow lifts, and color transitions throughout
- **Custom Scrollbars** — Styled scrollbars matching the platform theme

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
