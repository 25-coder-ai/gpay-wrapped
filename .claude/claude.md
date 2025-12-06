# GPay Wrapped - Project Context for Claude

## Project Overview

GPay Wrapped is a privacy-first web application that analyzes Google Pay transaction history and generates personalized financial insights in a Spotify Wrapped-style story format. The app processes Google Takeout ZIP files entirely in the browser without any server-side processing.

## Key Architecture Principles

### 1. Privacy-First Design
- **Client-side only**: All data processing happens in the browser
- **No network calls**: No data sent to external servers
- **Temporary storage**: Data stored in sessionStorage, cleared on tab close
- **No tracking**: No analytics, cookies, or third-party scripts

### 2. Tech Stack
- **React 19** with TypeScript for type safety
- **Vite** for fast build tooling
- **Zustand** for lightweight state management
- **React Router** for navigation
- **JSZip** for extracting Google Takeout files
- **PapaParse** for CSV parsing
- **html2canvas** for generating shareable images
- **Tailwind CSS** for styling

## Project Structure

```
src/
├── components/
│   ├── upload/
│   │   └── DropZone.tsx          # File upload interface
│   └── story/                     # Story mode components (to be built)
├── pages/
│   ├── Landing.tsx                # Upload page with drag-drop
│   ├── Processing.tsx             # Data processing/loading page
│   └── Story.tsx                  # Main story display (WIP)
├── stores/
│   └── dataStore.ts               # Zustand store for app state
├── types/
│   ├── data.types.ts              # Core data structures
│   ├── insight.types.ts           # Insight definitions
│   ├── storage.types.ts           # Store types
│   └── export.types.ts            # Export format types
├── utils/
│   ├── zipParser.ts               # ZIP extraction logic
│   ├── csvParser.ts               # CSV parsing with PapaParse
│   ├── jsonParser.ts              # JSON parsing & validation
│   └── currencyUtils.ts           # Currency parsing (INR/USD)
└── App.tsx                        # Root component with routing
```

## Data Flow

1. **Upload** (Landing.tsx)
   - User uploads Google Takeout ZIP file
   - File validation happens client-side
   - Navigate to Processing page with file state

2. **Extraction** (Processing.tsx)
   - Extract ZIP using JSZip
   - Find relevant Google Pay files:
     - `Google transactions/transactions_*.csv`
     - `Google Pay/Group expenses/Group expenses.json`
     - `Google Pay/Rewards earned/Cashback rewards.csv`
     - `Google Pay/Rewards earned/Voucher rewards.json`

