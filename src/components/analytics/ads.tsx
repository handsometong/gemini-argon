// Google AdSense — the account <meta> tag plus the adsbygoogle loader,
// rendered as native head elements (not next/script). React 19 hoists the
// <meta> and async <script> into <head> so they land in the SSR HTML directly
// and are visible to the AdSense crawler in View Source. `code` is the
// publisher ID (e.g. "ca-pub-XXXXXXXXXXXXXXXX").
export function Ads({ code }: { code: string }) {
  if (!code) return null;
  return (
    <>
      <meta name="google-adsense-account" content={code} />
      {/* async={true} flags this to React 19 as a hoistable resource —
          see google-analytics.tsx for the full rationale. */}
      <script
        id="adsbygoogle-loader"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${code}`}
        crossOrigin="anonymous"
      />
    </>
  );
}
// Adsterra global ad script. Kept as a native script tag so the provider
// receives the exact attributes from its dashboard snippet.
export function Adsterra() {
  return (
    <script
      id="adsterra-loader"
      data-cfasync="false"
      src="https://bauval.org/14/87f44b86551efb928c0582766f34f868"
    />
  );
}
