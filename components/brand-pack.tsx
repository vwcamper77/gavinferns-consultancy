import Image from "next/image";

import { brandFormats as formats, brandPalette as palette, brandFiles } from "@/lib/site";

const themes = ["Light", "Dark"] as const;

export function BrandPackDownloads() {
  return <div className="actions">
    <a className="button" href="/brand-pack/gavin-ferns-brand-pack.zip" download>Download full ZIP</a>
    <a className="button button-outline" href="/gfc-logo.svg" download>Download GFC mark · SVG</a>
    <a className="button button-outline" href="/brand-pack/brand-guidelines.txt" download>Download brand guidelines</a>
  </div>;
}

export function BrandPackAssets() {
  return <>
    <section className="section container" aria-labelledby="brand-identity">
      <h2 id="brand-identity">One identity for consulting and coaching</h2>
      <p className="subcopy">G is Gavin, F is Ferns, and C is Coaching or Consulting. Keep the approved horizontal hexagons, blue progression and typography.</p>
      <div className="service-grid commercial-grid">{brandFiles.map(({ title, file, note }) => <article className="service-card" key={file}><h3>{title}</h3><p>{note}</p><a className="text-link" href={file} download>Download {title}</a></article>)}</div>
    </section>
    <section className="section container" aria-labelledby="brand-assets">
      <h2 id="brand-assets">Logos and social graphics</h2>
      <div className="brand-assets">
        {formats.map((format) => <article className="brand-asset" key={format.title}>
          <h3>{format.title}</h3>
          <p className="subcopy">{format.width} × {format.height} px · {format.type.toUpperCase()}</p>
          {"note" in format && <p className="brand-asset-note">{format.note}</p>}
          <div className="brand-variants">
            {themes.map((theme) => {
              const file = `/brand-pack/${format.file}-${theme.toLowerCase()}${"transparent" in format ? "-transparent" : ""}.${format.type}`;
              return <figure key={theme}>
                <div className="brand-preview">
                  <Image src={file} width={format.width} height={format.height} alt={`${format.title}, ${theme.toLowerCase()} version`} unoptimized />
                </div>
                <figcaption><a className="text-link" href={file} download aria-label={`Download ${theme.toLowerCase()} ${format.title}`}>{theme} · Download {format.type.toUpperCase()}</a>
                  {"svg" in format && format.svg && <> · <a className="text-link" href={`/brand-pack/${format.file}-${theme.toLowerCase()}.svg`} download>SVG</a></>}
                </figcaption>
              </figure>;
            })}
          </div>
        </article>)}
      </div>
    </section>
    <section className="section section-tint" aria-labelledby="brand-colours">
      <div className="container">
        <h2 id="brand-colours">Brand colours</h2>
        <p className="subcopy">Use Arial Bold for headings and Arial Regular for body copy, with Helvetica and sans-serif fallbacks. Leave at least a quarter of the mark’s height as clear space on all sides. Minimum mark width: 78 px digitally or 25 mm in print. Minimum full lockup: 300 px or 80 mm.</p>
        <ul className="brand-palette">
          {palette.map(({name, hex}) => <li key={name}>
            <span className="brand-swatch" style={{ backgroundColor: hex }} aria-hidden="true" />
            <span><strong>{name}</strong><br /><code>{hex}</code></span>
          </li>)}
        </ul>
        <p className="subcopy">Use the light lockup on light surfaces and the dark or white reversed version on uncluttered dark surfaces. Scale uniformly. Do not stretch, rotate, stack, crop, recolour or reorder the hexagons.</p>
        <p className="subcopy">Keep profile marks centred for circular crops. Story and Reel templates reserve space for platform controls; banners reserve space for profile images and mobile crops. Exact safe areas and messaging guidance are in the downloadable guidelines.</p>
        <p className="subcopy">Our tone is clear, commercially focused and approachable. Lead with practical action and profitability, distinguish revenue from profit, and support claims with evidence. Social handles stay the same.</p>
      </div>
    </section>
  </>;
}
