

# Increase two-column threshold

The threshold `rest.length > 20` is too low. With 2 units selected, there are likely 25-35 entries which triggers two columns unnecessarily.

### Change in `src/pages/TVRanglijsten.tsx` (line 318)

Change the threshold from `20` to a higher value that better matches the available vertical space in TV mode (~35-40 rows fit in a full-height column):

```tsx
// line 318: raise threshold so columns only split when truly overflowing
const needsTwoColumns = rest.length > 35;
```

This ensures entries fill one column first before splitting into two, matching the "doorschuif" behavior for 2+ units.

