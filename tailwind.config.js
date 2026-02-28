/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0e0e0e",
                foreground: "#eaeaea",
                accent: "#8b0000",
                dimmed: "#444444"
            },
            fontFamily: {
                heading: ["Inter", "sans-serif"],
                body: ["Inter", "sans-serif"], // We can configure fine typography later
            }
        },
    },
    plugins: [],
}
