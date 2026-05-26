# Savino – Support site (savino.no)

Jekyll-site for savino.no — markedsføringsside, blogg og personvernerklæring.

## Kjøre lokalt

Krever Ruby + Bundler. Installer avhengigheter første gang:

```bash
bundle install
```

Hent API-nøkkelen for vinanbefaling-pluginen (krever Firebase-tilgang):

```bash
firebase functions:secrets:access BLOG_API_KEY --project grapemate-f80e3
```

Start Jekyll med nøkkelen:

```bash
SAVINO_API_KEY=<nøkkelen> bundle exec jekyll serve
```

Åpne [http://localhost:4000](http://localhost:4000).

> Uten `SAVINO_API_KEY` bygger siden fint, men blogginnlegg viser ingen vinAnbefalinger.
> Hentede viner caches i `.jekyll-cache/wine_fetcher/` — neste bygg er raskere.

## Deploye til produksjon

Siden deployes automatisk via **GitHub Pages** når du pusher til `main`:

```bash
git push origin main
```

GitHub Pages kjører Jekyll og publiserer til [savino.no](https://savino.no) i løpet av ~1 minutt.

---

Har du spørsmål, feil eller tilbakemeldinger?
Kontakt oss på: hei@savino.no

# Personvernerklæring – Savino
Sist oppdatert: 5. november 2025

Savino gir vinanbefalinger basert på matretter brukeren skriver inn.

## Hvilke data behandles
Savino samler ikke inn navn, e-postadresse eller andre direkte identifiserende opplysninger.

Appen kan behandle følgende data for å fungere og forbedres:
- Søkehistorikk og klikk (bruksmønster) lagres anonymt i Google Firebase.
- En anonym app-/enhetsidentifikator kan brukes for å lagre preferanser uten å vite hvem brukeren er.

## Formål
Data brukes til:
- å forbedre vinanbefalingene
- å analysere bruk av appen og stabilitet

## Tredjeparter og databehandlere
Savino bruker Google Firebase som databehandler for drift og analyse. Vi selger ikke personopplysninger og deler ikke data til markedsføringsformål.

## Lagring og sikkerhet
Data lagres i Google Firebase. Kommunikasjon mellom appen og tjenestene er kryptert (HTTPS).

## Kontakt
Savino (privat utvikler)  
E-post: hei@savino.no
