import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { FileText } from 'lucide-react';

function Logo() {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid size-6 place-items-center rounded-[7px] bg-fd-foreground text-xs text-fd-background">k</span>
      khangle.dev <span className="font-normal text-fd-muted-foreground">/ docs</span>
    </span>
  );
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: <Logo />, url: '/' },
    githubUrl: 'https://github.com/khanglvm',
    links: [{ text: 'llms.txt', url: '/llms.txt', icon: <FileText />, external: true }],
    themeSwitch: { enabled: false },
  };
}
