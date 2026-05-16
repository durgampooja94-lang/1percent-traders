// lib/bunny.ts
import crypto from 'crypto'

const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME!
const BUNNY_TOKEN_SECRET = process.env.BUNNY_TOKEN_SECRET!
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID!
const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY!

/**
 * Generate a signed Bunny.net CDN URL for a video
 * URL expires after `expiresInSeconds` (default 2 hours)
 */
export function generateSignedUrl(
  videoId: string,
  expiresInSeconds: number = 7200
): string {
  const expireTimestamp = Math.floor(Date.now() / 1000) + expiresInSeconds
  const videoPath = `/play/${videoId}/play.m3u8`

  // Bunny token: SHA256(token_secret + video_path + expire_timestamp)
  const hashableBase = `${BUNNY_TOKEN_SECRET}${videoPath}${expireTimestamp}`
  const token = crypto
    .createHash('sha256')
    .update(hashableBase)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return `https://${BUNNY_CDN_HOSTNAME}${videoPath}?token=${token}&expires=${expireTimestamp}`
}

/**
 * Get embed URL for Bunny.net video player (iframe embed)
 */
export function getBunnyEmbedUrl(videoId: string): string {
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`
}

/**
 * Get video thumbnail from Bunny.net
 */
export function getBunnyThumbnail(videoId: string): string {
  return `https://${BUNNY_CDN_HOSTNAME}/${videoId}/thumbnail.jpg`
}

/**
 * Fetch video details from Bunny.net Stream API
 */
export async function getBunnyVideoDetails(videoId: string) {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    {
      headers: {
        AccessKey: BUNNY_STREAM_API_KEY,
        accept: 'application/json',
      },
    }
  )
  if (!res.ok) return null
  return res.json()
}

/**
 * List all videos in the Bunny library
 */
export async function listBunnyVideos(page: number = 1, perPage: number = 100) {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos?page=${page}&itemsPerPage=${perPage}&orderBy=date`,
    {
      headers: {
        AccessKey: BUNNY_STREAM_API_KEY,
        accept: 'application/json',
      },
    }
  )
  if (!res.ok) return { items: [], totalItems: 0 }
  return res.json()
}

/**
 * Delete a video from Bunny.net
 */
export async function deleteBunnyVideo(videoId: string): Promise<boolean> {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    {
      method: 'DELETE',
      headers: { AccessKey: BUNNY_STREAM_API_KEY },
    }
  )
  return res.ok
}
