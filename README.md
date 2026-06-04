# Fizzi - 3D Product Landing Page

Welcome to the **Fizzi** product landing page project! This is a modern, immersive, and highly interactive web experience built to showcase Fizzi, a fictional soda brand. 

The project leverages the power of WebGL for 3D rendering and scroll-driven animations to create a truly captivating digital presence.

## 🌟 Features

- **Interactive 3D Models:** High-quality 3D soda cans rendered in real-time.
- **Scroll-Driven Animations:** Smooth transitions and cinematic camera movements synchronized with the user's scroll position.
- **Dynamic Materials & Textures:** Realistic physically-based rendering (PBR) materials for the cans and environments.
- **Responsive Design:** A fully responsive layout that works beautifully across mobile and desktop devices.
- **Modern Tech Stack:** Built with cutting-edge tools for maximum performance and developer experience.

## 🛠️ Technology Stack

- **[Vite](https://vitejs.dev/)** - Next Generation Frontend Tooling
- **[Three.js](https://threejs.org/)** - Cross-browser JavaScript library and API used to create and display animated 3D computer graphics in a web browser
- **[GSAP (GreenSock)](https://gsap.com/)** - Professional-grade HTML5 animation engine for scroll-triggered timelines
- **Vanilla JS** - Core logic and interactivity
- **Tailwind CSS** - Utility-first CSS framework for rapid UI styling

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You will need Node.js installed on your system.
- [Node.js](https://nodejs.org/) (v16 or higher recommended)

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/priyanshu911chaudhary-prog/Fizzi-Product-landingPage.git
   ```
2. **Navigate to the project directory**
   ```sh
   cd Fizzi
   ```
3. **Install dependencies**
   ```sh
   npm install
   ```

### Running Locally

To start the development server:
```sh
npm run dev
```
Open your browser and visit the local URL (usually `http://localhost:5173`) to view the project.

### Building for Production

To create an optimized production build:
```sh
npm run build
```
This will generate a `dist` folder containing the minified and optimized assets ready for deployment.

## 🌐 Deployment Notes

When deploying this project (e.g., to Netlify or Vercel), the build command `npm run build` handles most optimizations. Ensure that 3D assets (`.gltf`, `.bin`) and dynamically loaded textures are placed within the `public/` directory so they are correctly served in the production environment.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
