// Site-wide constants shared by pages, routes and the agent files.
import siteConfig from '@/libraries.json';

export const site = siteConfig.site;
export const appName = site.title;
// Pages live at the site root (docs.khangle.dev/<library>/<page>); the home page is the hub.
export const docsRoute = '/';
