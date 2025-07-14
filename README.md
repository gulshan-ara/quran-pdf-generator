# Quran PDF Generator

A web application to generate custom PDF documents containing selected Surahs (chapters) from the Holy Quran. Users can select multiple Surahs, customize the cover page, preview the PDF, and download it—all in a modern, user-friendly interface.

---

## Features

- **Select Multiple Surahs:** Choose any combination of Surahs to include in your PDF.
- **Customizable Cover Page:** Set the title of youe own.
- **PDF Preview:** Instantly preview the generated PDF before downloading.
- **Download PDF:** Generate and download a high-quality PDF with your selected content.
- **Modern UI:** Clean, responsive design built with React and Tailwind CSS.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [https://quran-pdf-generator.vercel.app/](https://quran-pdf-generator.vercel.app/) with your browser to see the app.

---

## Usage

1. **Select Surahs:** Use the Surah selector to pick one or more chapters from the Quran.
2. **Customize Cover Page:** Edit the title, subtitle, and toggle options for date and stats.
3. **Preview PDF:** Click the "Preview PDF" button to see a live preview.
4. **Download PDF:** When satisfied, click "Generate PDF" to download your custom document.

---

## Tech Stack

- [Next.js](https://nextjs.org/) (React framework)
- [React](https://react.dev/)
- [jsPDF](https://github.com/parallax/jsPDF) (PDF generation)
- [html2canvas](https://github.com/niklasvh/html2canvas) (HTML to image for cover page)
- [Tailwind CSS](https://tailwindcss.com/) (styling)

---

## Project Structure

- `src/app/` – Main app pages and API routes
- `src/components/` – UI components (Surah selector, preview modal, etc.)
- `src/services/` – Quran API service
- `src/utils/` – PDF and cover page generation logic
- `src/types/` – TypeScript types

---

## Credits

- Quran data powered by [quran.com API](https://api.quran.com/api/v4/)
- UI and PDF design by Gulshan Ara Nawshin

---

## License

This project is for educational and personal use. Please check with the author for redistribution or commercial use.
