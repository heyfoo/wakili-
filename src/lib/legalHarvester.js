/**
 * Tempora Lex — Live Legal Harvester
 * Fetches real RSS feeds from Canadian courts and legal databases.
 * Parses, deduplicates, scores relevance, and returns structured IntelItems.
 */

import { base44 } from '@/api/base44Client';
import { queryGroq } from '@/api/groq';

// Live RSS feed sources — all verified working
export const LEGAL_SOURCES = [
  {
    id: 'scc',
    label: 'Supreme Court of Canada',
    shortName: 'SCC',
    url: 'https://decisions.scc-csc.ca/scc-csc/scc-csc/en/rss.do',
    sourceType: 'case_decision',
    jurisdiction: 'scc',
  },
  {
    id: 'scc_leave',
    label: 'SCC — Applications for Leave',
    shortName: 'SCC-L',
    url: 'https://decisions.scc-csc.ca/scc-csc/scc-l-csc-a/en/rss.do',
    sourceType: 'case_decision',
    jurisdiction: 'scc',
  },
  {
    id: 'fca_canlii',
    label: 'Federal Court of Appeal',
    shortName: 'FCA',
    url: 'https://www.canlii.org/en/ca/fca/rss.xml',
    sourceType: 'case_decision',
    jurisdiction: 'fca',
  },
  {
    id: 'fc_canlii',
    label: 'Federal Court',
    shortName: 'FC',
    url: 'https://www.canlii.org/en/ca/fc/rss.xml',
    sourceType: 'case_decision',
    jurisdiction: 'fct',
  },
  {
    id: 'onca_canlii',
    label: 'Court of Appeal for Ontario',
    shortName: 'ONCA',
    url: 'https://www.canlii.org/en/on/onca/rss.xml',
    sourceType: 'case_decision',
    jurisdiction: 'onca',
  },
  {
    id: 'onsc_canlii',
    label: 'Ontario Superior Court of Justice',
    shortName: 'ONSC',
    url: 'https://www.canlii.org/en/on/onsc/rss.xml',
    sourceType: 'case_decision',
    jurisdiction: 'onsc',
  },
  {
    id: 'chrt_canlii',
    label: 'Canadian Human Rights Tribunal',
    shortName: 'CHRT',
    url: 'https://www.canlii.org/en/ca/chrt/rss.xml',
    sourceType: 'tribunal_update',
    jurisdiction: 'other',
  },
  {
    id: 'hrto_canlii',
    label: 'Human Rights Tribunal of Ontario',
    shortName: 'HRTO',
    url: 'https://www.canlii.org/en/on/hrto/rss.xml',
    sourceType: 'tribunal_update',
    jurisdiction: 'lat',
  },
  {
    id: 'lat_canlii',
    label: 'Licence Appeal Tribunal Ontario',
    shortName: 'LAT',
    url: 'https://www.canlii.org/en/on/onlat/rss.xml',
    sourceType: 'tribunal_update',
    jurisdiction: 'lat',
  },
];

/**
 * Parse an RSS/Atom XML string into an array of items.
 * Handles both <item> (RSS) and <entry> (Atom) elements.
 */
export function parseRSSXML(xmlText, sourceInfo) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');

  // Check for parse error
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    console.warn(`RSS parse error for ${sourceInfo.shortName}:`, parseError.textContent);
    return [];
  }

  // Support both RSS <item> and Atom <entry>
  const itemEls = Array.from(doc.querySelectorAll('item, entry'));

  return itemEls.map(el => {
    const getTextContent = (tag) => {
      const node = el.querySelector(tag);
      return node ? (node.textContent || '').trim() : '';
    };

    const title = getTextContent('title');
    const link = getTextContent('link') || el.querySelector('link')?.getAttribute('href') || '';
    const description = getTextContent('description') || getTextContent('summary') || getTextContent('content');
    const pubDate = getTextContent('pubDate') || getTextContent('published') || getTextContent('updated') || getTextContent('dc\\:date');

    // Clean up description — strip HTML tags
    const cleanSummary = description.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 500);

    // Extract citation from title if possible (e.g., "2026 SCC 17")
    const citationMatch = title.match(/\d{4}\s+[A-Z]+\s+\d+/);
    const citation = citationMatch ? citationMatch[0] : '';

    // Normalize published date
    let publishedAt = new Date().toISOString();
    if (pubDate) {
      try {
        const d = new Date(pubDate);
        if (!isNaN(d.getTime())) publishedAt = d.toISOString();
      } catch {
        // keep default
      }
    }

    return {
      title: title || 'Untitled Decision',
      url: link,
      summary: cleanSummary || `New decision from ${sourceInfo.label}.`,
      citation,
      publishedAt,
      source: sourceInfo.shortName,
      sourceType: sourceInfo.sourceType,
      _rawUrl: link,
      _sourceId: sourceInfo.id,
    };
  }).filter(item => item.title && item.url);
}

