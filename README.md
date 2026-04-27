# 🎬 DX-Anime Streaming Platform

![DX-Anime Banner](https://via.placeholder.com/1200x400?text=DX-Anime+Streaming+Platform)

A modern, premium, Netflix-inspired anime streaming web application built entirely with **Vanilla HTML, CSS, and JavaScript**. DX-Anime leverages the **Jikan API (MyAnimeList)** to fetch real-time trending, popular, and upcoming anime, while also featuring a fully functional, hidden administrative dashboard that allows platform owners to upload and manage custom content (Movies, Series, Cartoons) directly into `localStorage` without the need for a backend database.

---

## ✨ Key Features

### 📺 Immersive User Experience
- **Netflix-Style UI:** Beautiful dark theme, horizontal sliders, auto-playing hero section, and smooth glassmorphism effects.
- **Light & Dark Mode:** Toggle between sleek dark styling and clean light modes with the click of a button.
- **My List Capability:** Users can add their favorite anime to a personal watchlist that persists via `localStorage`.
- **Advanced Player Dashboard:** A customized video player featuring dynamic episode grids, season selectors, and smart recommendations.

### 🛡️ Secret Admin Dashboard
- **Hidden Access:** Accessible only via the profile icon or a secret keyboard shortcut (`Ctrl + Shift + A`).
- **Real-Time Analytics:** Circular progress rings showing data on active users, total content, and genre distributions.
- **Multi-Episode / Series Management:** Admins can effortlessly batch-upload seasons and episodes by simply pasting URLs under `[Season Name]` tags.
- **Library Management:** Edit, move (reorder), or delete content across various categories (Movies, Indian Toons, Old Cartoons).

### ⚡ Powered by Jikan API
- Seamless integration with the v4 Jikan API for dynamic Anime metadata (Titles, Posters, Synopsis, Scores, YouTube Trailer IDs).

---

## 🛠️ Technology Stack

- **HTML5:** Semantic architecture.
- **CSS3:** Flexbox, CSS Grid, Custom Variables (Tokens), and modern animations (Hover states, UI scaling, Glassmorphism).
- **Vanilla JavaScript:** ES6+, Fetch API, LocalStorage persistence, DOM manipulation.
- **No Backend Required:** Content management operates entirely client-side, making deployment incredibly lightweight!

---

## 🚀 How to Run Locally

Because the app is built with pure Vanilla technologies, no build steps (`npm`, `webpack`, etc.) are required. 

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/dx-anime.git
   cd dx-anime
   ```
2. **Launch the project:**
   Simply open the `index.html` file in your preferred web browser. Alternatively, use an extension like **Live Server** in VS Code for a better development experience.


---

## 📂 Project Structure

```text
📦 dx-anime
 ┣ 📜 index.html    # The main layout, modals, and admin dashboard structure
 ┣ 📜 styles.css    # Responsive styling, animations, light/dark themes
 ┣ 📜 script.js     # API fetching, player logic, admin management, and DOM handling
 ┗ 📜 README.md     # Project documentation
```

---

## 🎨 Screenshots & UI Design

### The Main Application
*A premium Netflix-style layout showcasing Top Upcoming, Trending, and Custom content.*

### The Player Modal
*A full-screen dashboard featuring an integrated episode grid, season selector, and dynamic recommendations below the active player.*

### The Admin Dashboard
*Glassmorphism UI elements, circular analytics graphs, and powerful content upload tools hidden from regular users.*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/dx-anime/issues). 

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
