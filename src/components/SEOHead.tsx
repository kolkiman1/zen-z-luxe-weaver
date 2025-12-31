import { Helmet } from 'react-helmet-async';
import { useSeoSettings } from '@/hooks/useSiteSettings';

interface ProductStructuredData {
  name: string;
  description?: string;
  image?: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  sku?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
}

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
  };
  product?: {
    price?: number;
    currency?: string;
    availability?: 'in stock' | 'out of stock';
  };
  structuredData?: ProductStructuredData;
}

export const SEOHead = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noIndex = false,
  article,
  product,
  structuredData,
}: SEOHeadProps) => {
  const { data: seoSettings } = useSeoSettings();

  const siteName = seoSettings?.siteTitle?.split('|')[0]?.trim() || 'Gen-zee.store';
  const siteDescription = seoSettings?.siteDescription || 'Premium Fashion for the Next Generation';
  const siteKeywords = seoSettings?.keywords || 'premium fashion, luxury clothing';
  const canonicalBase = seoSettings?.canonicalUrl || 'https://gen-zee.store';
  const defaultImage = seoSettings?.ogImage || `${canonicalBase}/og-image.jpg`;
  const twitterHandle = seoSettings?.twitterHandle || '';

  const finalTitle = title ? `${title} | ${siteName}` : seoSettings?.siteTitle || `${siteName} | Premium Fashion`;
  const finalDescription = description || siteDescription;
  const finalKeywords = keywords ? `${keywords}, ${siteKeywords}` : siteKeywords;
  const finalImage = image || defaultImage;
  const finalUrl = url ? `${canonicalBase}${url}` : canonicalBase;

  // Generate JSON-LD structured data for products
  const generateProductSchema = () => {
    if (!structuredData) return null;

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: structuredData.name,
      description: structuredData.description || finalDescription,
      image: structuredData.image || finalImage,
      brand: {
        '@type': 'Brand',
        name: structuredData.brand || siteName,
      },
      offers: {
        '@type': 'Offer',
        price: structuredData.price,
        priceCurrency: structuredData.currency || 'BDT',
        availability: `https://schema.org/${structuredData.availability || 'InStock'}`,
        url: finalUrl,
      },
    };

    if (structuredData.sku) {
      schema.sku = structuredData.sku;
    }

    if (structuredData.rating && structuredData.reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: structuredData.rating,
        reviewCount: structuredData.reviewCount,
      };
    }

    return schema;
  };

  // Generate Organization schema for homepage
  const generateOrganizationSchema = () => {
    if (type !== 'website' || url) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: canonicalBase,
      logo: defaultImage,
      description: siteDescription,
    };
  };

  const productSchema = generateProductSchema();
  const orgSchema = generateOrganizationSchema();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={finalUrl} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph Tags */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="en_US" />
      
      {/* Article-specific OG tags */}
      {type === 'article' && article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
        </>
      )}
      
      {/* Product-specific OG tags */}
      {type === 'product' && product && (
        <>
          {product.price && (
            <meta property="product:price:amount" content={String(product.price)} />
          )}
          {product.currency && (
            <meta property="product:price:currency" content={product.currency} />
          )}
          {product.availability && (
            <meta property="product:availability" content={product.availability} />
          )}
        </>
      )}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#6366f1" />
      <meta name="format-detection" content="telephone=no" />

      {/* JSON-LD Structured Data */}
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
      {orgSchema && (
        <script type="application/ld+json">
          {JSON.stringify(orgSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;

