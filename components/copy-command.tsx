'use client';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

/** An install command with a copy button; the check mark confirms the copy for 1.5 s. */
export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex items-center gap-2 rounded-lg bg-fd-muted px-2.5 py-1.5 font-mono text-[12.5px]">
      <span className="text-fd-muted-foreground" aria-hidden>$</span>
      <code className="min-w-0 flex-1 truncate">{command}</code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : `Copy ${command}`}
        className="relative z-10 grid size-7 shrink-0 place-items-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-background hover:text-fd-foreground"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}
