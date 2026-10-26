import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { fontFamily: { sans: ['Inter', 'Arial', 'sans-serif'] }, colors: { ink: '#0b1422', blue: '#168bff' } } }, plugins: [] };
export default config;
