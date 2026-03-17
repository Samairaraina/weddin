export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f1a17",
        parchment: "#f7f1e8",
        gold: "#b58b38",
        maroon: "#7a2234",
        sage: "#5d7564"
      },
      boxShadow: {
        luxe: "0 20px 60px rgba(31, 26, 23, 0.14)"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Trebuchet MS", "sans-serif"]
      }
    }
  },
  plugins: []
};
