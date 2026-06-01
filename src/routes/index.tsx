        name: "description",
        content:
          "Browse a curated catalog of electronic devices with categories, descriptions, and primary applications.",
      },
      { property: "og:title", content: "Electronic Devices & Applications Catalog" },
      {
        property: "og:description",
        content: "Search, filter and explore 15+ modern electronic devices and their uses.",
      },
    ],
  }),
  component: CatalogPage,
});

type CategoryFilter = "All" | DeviceCategory;

function CatalogPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [sortAsc, setSortAsc] = useState(true);
  const [selected, setSelected] = useState<Device | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return devices
      .filter((d) => (category === "All" ? true : d.category === category))
      .filter((d) => (q ? d.name.toLowerCase().includes(q) : true))
      .sort((a, b) =>
        sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
      );
  }, [query, category, sortAsc]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-semibold leading-tight sm:text-lg">
              Electronic Devices & Applications Catalog
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Explore modern devices, their categories and primary uses.
            </p>
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {devices.length} devices
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Controls */}
        <section className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search devices by name..."
              className="pl-9"
              aria-label="Search devices"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setSortAsc((s) => !s)}
            className="justify-self-start sm:justify-self-end"
            aria-label="Toggle sort order"
          >
            {sortAsc ? (
              <>
                <ArrowDownAZ className="mr-2 h-4 w-4" /> A → Z
              </>
            ) : (
              <>
                <ArrowUpAZ className="mr-2 h-4 w-4" /> Z → A
              </>
            )}
          </Button>
        </section>

        {/* Category filter chips */}
        <section className="mb-8 flex flex-wrap gap-2">
          {(["All", ...CATEGORIES] as CategoryFilter[]).map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={
                  "rounded-full border px-3 py-1.5 text-sm transition-colors " +
                  (active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground")
                }
              >
                {c}
              </button>
            );
          })}
        </section>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            No devices match your search.
          </div>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((device) => {
              const Icon = device.icon;
              return (
                <article
                  key={device.id}
                  className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline">{device.category}</Badge>
                  </div>
                  <h2 className="text-lg font-semibold">{device.name}</h2>
                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                    {device.description}
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-5"
                    onClick={() => setSelected(device)}
                  >
                    View applications
                  </Button>
                </article>
              );
            })}
          </section>
        )}
      </main>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <selected.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline">{selected.category}</Badge>
                </div>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>{selected.description}</DialogDescription>
              </DialogHeader>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Primary applications</h3>
                <ul className="space-y-2">
                  {selected.applications.map((app) => (
                    <li
                      key={app}
                      className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {app}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Built with React, TanStack Start & Tailwind CSS
      </footer>
    </div>
  );
}
