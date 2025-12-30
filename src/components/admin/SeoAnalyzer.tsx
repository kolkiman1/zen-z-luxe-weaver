import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, AlertTriangle, RefreshCw, FileText, Image, Link, Type } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useSeoSettings } from '@/hooks/useSiteSettings';

interface SeoIssue {
  page: string;
  type: 'error' | 'warning' | 'success';
  category: 'title' | 'description' | 'image' | 'url' | 'content';
  message: string;
}

const categories = ['Men', 'Women', 'Jewelry', 'Accessories'];

export const SeoAnalyzer = () => {
  const [issues, setIssues] = useState<SeoIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const { products } = useProducts();
  const { data: seoSettings } = useSeoSettings();

  const analyzePages = () => {
    setIsAnalyzing(true);
    const newIssues: SeoIssue[] = [];

    // Analyze homepage
    if (!seoSettings?.siteTitle || seoSettings.siteTitle.length < 30) {
      newIssues.push({
        page: 'Homepage',
        type: 'warning',
        category: 'title',
        message: 'Site title is too short. Recommended: 50-60 characters.',
      });
    } else if (seoSettings.siteTitle.length > 60) {
      newIssues.push({
        page: 'Homepage',
        type: 'warning',
        category: 'title',
        message: 'Site title is too long. May be truncated in search results.',
      });
    } else {
      newIssues.push({
        page: 'Homepage',
        type: 'success',
        category: 'title',
        message: 'Site title length is optimal.',
      });
    }

    if (!seoSettings?.siteDescription || seoSettings.siteDescription.length < 120) {
      newIssues.push({
        page: 'Homepage',
        type: 'warning',
        category: 'description',
        message: 'Meta description is too short. Recommended: 150-160 characters.',
      });
    } else if (seoSettings.siteDescription.length > 160) {
      newIssues.push({
        page: 'Homepage',
        type: 'warning',
        category: 'description',
        message: 'Meta description is too long. May be truncated in search results.',
      });
    } else {
      newIssues.push({
        page: 'Homepage',
        type: 'success',
        category: 'description',
        message: 'Meta description length is optimal.',
      });
    }

    if (!seoSettings?.ogImage) {
      newIssues.push({
        page: 'Homepage',
        type: 'error',
        category: 'image',
        message: 'Missing Open Graph image. Social shares will lack visual appeal.',
      });
    } else {
      newIssues.push({
        page: 'Homepage',
        type: 'success',
        category: 'image',
        message: 'Open Graph image is configured.',
      });
    }

    if (!seoSettings?.canonicalUrl) {
      newIssues.push({
        page: 'Homepage',
        type: 'error',
        category: 'url',
        message: 'Missing canonical URL. May cause duplicate content issues.',
      });
    } else {
      newIssues.push({
        page: 'Homepage',
        type: 'success',
        category: 'url',
        message: 'Canonical URL is configured.',
      });
    }

    if (!seoSettings?.keywords || seoSettings.keywords.split(',').length < 5) {
      newIssues.push({
        page: 'Homepage',
        type: 'warning',
        category: 'content',
        message: 'Add more keywords. Recommended: 5-10 relevant keywords.',
      });
    } else {
      newIssues.push({
        page: 'Homepage',
        type: 'success',
        category: 'content',
        message: 'Keywords are configured.',
      });
    }

    // Analyze category pages
    categories.forEach((category) => {
      newIssues.push({
        page: `Category: ${category}`,
        type: 'success',
        category: 'title',
        message: `Category page has dynamic title: "${category} Collection"`,
      });
    });

    // Analyze product pages
    products?.forEach((product) => {
      if (!product.name || product.name.length < 20) {
        newIssues.push({
          page: `Product: ${product.name}`,
          type: 'warning',
          category: 'title',
          message: 'Product name is short. Consider a more descriptive title.',
        });
      }

      if (!product.description || product.description.length < 100) {
        newIssues.push({
          page: `Product: ${product.name}`,
          type: 'warning',
          category: 'description',
          message: 'Product description is too short. Add more details for better SEO.',
        });
      } else if (product.description.length > 300) {
        newIssues.push({
          page: `Product: ${product.name}`,
          type: 'success',
          category: 'description',
          message: 'Product has a detailed description.',
        });
      }

      if (!product.images || product.images.length === 0) {
        newIssues.push({
          page: `Product: ${product.name}`,
          type: 'error',
          category: 'image',
          message: 'Product is missing images. This hurts SEO and conversions.',
        });
      } else if (product.images.length < 3) {
        newIssues.push({
          page: `Product: ${product.name}`,
          type: 'warning',
          category: 'image',
          message: 'Consider adding more product images (3+ recommended).',
        });
      }

      if (!product.slug) {
        newIssues.push({
          page: `Product: ${product.name}`,
          type: 'error',
          category: 'url',
          message: 'Product is missing a URL slug.',
        });
      }
    });

    // Calculate score
    const errorCount = newIssues.filter((i) => i.type === 'error').length;
    const warningCount = newIssues.filter((i) => i.type === 'warning').length;
    const successCount = newIssues.filter((i) => i.type === 'success').length;
    const total = newIssues.length;
    const calculatedScore = Math.round(((successCount * 1 + warningCount * 0.5) / total) * 100);

    setScore(calculatedScore);
    setIssues(newIssues);
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getCategoryIcon = (category: SeoIssue['category']) => {
    switch (category) {
      case 'title':
        return <Type className="h-4 w-4" />;
      case 'description':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'url':
        return <Link className="h-4 w-4" />;
      case 'content':
        return <FileText className="h-4 w-4" />;
    }
  };

  const errorCount = issues.filter((i) => i.type === 'error').length;
  const warningCount = issues.filter((i) => i.type === 'warning').length;
  const successCount = issues.filter((i) => i.type === 'success').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SEO Analyzer</h3>
          <p className="text-sm text-muted-foreground">
            Analyze your pages for SEO issues and get recommendations.
          </p>
        </div>
        <Button onClick={analyzePages} disabled={isAnalyzing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </div>

      {score !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>SEO Score</span>
              <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={score} className="h-3" />
            <div className="mt-4 flex gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errorCount} Errors
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1 bg-yellow-500/20 text-yellow-600">
                  <AlertTriangle className="h-3 w-3" />
                  {warningCount} Warnings
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1 bg-green-500/20 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  {successCount} Passed
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {issues.map((issue, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${
                      issue.type === 'error'
                        ? 'border-red-500/30 bg-red-500/5'
                        : issue.type === 'warning'
                        ? 'border-yellow-500/30 bg-yellow-500/5'
                        : 'border-green-500/30 bg-green-500/5'
                    }`}
                  >
                    <div className="mt-0.5">
                      {issue.type === 'error' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : issue.type === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{issue.page}</span>
                        <Badge variant="outline" className="gap-1 text-xs">
                          {getCategoryIcon(issue.category)}
                          {issue.category}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{issue.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {issues.length === 0 && score === null && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">No Analysis Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Click "Run Analysis" to check your pages for SEO issues.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
