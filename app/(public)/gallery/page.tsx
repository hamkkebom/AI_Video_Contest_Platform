import { redirect } from 'next/navigation';

/**
 * /gallery → /gallery/all 리다이렉트
 */
export default function GalleryRedirect() {
  redirect('/gallery/all');
}
