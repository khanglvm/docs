---
title: "@khanglvm/react"
description: "React utilities for TypeScript apps in React or Next.js App Router, each one usable on its own."
---

- Shared state from [Refract](https://github.com/khanglvm/refract): a component rerenders only when the value it selected changes, nested updates are plain Immer draft assignments, and each update returns an undo function.
- Typed translations: dictionaries checked by the compiler, translator hooks, and instant language switching without a page reload.
- Async events between components that don't know each other, with typed answers.
- Helpers for deep equality, cloning, stable references and React children.

I built these to stop rewriting the same setup in every React project. The same designs run in production in two recruitment platforms, including a Next.js monorepo with more than ten feature packages. This package is their public, framework-neutral version.

## Pick a tool

| You need to | Use | Guide |
| --- | --- | --- |
| Share editable state across a feature, with selectors and optimistic updates | `createContextState` | [State](/react/state) |
| Translate UI text with compile-time checks and switch language instantly | `defineLocale`, `createTranslatorHook` | [Translations](/react/translation) |
| Notify or ask mounted components elsewhere in the app and collect their answers | `createEventMethod` | [Events](/react/events) |
| Compare, clone or cache values; pick slots from `children` | `@khanglvm/react/helpers` | [Helpers](/react/helpers) |
| Know what runs in server and client components | | [Next.js App Router](/react/nextjs) |

The utilities also fit together: the translation guide keeps the current language in a `createContextState` store.

Two small example apps run the same profile editor: typed translations with a language switcher, a store with an optimistic save that rolls back on failure, and an event that lets the editor veto a reset.

- [React with Vite](https://github.com/khanglvm/react/tree/50569105db54382fcffe8d2154742e6afc92a966/examples/react-vite)
- [Next.js App Router](https://github.com/khanglvm/react/tree/50569105db54382fcffe8d2154742e6afc92a966/examples/nextjs-app-router): language from a cookie, server-rendered text and metadata, server data seeding a client store.
