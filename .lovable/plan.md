

## Fix: Whitespace verminderen onder insights bar

De `AnimatedCard` met selector + insights heeft `mb-6` (24px) als margin-bottom. Dit reduceren naar `mb-3` (12px).

### Wijziging in `src/pages/VergelijkingOverview.tsx`

**Regel 46**: `mb-6` → `mb-3`

```tsx
<AnimatedCard delay={50} className="mb-3 p-4 h-auto">
```

Daarnaast de interne `my-3` divider (regel 71) verkleinen naar `my-2` om ook de ruimte tussen selector-rij en insights-rij te verkleinen.

