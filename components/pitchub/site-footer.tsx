export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="font-medium">Pitchub</p>
            <p className="text-sm text-muted-foreground">© 2025 Pitchub. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a className="hover:underline underline-offset-4" href="mailto:hello@pitchub.com">
              Contact: hello@pitchub.com
            </a>
            <nav className="flex items-center gap-4">
              <a
                className="text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                LinkedIn
              </a>
              <a
                className="text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                Twitter
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
