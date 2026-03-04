

## Plan: Nieuwe "Marketing Dashboards" sectie in sidebar

### Wijziging: `src/components/dashboard/Sidebar.tsx`

1. **Import** `Megaphone` icoon uit lucide-react (past bij marketing thema)

2. **Nieuw nav-item** toevoegen tussen "Dashboards Peter-Jan" en "Super Admin" (na regel 118):
```tsx
{
  icon: Megaphone,
  label: "Marketing Dashboards",
  path: "/marketing",
  subItems: []
},
```

3. **Auto-expand logica**: voeg `isOnMarketingPage` check toe (vergelijkbaar met bestaande checks rond regel 156-160):
```tsx
const isOnMarketingPage = location.pathname.startsWith("/marketing");
```
En voeg deze toe aan de bestaande auto-expand useEffect.

De sectie is initieel leeg (geen sub-items) — klaar om later pagina's aan toe te voegen. De route `/marketing` hoeft nog niet in `App.tsx` geregistreerd te worden tot er daadwerkelijk een pagina is.

