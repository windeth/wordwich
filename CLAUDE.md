# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wordible is a cross-platform mobile word game for Android and iOS. Players are given a criteria (e.g., letters, theme, or constraint) and must come up with the longest valid English dictionary word that satisfies it. Longer words score higher.

## Planned Tech Stack

- **Framework**: React Native with Expo (targets Android + iOS from one codebase)
- **Language**: TypeScript
- **Dictionary validation**: Server-side API or bundled word list (to be decided)
- **State management**: Zustand or React Context (to be decided)

## Architecture

- `app/` — Expo Router screens (file-based routing)
- `components/` — reusable UI components
- `game/` — core game logic: criteria generation, word validation, scoring
- `hooks/` — custom React hooks for game state and timers
- Word validation should be encapsulated behind a single `validateWord(word, criteria)` interface so the backing implementation (local list vs. API) can be swapped

## Key Domain Concepts

- **Criteria**: The constraint or prompt a player must satisfy with their word (e.g., "must contain the letter Q", "must be a verb")
- **Round**: A single turn — one criteria is shown, player submits a word, score is calculated
- **Score**: Based on word length; valid words only (must exist in English dictionary)

## Development Commands

> Update this section once the project is initialized.

```
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on Android emulator
npx expo run:android

# Run on iOS simulator
npx expo run:ios

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Run tests
npm test
npm test -- --testNamePattern="test name"  # run single test
```

## Environment Variables

> Add required env var names here (never values) as they are introduced.

```
EXPO_PUBLIC_API_URL=
```
