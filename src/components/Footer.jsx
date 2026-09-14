import { Github, Linkedin, Globe } from 'lucide-react';

/**
 * Footer — Deep Atmosphere background, glass-styled.
 * Keeps developer links from the original.
 */
export default function Footer() {
  return (
    <footer className="mt-8 border-t border-white/10 bg-transparent">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between">
        <p className="font-body text-micro text-cloud-white/75">
          © {new Date().getFullYear()} SuMo Weather — Crafted by Abdul Ahad
        </p>

        <div className="flex items-center gap-3">
          <a
            href="https://ahad-dev.web.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 text-cloud-white/75 transition-colors hover:bg-white/10 hover:text-cloud-white"
            aria-label="Portfolio website"
          >
            <Globe size={18} />
          </a>
          <a
            href="https://github.com/Iam-abdulahad"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 text-cloud-white/75 transition-colors hover:bg-white/10 hover:text-cloud-white"
            aria-label="GitHub profile"
          >
            <Github size={18} />
          </a>
          <a
            href="https://www.linkedin.com/in/iam-abdulahad"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 text-cloud-white/75 transition-colors hover:bg-white/10 hover:text-cloud-white"
            aria-label="LinkedIn profile"
          >
            <Linkedin size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
