import Image from "next/image";

const formats = [
  { title: "Logo lockup", file: "logo", width: 1200, height: 360, type: "png", note: "For documents, slides and partner materials." },
  { title: "Instagram profile", file: "instagram-profile", width: 1080, height: 1080, type: "png", note: "Centred for Instagram’s circular crop." },
  { title: "Instagram square post", file: "instagram-square", width: 1080, height: 1080, type: "png" },
  { title: "Instagram portrait post", file: "instagram-portrait", width: 1080, height: 1350, type: "png" },
  { title: "Instagram Story", file: "instagram-story", width: 1080, height: 1920, type: "png" },
  { title: "Open Graph card", file: "open-graph", width: 1200, height: 630, type: "jpg", note: "For link previews on social and messaging platforms." },
] as const;

const themes = ["Light", "Dark"] as const;
const palette = [
  { name: "Navy", hex: "#07172D" },
  { name: "Ink", hex: "#0C1B32" },
  { name: "Blue", hex: "#1559CC" },
  { name: "Sky", hex: "#8BBAFF" },
  { name: "Light tint", hex: "#F3F7FC" },
  { name: "White", hex: "#FFFFFF" },
];

export function BrandPackDownloads() {
  return <div className="actions">
    <a className="button" href="/brand-pack/gavin-ferns-brand-pack.zip" download>Download full ZIP</a>
    <a className="button button-outline" href="/cgf-logo.svg" download>Download CGF mark · SVG</a>
  </div>;
}

export function BrandPackAssets() {
  return <>
    <section className="section container" aria-labelledby="brand-assets">
      <h2 id="brand-assets">Logos and social graphics</h2>
      <div className="brand-assets">
        {formats.map((format) => <article className="brand-asset" key={format.file}>
          <h3>{format.title}</h3>
          <p className="subcopy">{format.width} × {format.height} px · {format.type.toUpperCase()}</p>
          {"note" in format && <p className="brand-asset-note">{format.note}</p>}
          <div className="brand-variants">
            {themes.map((theme) => {
              const file = `/brand-pack/${format.file}-${theme.toLowerCase()}.${format.type}`;
              return <figure key={theme}>
                <div className="brand-preview">
                  <Image src={file} width={format.width} height={format.height} alt={`${format.title}, ${theme.toLowerCase()} version`} unoptimized />
                </div>
                <figcaption><a className="text-link" href={file} download aria-label={`Download ${theme.toLowerCase()} ${format.title}`}>{theme} · Download</a></figcaption>
              </figure>;
            })}
          </div>
        </article>)}
      </div>
    </section>
    <section className="section section-tint" aria-labelledby="brand-colours">
      <div className="container">
        <h2 id="brand-colours">Brand colours</h2>
        <p className="subcopy">Keep the logo’s proportions and leave space around it. Choose the version that gives the best contrast on your layout.</p>
        <ul className="brand-palette">
          {palette.map(({name, hex}) => <li key={name}>
            <span className="brand-swatch" style={{ backgroundColor: hex }} aria-hidden="true" />
            <span><strong>{name}</strong><br /><code>{hex}</code></span>
          </li>)}
        </ul>
      </div>
    </section>
  </>;
}
