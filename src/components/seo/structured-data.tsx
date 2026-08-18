// Place at: src/components/seo/structured-data.tsx
// Render this once in src/app/layout.tsx, inside <body>, e.g.:
//   <body>
//     <StructuredData />
//     <SmoothScrollProvider>{children}</SmoothScrollProvider>
//     ...
//   </body>
//
// This is what lets Google show your address/phone/hours directly in
// search results, and is a strong ranking signal for local "map pack"
// results (the 3-listing map block that appears above normal results for
// searches like "waste management near me" or "waste management Penang").

export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://mt-smart.com/#organization",
    name: "MT Smart Industries Sdn Bhd",
    description:
      "Integrated waste and resource management solutions for industrial and construction sectors in Malaysia.",
    url: "https://mt-smart.com",
    telephone: "+60165417743",
    email: "naveshsaravanan@mtsmart-industries.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "37, Lrg Macang Indah 3, Tmn P'trian Macang Indah",
      addressLocality: "Bukit Mertajam",
      addressRegion: "Pulau Pinang",
      postalCode: "14000",
      addressCountry: "MY",
    },
    // Update these with your actual coordinates (look them up once on
    // Google Maps — right-click your pin → the lat/lng shown).
    geo: {
      "@type": "GeoCoordinates",
      latitude: "5.3644",
      longitude: "100.4593",
    },
    areaServed: {
      "@type": "State",
      name: "Pulau Pinang",
    },
    priceRange: "$$",
    image: "https://mt-smart.com/images/hero.png",
    sameAs: [
      // Add links to any social profiles / Google Business Profile /
      // LinkedIn page once they exist — each one strengthens this entity.
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}