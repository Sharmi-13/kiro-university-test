/**
 * Content item input validation schemas.
 *
 * Feature: link2skill-platform
 * Task 9.1: POST /api/tutor/content, content creation validation
 * Requirements: 6.1, 6.2, 6.3, 6.5
 */

import { z } from "zod";
import { SUPPORTED_LANGUAGES, SUPPORTED_SKILL_LEVELS } from "@/lib/profiles/validation";

export const CONTENT_TYPES = ["Post", "Video_Lesson"] as const;
export type ContentTypeValue = (typeof CONTENT_TYPES)[number];

// YouTube URL pattern from the spec (Task 9.1)
const YOUTUBE_PATTERN =
  /^https?:\/\/(www\.)?(youtube\.com\/watch\?\S*v=|youtu\.be\/)[A-Za-z0-9_-]{11}/;

export const contentTitleSchema = z
  .string()
  .min(1, "Title is required")
  .max(150, "Title must be at most 150 characters");

export const contentBodySchema = z
  .string()
  .min(1, "Body is required")
  .max(2000, "Body must be at most 2000 characters");

export const youtubeUrlSchema = z
  .string()
  .regex(YOUTUBE_PATTERN, "Please enter a valid YouTube video URL");

export const subjectTagSchema = z
  .string()
  .min(1, "Subject tag is required")
  .max(100, "Subject tag must be at most 100 characters");

export const contentCreateSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("Post"),
      title: contentTitleSchema,
      body: contentBodySchema,
      subject_tag: subjectTagSchema,
      language_tag: z.enum(SUPPORTED_LANGUAGES),
      skill_level: z.enum(SUPPORTED_SKILL_LEVELS),
    }),
    z.object({
      type: z.literal("Video_Lesson"),
      title: contentTitleSchema,
      body: z.string().max(2000).optional(),
      video_url: youtubeUrlSchema,
      subject_tag: subjectTagSchema,
      language_tag: z.enum(SUPPORTED_LANGUAGES),
      skill_level: z.enum(SUPPORTED_SKILL_LEVELS),
    }),
  ]);

export type ContentCreateInput = z.infer<typeof contentCreateSchema>;
