import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

export const revalidate = false;

// Static export: the index is written at build time and searched in the browser.
export const { staticGET: GET } = createFromSource(source, { language: 'english' });
