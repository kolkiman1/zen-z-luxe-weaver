import { useEffect } from 'react';
import { useTrackingSettings } from '@/hooks/useSiteSettings';

export const TrackingScripts = () => {
  const { data: trackingSettings } = useTrackingSettings();

  useEffect(() => {
    if (!trackingSettings) return;

    // Google Analytics
    if (trackingSettings.googleAnalyticsId && !document.getElementById('ga-script')) {
      const gaScript = document.createElement('script');
      gaScript.id = 'ga-script';
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${trackingSettings.googleAnalyticsId}`;
      document.head.appendChild(gaScript);

      const gaInlineScript = document.createElement('script');
      gaInlineScript.id = 'ga-inline-script';
      gaInlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${trackingSettings.googleAnalyticsId}');
      `;
      document.head.appendChild(gaInlineScript);
    }

    // Google Tag Manager
    if (trackingSettings.googleTagManagerId && !document.getElementById('gtm-script')) {
      const gtmScript = document.createElement('script');
      gtmScript.id = 'gtm-script';
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${trackingSettings.googleTagManagerId}');
      `;
      document.head.appendChild(gtmScript);

      // GTM noscript fallback
      if (!document.getElementById('gtm-noscript')) {
        const noscript = document.createElement('noscript');
        noscript.id = 'gtm-noscript';
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.googletagmanager.com/ns.html?id=${trackingSettings.googleTagManagerId}`;
        iframe.height = '0';
        iframe.width = '0';
        iframe.style.display = 'none';
        iframe.style.visibility = 'hidden';
        noscript.appendChild(iframe);
        document.body.insertBefore(noscript, document.body.firstChild);
      }
    }

    // Facebook Pixel
    if (trackingSettings.facebookPixelId && !document.getElementById('fb-pixel-script')) {
      const fbScript = document.createElement('script');
      fbScript.id = 'fb-pixel-script';
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${trackingSettings.facebookPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);

      // FB Pixel noscript fallback
      if (!document.getElementById('fb-pixel-noscript')) {
        const noscript = document.createElement('noscript');
        noscript.id = 'fb-pixel-noscript';
        const img = document.createElement('img');
        img.height = 1;
        img.width = 1;
        img.style.display = 'none';
        img.src = `https://www.facebook.com/tr?id=${trackingSettings.facebookPixelId}&ev=PageView&noscript=1`;
        noscript.appendChild(img);
        document.body.appendChild(noscript);
      }
    }
  }, [trackingSettings]);

  return null;
};
