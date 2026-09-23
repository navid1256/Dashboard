module.exports = {
    darkMode: "class",
    content: [
        "./pages/**/*.{html,js}",
        "./assets/js/**/*.js"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Sahel", "Tahoma", "Arial", "sans-serif"],
            },
            colors: {
                surface: {
                    light: "#ffffff",
                    dark: "#0f172a",
                },
                primary: {
                    DEFAULT: "#10b981",
                    dark: "#34d399",
                },
            },
        },
    },
    plugins: [],
};