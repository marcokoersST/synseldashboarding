

# Fix: Tekst te klein, spacing te krap, overflow kapot in niet-Inschrijvingen kolommen

## Oorzaak

De niet-Inschrijvingen kolommen (Acquisities, Gesprekken, Intakes, Plaatsingen, Niet begonnen) hebben twee problemen:

1. **Top 3 vreet hoogte op** — De top 3 entries worden buiten `AutoColumnsWrapper` gerenderd met grote styling (`py-2`, `text-base`). Dit laat minder hoogte over voor de rest, waardoor de wrapper sneller naar compressie springt.

2. **Compressiemodus is extreem** — Wanneer 2 kolommen niet passen, wordt `text-[9px]`, `py-0`, `gap-0.5` toegepast. Dit is onleesbaar.

3. **Inline clamp override** — Regel 119 forceert `fontSize: clamp(9px, 1.1vw, 11px)` op namen, wat op smalle kolommen naar 9px zakt.

## Wijzigingen

**File: `src/pages/TVRanglijsten.tsx`**

### 1. EntryRow naam-fontgrootte (regel 115-120)
Verwijder de inline `fontSize: clamp(...)` style voor niet-top3 entries. Laat Tailwind `text-xs` (12px) het werk doen — consistent met Inschrijvingen.

```tsx
// Before:
style={{ 
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: isTop3 ? undefined : "clamp(9px, 1.1vw, 11px)"
}}

// After:
style={{ 
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}}
```

### 2. Lichte compressie in AutoColumnsWrapper (regels 186, 194)
Vervang de extreme compressie (`py-0`, `text-[9px]`) door lichte compressie:

```tsx
// Before:
className={layout.compressed ? "[&>div]:py-0 [&>div]:gap-0.5 [&>div]:text-[9px]" : ""}

// After:
className={layout.compressed ? "[&>div]:py-px [&>div]:gap-0.5 [&>div]:text-[10px]" : ""}
```

Op beide plekken (col1 en col2).

### Resultaat
- Rank 4+ entries krijgen dezelfde leesbare `text-xs` als Inschrijvingen
- Overflow naar kolom 2 werkt identiek aan Inschrijvingen
- Bij extreme overflow: lichte compressie (10px, minimale padding) in plaats van onleesbare 9px/geen padding

