import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { SidebarRepoLink } from "@/components/sidebar-repo-link";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/">) {
  // With the theme switch off, Fumadocs puts githubUrl alone in a wide bordered box that reads as
  // empty, so the docs sidebar drops it for a labelled link to the current library's repo.
  const { githubUrl: _unused, ...options } = baseOptions();
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...options}
      sidebar={{ footer: <SidebarRepoLink /> }}
    >
      {children}
    </DocsLayout>
  );
}
