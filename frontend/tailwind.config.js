module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#040814",
        panel: "rgba(14, 24, 48, 0.7)",
        accent: "#7cf7d4",
        warning: "#f9c74f",
        danger: "#ff6b8a",
        electric: "#73a5ff",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,247,212,0.18), 0 18px 50px rgba(4, 8, 20, 0.45)",
      },
      backgroundImage: {
        "radial-lab":
          "radial-gradient(circle at top left, rgba(115,165,255,0.18), transparent 26%), radial-gradient(circle at top right, rgba(124,247,212,0.16), transparent 24%), linear-gradient(180deg, #07111f 0%, #040814 100%)",
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        pulsegrid: "pulsegrid 5s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulsegrid: {
          "0%, 100%": { opacity: 0.45 },
          "50%": { opacity: 0.9 },
        },
      },
    },
  },
  plugins: [],
};
