
# Consultant submenu inklapbaar maken

## Probleem

Klikken op "Consultant" in de sidebar navigeert alleen naar de route maar klapt het submenu niet in/uit. Daarnaast forceert `effectiveExpandedItems` het submenu open wanneer je op een consultant-pagina bent, waardoor handmatig inklappen onmogelijk is.

## Oplossing

**Bestand: `src/components/dashboard/Sidebar.tsx`**

1. **`handleNavClick` aanpassen**: Voor items met subItems wordt niet genavigeerd maar alleen het submenu getoggled (expand/collapse). Dit is het verwachte gedrag: de parent-knop fungeert als toggle, de sub-items navigeren.

2. **Handmatige collapse respecteren**: Een `manuallyCollapsed` state toevoegen. Wanneer een gebruiker een item handmatig inklapt, wordt dat onthouden. De `effectiveExpandedItems` logica checkt of een item niet handmatig is ingeklapt voordat het automatisch wordt uitgevouwen.

3. **Chevron-icoon**: De aparte `onClick` op het chevron-icoon wordt overbodig omdat de hele knop nu togglet. Het chevron blijft puur visueel.

## Technisch detail

- `handleNavClick`: Als `item.subItems` bestaat, toggle `expandedItems` en update `manuallyCollapsed`. Anders: navigeer.
- `effectiveExpandedItems`: Alleen auto-expanden als het item NIET in `manuallyCollapsed` zit.
- Bij navigatie naar een andere sectie wordt `manuallyCollapsed` gereset voor die sectie.