3. **Parsing**
   - Parse CSV files with PapaParse
   - Parse JSON files with custom parser
   - Handle Google's anti-XSSI prefix: `)]}'\n`
   - Convert to typed TypeScript objects

4. **Storage**
   - Store parsed data in Zustand store
   - Keep in sessionStorage for session persistence
   - Data cleared when tab closes

5. **Insights** (Phase 2 - To be built)
   - Calculate 8-10 personalized insights
   - Year filtering (2025 / All Time)
   - Generate insight messages

6. **Story Mode** (Phase 3 - To be built)
   - Swipeable card interface
   - Sequential reveal of insights
   - Navigation controls

7. **Export** (Phase 4 - To be built)
   - Generate shareable images with html2canvas
   - Multiple formats: Instagram (1080x1080), Story (1080x1920), Twitter (1200x675)

## Data Structures

### Transaction
```typescript
interface Transaction {
  time: Date;
  id: string;
  description: string;
  product: string;
  method: string;
  status: string;
  amount: Currency;
}
```

### Group Expense
```typescript
interface GroupExpense {
  creationTime: Date;
  creator: string;
  groupName: string;
  totalAmount: Currency;
  state: 'ONGOING' | 'COMPLETED' | 'CLOSED';
  title: string;
  items: GroupExpenseItem[];
}
```

### Currency
```typescript
interface Currency {
  value: number;
  currency: 'INR' | 'USD';
}
```

## Planned Insights (8-10 total)

1. **Domain Collector**: Track domain purchases and renewals
2. **Group Expense Champion**: Reliability score in paying group bills
3. **Voucher Hoarder**: Expired vs active vouchers
4. **Spending Timeline**: First to last transaction timeline
5. **Split Partner**: Most frequent bill-splitting friend
6. **Reward Hunter**: Total cashback earned
7. **Expensive Day**: Biggest spending day
8. **Responsible One**: Group expenses organized
9. **Money Network**: Unique people and groups
10. **Recurring Rituals**: Pattern recognition in transactions

## Implementation Status

### Phase 1: Foundation & Data Pipeline ✅
- [x] Project setup with Vite + React + TypeScript
- [x] Landing page with drag-drop upload
- [x] ZIP extraction (zipParser.ts)
- [x] CSV parsing (csvParser.ts)
- [x] JSON parsing (jsonParser.ts)
- [x] Currency parsing (currencyUtils.ts)
- [x] Zustand store setup
- [x] Processing page with data flow
- [x] Basic Story page (displays data counts)

### Phase 2: Insight Calculation Engine (Next)
- [ ] Implement insight engine
- [ ] Build 8-10 calculator modules
- [ ] Year filtering logic
- [ ] Insight generation

### Phase 3: Story Mode UI
- [ ] Swipeable card interface
- [ ] Individual insight components
- [ ] Navigation controls
- [ ] Progress indicator
- [ ] Year filter toggle

### Phase 4: Image Generation
- [ ] html2canvas integration
- [ ] Template system for formats
- [ ] Export functionality
- [ ] Format selector UI

### Phase 5: Polish & Production
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Performance optimization
- [ ] Cross-browser testing

## Development Guidelines

### When Working on This Project

1. **Maintain Privacy**: Never add any network calls or external dependencies that could leak data
2. **Type Safety**: Use TypeScript strictly, avoid `any` types
3. **Performance**: Process large datasets efficiently (1000+ transactions)
4. **Error Handling**: Handle missing/corrupted files gracefully
5. **Responsive Design**: Work on mobile and desktop
6. **Offline-First**: Entire app must work without internet after initial load

### Common Tasks

#### Adding a New Insight
1. Define insight type in `types/insight.types.ts`
2. Create calculator in `engines/calculators/`
3. Add to insight engine orchestrator
4. Create display component in `components/insights/`
5. Add to story mode rotation

#### Parsing New Data Types
1. Define interface in `types/data.types.ts`
2. Add parser in `utils/`
3. Update `zipParser.ts` to extract file
4. Update Zustand store to hold parsed data
5. Add to `ParsedData` interface

#### Adding Export Format
1. Define format in `types/export.types.ts`
2. Create template in `components/export/templates/`
3. Update ImageGenerator logic
4. Add to format selector UI

## File Naming Conventions

- **Components**: PascalCase (e.g., `DropZone.tsx`)
- **Utilities**: camelCase (e.g., `zipParser.ts`)
- **Types**: camelCase with `.types.ts` suffix
- **Stores**: camelCase with `Store` suffix

## Testing Strategy

- Test with real Google Takeout exports
- Test with missing/optional files
- Test with empty datasets
- Test with large datasets (1000+ transactions)
- Test year filtering edge cases
- Test on multiple browsers and devices

## Known Limitations

- Only supports Google Pay data format
- Requires Google Takeout export
- Limited to browser's memory capacity
- No data persistence across sessions
- English language only (currently)

## Future Enhancements

- AI-generated personalized narratives using local LLMs
- More insight types
- Dark mode support
- Multi-language support
- PDF export option
- Year-over-year comparisons

## Debugging Tips

- Check browser console for parsing errors
- Use React DevTools to inspect Zustand store state
- Verify ZIP file structure matches expected paths
- Check that CSV headers match expected format
- Ensure JSON files are valid after removing anti-XSSI prefix

## Dependencies

Core runtime dependencies:
- `react` & `react-dom` (UI framework)
- `zustand` (state management)
- `react-router-dom` (routing)
- `jszip` (ZIP extraction)
- `papaparse` (CSV parsing)
- `html2canvas` (image generation)
- `react-swipeable` (touch gestures)

Dev dependencies:
- `vite` (build tool)
- `typescript` (type checking)
- `tailwindcss` (styling)
- `@types/papaparse` (types)

## Important Notes for AI

- When suggesting changes, always maintain the privacy-first principle
- Use TypeScript types consistently
- Avoid adding any external API calls
- Consider mobile/touch interaction in UI components
- Keep bundle size small (lazy load where possible)
- Handle edge cases gracefully (missing data, corrupted files)
- Follow existing code patterns and structure
- Refer to `docs/implementation-plan.md` for detailed implementation roadmap