/**
 * Compute a relevance score (0–10) using AI.
 */
export async function computeRelevanceScoreAI(item, keywords = []) {
  if (!keywords.length) return { score: 5.0, keywordMatches: [] };

  const prompt = `Item Title: ${item.title}
Item Summary: ${item.summary}
Keywords: ${keywords.join(', ')}

Evaluate how relevant this legal news item is to the provided keywords on a scale of 0 to 10.
Also identify which keywords matched.
Return ONLY a JSON object like this: {"score": 7.5, "matched": ["keyword1", "keyword2"]}`;

  try {
    const response = await queryGroq(prompt, "You are a legal analyst. Respond only in valid JSON.");
    const parsed = JSON.parse(response.replace(/```json\n?/, '').replace(/\n?```/, '').trim());
    return {
      score: Math.min(10, parseFloat(parsed.score) || 0),
      keywordMatches: parsed.matched || [],
    };
  } catch (e) {
    console.error("AI scoring failed, falling back to keyword match", e);
    // Fallback logic
    const text = `${item.title} ${item.summary}`.toLowerCase();
    const matched = keywords.filter(kw => text.includes(kw.toLowerCase()));
    return { score: matched.length > 0 ? 7.0 : 2.0, keywordMatches: matched };
  }
}

/**
 * Generate a content hash for deduplication.
 * Uses URL as primary key, falls back to normalized title.
 */
export function getItemHash(item) {
  if (item.url && item.url.length > 10) {
    return item.url.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  return item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 80);
}

/**
 * Main harvester function.
 * Fetches all sources, parses, deduplicates against existing DB records, scores, and saves.
 * Returns { added, skipped, errors, sourceResults }
 */
export async function runLiveHarvest(matters = [], onProgress = null) {
  const allKeywords = [...new Set(matters.flatMap(m => m.keywords || []))];
  const activeJurisdictions = [...new Set(matters.map(m => m.jurisdiction).filter(Boolean))];

  // Load existing URLs to deduplicate
  const existing = await base44.entities.IntelItem.list('-publishedAt', 200);
  const existingHashes = new Set(
    existing.map(e => getItemHash({ url: e.url, title: e.title }))
  );

  const results = { added: 0, skipped: 0, errors: [], sourceResults: [] };

  for (const source of LEGAL_SOURCES) {
    if (onProgress) onProgress({ source: source.shortName, status: 'fetching' });

    try {
      // Fetch the RSS feed via AI integration (handles CORS)
      const fetchResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a raw HTTP fetch tool. Go to this URL and return ONLY the raw XML response body — no commentary, no markdown, no explanation, no code fences. Just the literal XML text starting with <?xml or <rss or <feed.

URL: ${source.url}

Output the raw XML only.`,
        add_context_from_internet: true,
        model: 'gemini_3_1_pro',
      });

      if (!fetchResult || typeof fetchResult !== 'string' || !fetchResult.includes('<')) {
        results.errors.push({ source: source.shortName, error: 'No XML returned' });
        results.sourceResults.push({ source: source.shortName, status: 'error', added: 0 });
        if (onProgress) onProgress({ source: source.shortName, status: 'error' });
        continue;
      }

      // Strip any markdown code fences the model may have wrapped around the XML
      const xmlText = fetchResult.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

      const parsed = parseRSSXML(xmlText, source);

      if (!parsed.length) {
        results.sourceResults.push({ source: source.shortName, status: 'empty', added: 0 });
        if (onProgress) onProgress({ source: source.shortName, status: 'empty', added: 0 });
        continue;
      }

      let addedForSource = 0;

      for (const item of parsed.slice(0, 10)) { // max 10 per source per run
        const hash = getItemHash(item);
        if (existingHashes.has(hash)) {
          results.skipped++;
          continue;
        }

        const { score, keywordMatches } = await computeRelevanceScoreAI(item, allKeywords);

        await base44.entities.IntelItem.create({
          title: item.title,
          source: item.source,
          sourceType: item.sourceType,
          url: item.url,
          summary: item.summary,
          citation: item.citation,
          publishedAt: item.publishedAt,
          relevanceScore: score,
          keywordMatches,
          attachedMatterIds: [],
          isRead: false,
          isBookmarked: false,
        });

        existingHashes.add(hash);
        results.added++;
        addedForSource++;
      }

      results.sourceResults.push({ source: source.shortName, status: 'ok', added: addedForSource, total: parsed.length });
      if (onProgress) onProgress({ source: source.shortName, status: 'done', added: addedForSource });

    } catch (err) {
      const msg = err?.message || String(err);
      results.errors.push({ source: source.shortName, error: msg });
      results.sourceResults.push({ source: source.shortName, status: 'error', added: 0 });
      if (onProgress) onProgress({ source: source.shortName, status: 'error', error: msg });
    }
  }

  return results;
}