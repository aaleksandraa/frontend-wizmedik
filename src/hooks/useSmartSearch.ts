import { useState, useEffect, useCallback } from 'react';
import { specialtiesAPI } from '@/services/api';

interface SpecialtySearchData {
  id: number;
  naziv: string;
  slug: string;
  keywords: string[];
}

// Cache search data
let searchDataCache: SpecialtySearchData[] | null = null;
let searchDataPromise: Promise<SpecialtySearchData[]> | null = null;

async function loadSearchData(): Promise<SpecialtySearchData[]> {
  if (searchDataCache) return searchDataCache;
  if (searchDataPromise) return searchDataPromise;

  searchDataPromise = (async () => {
    try {
      const response = await specialtiesAPI.getSearchData();
      searchDataCache = response.data || [];
      return searchDataCache;
    } catch (error) {
      console.error('Error loading search data:', error);
      return [];
    }
  })();

  return searchDataPromise;
}

// Normalize text for comparison (remove diacritics, lowercase)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/ž/g, 'z')
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/š/g, 's');
}

export interface SmartSearchResult {
  type: 'specialty' | 'general';
  specialty?: SpecialtySearchData;
  redirect: string;
  matchedKeyword?: string;
}

export function useSmartSearch() {
  const [searchData, setSearchData] = useState<SpecialtySearchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSearchData().then((data) => {
      setSearchData(data);
      setLoading(false);
    });
  }, []);

  const search = useCallback((query: string): SmartSearchResult => {
    const normalizedQuery = normalizeText(query.trim());
    
    if (!normalizedQuery) {
      return { type: 'general', redirect: '/doktori' };
    }

    // First try exact match on naziv
    for (const spec of searchData) {
      const normalizedNaziv = normalizeText(spec.naziv);
      if (normalizedNaziv.includes(normalizedQuery) || normalizedQuery.includes(normalizedNaziv)) {
        return {
          type: 'specialty',
          specialty: spec,
          redirect: `/doktori/specijalnost/${spec.slug}`
        };
      }
    }

    // Then try slug match
    for (const spec of searchData) {
      if (spec.slug.includes(normalizedQuery) || normalizedQuery.includes(spec.slug)) {
        return {
          type: 'specialty',
          specialty: spec,
          redirect: `/doktori/specijalnost/${spec.slug}`
        };
      }
    }

    // Then try keyword match
    for (const spec of searchData) {
      for (const keyword of spec.keywords) {
        const normalizedKeyword = normalizeText(keyword);
        if (normalizedKeyword.includes(normalizedQuery) || normalizedQuery.includes(normalizedKeyword)) {
          return {
            type: 'specialty',
            specialty: spec,
            redirect: `/doktori/specijalnost/${spec.slug}`,
            matchedKeyword: keyword
          };
        }
      }
    }

    // No match - general search
    return {
      type: 'general',
      redirect: `/doktori?pretraga=${encodeURIComponent(query)}`
    };
  }, [searchData]);

  const getSuggestions = useCallback((query: string, limit = 5): SpecialtySearchData[] => {
    if (!query.trim()) return [];
    
    const normalizedQuery = normalizeText(query.trim());
    const results: { spec: SpecialtySearchData; score: number }[] = [];

    for (const spec of searchData) {
      let score = 0;
      const normalizedNaziv = normalizeText(spec.naziv);

      // Exact match on naziv
      if (normalizedNaziv === normalizedQuery) {
        score = 100;
      } else if (normalizedNaziv.startsWith(normalizedQuery)) {
        score = 80;
      } else if (normalizedNaziv.includes(normalizedQuery)) {
        score = 60;
      } else if (spec.slug.includes(normalizedQuery)) {
        score = 50;
      } else {
        // Check keywords
        for (const keyword of spec.keywords) {
          const normalizedKeyword = normalizeText(keyword);
          if (normalizedKeyword === normalizedQuery) {
            score = Math.max(score, 70);
          } else if (normalizedKeyword.startsWith(normalizedQuery)) {
            score = Math.max(score, 55);
          } else if (normalizedKeyword.includes(normalizedQuery)) {
            score = Math.max(score, 40);
          }
        }
      }

      if (score > 0) {
        results.push({ spec, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.spec);
  }, [searchData]);

  return { search, getSuggestions, loading, searchData };
}

// Preload search data at app startup
export async function preloadSearchData() {
  await loadSearchData();
}
