---
title: "Feature hooks"
description: "Export hooks that describe the feature instead of calling selectors in every component. Components then depend on intent, and you can change the state shape in one place."
---

## Wrap reads and actions

The example uses the notification store from [Seed and load data](/refract/data#load-data-into-the-store).

```ts
import { useMemo } from 'react'
import { useNotificationValue, useSetNotifications } from './notification-store'

export function useUnreadCount() {
  return useNotificationValue(state => state.items.filter(item => !item.read).length)
}

export function useNotificationActions() {
  const setState = useSetNotifications(false)
  return useMemo(() => ({
    markRead(id: string) {
      setState(draft => {
        const item = draft.items.find(entry => entry.id === id)
        if (item) item.read = true
      })
    },
    clear() {
      setState({ items: [] })
    },
  }), [setState])
}
```

The setter is stable for the life of the Provider, so `useMemo` keeps the actions object stable too. `useSetNotifications(false)` skips patch recording because these actions never revert; see [Optimistic updates with revert](/refract/rollback#skip-patch-recording).
