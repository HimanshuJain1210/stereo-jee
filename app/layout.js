export const metadata = {
  title: 'StereoJEE — Stereoisomerism Complete Guide',
  description: 'Master Stereoisomerism for JEE Mains & Advanced — Interactive visualizations, Newman projections, R/S calculator, and practice questions.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{margin:0,padding:0}}>{children}</body>
    </html>
  )
}
