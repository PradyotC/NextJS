// lib/schemas/newsapi.schema.ts
import { z } from "zod";

/**
 * Zod schema that mirrors your `types/newsapi.d.ts`.
 * Use `parse()` to validate (throws on invalid) or `safeParse()` to handle gracefully.
 */

export const NewsResultSchema = z.object({
  link: z.string().url().or(z.string()), // sometimes providers return not-perfect urls
  title: z.string(),

  ai_org: z.string().nullable().optional(),
  ai_tag: z.string().nullable().optional(),
  content: z.string().nullable().optional(),

  country: z.array(z.string()).nullable().optional(),
  creator: z.array(z.string()).nullable().optional(),

  pubDate: z.string().nullable().optional(),
  category: z.array(z.string()).nullable().optional(),
  datatype: z.string().nullable().optional(),
  keywords: z.array(z.string()).nullable().optional(),
  language: z.string().nullable().optional(),
  ai_region: z.string().nullable().optional(),
  duplicate: z.boolean().nullable().optional(),
  image_url: z.string().nullable().optional(),
  pubDateTZ: z.string().nullable().optional(),
  sentiment: z.string().nullable().optional(),

  source_id: z.string().nullable().optional(),
  video_url: z.string().nullable().optional(),
  ai_summary: z.string().nullable().optional(),
  article_id: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  source_icon: z.string().nullable().optional(),
  source_name: z.string().nullable().optional(),
  sentiment_stats: z.string().nullable().optional(),
  source_priority: z.number().nullable().optional(),
});

export const NewsApiResponseSchema = z.object({
  status: z.string(),
  results: z.array(NewsResultSchema),
  nextPage: z.string().nullable().optional(),
  totalResults: z.number().nullable().optional(),
});

export type NewsResultZ = z.infer<typeof NewsResultSchema>;
export type NewsApiResponseZ = z.infer<typeof NewsApiResponseSchema>;
