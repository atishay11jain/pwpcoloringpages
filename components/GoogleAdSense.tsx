const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? '';

export default function GoogleAdSense() {
  if (!ADSENSE_ID) return null;

  // Use a plain <script> tag (not next/script) so it is present in the
  // server-rendered HTML and detectable by the AdSense crawler.
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
      crossOrigin="anonymous"
    />
  );
}
