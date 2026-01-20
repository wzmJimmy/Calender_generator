# Calendar PDF Generator - Project Plan

## Project Overview
A web-based application that allows users to generate personalized calendar PDFs with custom images. Users can configure calendar settings, upload images for each month, preview the result, and download a print-ready PDF.

## Technology Stack

### Core Technologies
- **HTML5**: Structure and semantic markup
- **CSS3**: Styling and responsive design
- **JavaScript (ES6+)**: Application logic and interactivity
- **jsPDF**: PDF generation library
- **html2canvas**: Convert HTML to canvas for PDF (used with jsPDF)
- **date-fns**: Date manipulation and calendar calculations
- **@date-holidays**: Holiday data for different countries/regions

### Alternative Libraries (if needed)
- **pdfkit.js**: Alternative PDF generation
- **moment.js**: Alternative date library (if date-fns doesn't meet needs)

## Project Structure

```
calendar_generator/
├── index.html                 # Main HTML file
├── calendar-demo.html         # Calendar demo/example page
├── css/
│   ├── styles.css            # Main stylesheet
│   └── calendar.css          # Calendar-specific styles
├── js/
│   ├── main.js               # Main application logic
│   ├── calendar-data.js      # Calendar data generation (pure data, no DOM)
│   ├── calendar.js           # Calendar rendering logic (uses calendar-data.js)
│   ├── pdf-generator.js      # PDF generation functionality
│   ├── image-handler.js      # Image upload and management
│   ├── holiday-data.js       # Holiday integration
│   ├── config-form.js        # Configuration form handling
│   ├── localization-data.js  # Localization metadata (countries, languages)
│   ├── preview.js            # Preview functionality
│   ├── step-navigation.js    # Step-by-step navigation system
│   └── utils.js              # Utility functions
├── assets/
│   ├── default-images/       # Default images for months
│   │   ├── january.jpg
│   │   ├── february.jpg
│   │   └── ... (12 images)
│   └── fonts/                # Custom fonts if needed
├── lib/                      # Third-party libraries (if not using CDN)
├── tests/                    # Test files
│   ├── calendar-engine.test.js
│   ├── config-form.test.js
│   ├── image-handler.test.js
│   └── preview.test.js
└── PROJECT_PLAN.md           # Project documentation and plan
```

## Detailed Implementation Steps

### Phase 1: Project Setup & Basic Structure

#### Step 1.1: Initialize Project
- [x] Create directory structure
- [x] Set up basic HTML5 boilerplate
- [x] Include CDN links for libraries (jsPDF, html2canvas, date-fns, date-holidays)
- [x] Create basic CSS reset and layout structure
- [x] Set up JavaScript module structure

#### Step 1.2: Basic UI Layout
- [x] Create header section
- [x] Design multi-step form container
- [x] Create step indicators (Step 1, 2, 3)
- [x] Add navigation buttons (Next/Previous)
- [x] Design preview section
- [x] Add download button area

### Phase 2: Step 1 - Calendar Configuration

#### Step 2.1: Year Selection
- [x] Create year input (dropdown or number input)
- [x] Default to current year
- [x] Validate year range (e.g., 2020-2030)
- [x] Store selected year in application state

#### Step 2.2: Start Day of Week
- [x] Create dropdown for start day (Sunday, Monday, etc.)
- [x] Options: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
- [x] Default to Sunday (or user's locale default)
- [x] Store selection in application state

#### Step 2.3: Language Selection
- [x] Create language dropdown
- [x] Support: English, Spanish, French, German, Chinese, Japanese, etc.
- [x] Store language code (en, es, fr, de, zh, ja, etc.)
- [x] This will affect month names and day names
- [x] Auto-detect default language from selected country with manual override

#### Step 2.4: Country/Region Selection
- [x] Create country dropdown
- [x] Support major countries (US, UK, Canada, Australia, Germany, France, etc.)
- [x] Store country code for holiday API
- [x] Link to holiday data source
- [x] Maintain shared localization metadata in `js/localization-data.js`

#### Step 2.5: Shared Configuration Module
- [x] Move form input handling and validation into `js/config-form.js`
- [x] Dynamically render country/language select options from the shared dataset
- [x] Expose config state for downstream modules (calendar, PDF, holidays)
- [x] Add lightweight DOM simulation tests to lock down validation and auto-detect behavior

### Phase 3: Step 2 - Image Upload

#### Step 3.1: Image Upload Interface
- [x] Create 12 upload slots (one per month)
- [x] Each slot shows:
  - Month name
  - Upload button/area
  - Preview thumbnail (when uploaded)
  - Remove/replace button
- [x] Support drag-and-drop for each slot
- [x] Validate file types (jpg, jpeg, png, webp)
- [x] Validate file size (max 5MB per image)
- [x] Show upload progress if needed

#### Step 3.2: Default Images
- [x] Create 12 default placeholder images (SVG artwork with monthly themes)
- [x] Store in assets/default-images/
- [x] Use default if user doesn't upload for that month
- [x] Allow user to see and use defaults easily

#### Step 3.3: Image Storage
- [x] Store uploaded images in browser memory (as base64 data URLs)
- [x] Create image state management (array of 12 images)
- [x] Handle image replacement
- [x] Optimize images for PDF (resize if too large, compress with quality 0.82)
- [x] Apply compression before encoding (max edge 1800px, JPEG format)

### Phase 3b: Step-by-Step Navigation & Real-Time Configuration

#### Step 3b.1: Independent Configuration Panel
- [x] Extract configuration form to a persistent top section
- [x] Ensure config changes reflect immediately in preview/PDF
- [x] Add visual indicator when config is modified
- [x] Style config panel to be distinct from step content

#### Step 3b.2: Step Navigation System
- [x] Implement step state management (current step tracking)
- [x] Create step visibility logic (show only current step)
- [x] Add step transition animations/effects
- [x] Update step indicators to reflect current position
- [x] Handle step validation before allowing progression

#### Step 3b.3: Step 1 - Configuration (Standalone)
- [x] Move config form to top section (independent of step flow)
- [x] Keep config accessible at all times
- [x] Wire config changes to trigger preview/PDF updates
- [x] Add "Apply Changes" or auto-save indicator

#### Step 3b.4: Step 2 - Image Upload
- [x] Show image upload panel only when on Step 2
- [x] Add navigation buttons (Previous/Next)
- [x] Validate that at least default images are available
- [x] Allow skipping if user is satisfied with defaults

#### Step 3b.5: Step 3 - Preview
- [x] Show preview section only when on Step 3
- [x] Generate preview based on current config and images
- [x] Update preview automatically when config changes (from top panel)
- [x] Add navigation buttons (Previous/Next)
- [x] Show download button when ready

#### Step 3b.6: Step 4 - Download (Final Step)
- [x] Show download section or modal
- [x] Generate PDF with current settings
- [x] Show download progress
- [x] Allow returning to previous steps to make changes
- [x] Add "Generate New Calendar" option to start over

#### Step 3b.7: Navigation Controls
- [x] Implement Previous/Next buttons with proper state
- [x] Disable Previous on first step
- [x] Disable Next on last step
- [x] Add step validation before allowing Next
- [x] Show step completion indicators
- [x] Add keyboard navigation (optional)

#### Step 3b.8: Real-Time Updates
- [x] Subscribe config changes to preview/PDF generators
- [x] Debounce rapid config changes for performance
- [x] Show loading state during preview regeneration
- [x] Handle errors gracefully during real-time updates
- [x] Cache intermediate results when possible

#### Additional Enhancements (Beyond Original Plan)
- [x] Added top navigation buttons on each step for better UX
- [x] Implemented class-based navigation button system (DRY principle)
- [x] Added config summary display in download step showing all settings
- [x] Moved dependency status checker to hero section with appropriate styling
- [x] Consolidated navigation button logic to eliminate code duplication
- [x] Created reusable `StepNavigation` module with subscription system

### Phase 4: Calendar Generation Logic

#### Step 4.1: Calendar Calculation
- [x] Create function to generate calendar grid for a month
- [x] Handle different start days of week
- [x] Calculate correct number of days per month
- [x] Handle leap years
- [x] Generate array of dates with proper positioning

#### Step 4.2: Holiday Integration
- [x] Integrate holiday library (@date-holidays)
- [x] Fetch holidays for selected country and year
- [x] Mark holidays in calendar
- [x] Display holiday names (in selected language if possible)
- [x] Handle multiple holidays on same day

#### Step 4.3: Localization
- [x] Create translation object for month names
- [x] Create translation object for day names
- [x] Apply selected language to calendar
- [x] Format dates according to locale

#### Step 4.4: Calendar Rendering
- [x] Create HTML structure for calendar month
- [x] Style calendar grid (7 columns, variable rows)
- [x] Highlight current day (if applicable)
- [x] Style holidays differently
- [x] Add month name header
- [x] Ensure responsive design

#### Additional Enhancements (Beyond Original Plan)
- [x] Refactored common utility functions into `utils.js` for code reuse:
  - `formatISODate()` - Centralized ISO date formatting (YYYY-MM-DD) used by calendar and holiday modules
  - `formatBytes()` - Human-readable byte formatting (B, KB, MB, GB) for file size display
  - `preventDefault()` - Event handling utility for drag-and-drop operations
  - `chunkArray()` - Array chunking utility for calendar week grouping
  - `debounce()` - Generic debounce function for config change notifications
- [x] Updated all modules to use shared utilities, eliminating code duplication:
  - `calendar.js` now uses `Utils.formatISODate()` and `Utils.chunkArray()`
  - `holiday-data.js` now uses `Utils.formatISODate()`
  - `image-handler.js` now uses `Utils.formatBytes()` and `Utils.preventDefault()`
  - `config-form.js` now uses `Utils.debounce()` for subscriber notifications
- [x] Improved test infrastructure by ensuring proper dependency loading order
- [x] Enhanced code maintainability through DRY (Don't Repeat Yourself) principles

### Phase 4b: Preview Calendar Experience

#### Step 4b.1: Calendar Preview Rendering
- [x] Replace preview placeholders with actual calendar output from `CalendarEngine.renderMonth`
- [x] Mirror PDF layout structure to guarantee parity between preview and generated pages

#### Step 4b.2: Preview Pagination & Controls
- [x] Add prev/next controls with disabled states at bounds
- [x] Provide quick jump (dropdown or selector) to any month
- [x] Persist pagination state when navigating between steps

#### Step 4b.3: Preview Data Wiring
- [x] Sync preview with config changes (year, locale, holidays) without page reload
- [x] Inject month-specific images above each calendar using shared rendering helpers
- [x] Debounce re-rendering to keep interactions smooth

#### Step 4b.4: Preview Testing
- [x] Add lightweight DOM tests to verify pagination updates current month
- [x] Validate that preview reuses CalendarEngine markup for fidelity

### Phase 4c: Calendar Engine Refactoring & Layout System

#### Step 4c.1: Split Calendar Logic into Data and Rendering
- [x] Create `js/calendar-data.js` for pure data generation:
  - Move data functions: `getMonthGrid()`, `buildCells()`, `getDaysInMonth()`, `getLeadingDayCount()`, `normalizeInputs()`, `chunkIntoWeeks()`, localization helpers
  - Expose API: `CalendarData.getMonthGrid(year, monthIndex, options)` returning pure data (no DOM)
- [x] Refactor `js/calendar.js` to focus on rendering:
  - Create `CalendarRenderer.render(grid, layoutStyle)` abstraction
  - Move `renderMonth()`, `createDayCell()` to renderer
  - Support multiple layout styles via strategy/factory pattern
- [x] Update references (`preview.js`, `pdf-generator.js`, tests)
- [x] Maintain backward compatibility: Keep `CalendarEngine` as facade using both modules

#### Step 4c.2: Layout Style System
- [x] Create layout style registry: `"cellular"` (rounded), `"apple"` (straight lines), future styles
- [x] Implement style factory/strategy pattern
- [x] Add CSS classes: `.calendar-layout--cellular`, `.calendar-layout--apple`
- [x] Update renderer to accept `layoutStyle` parameter
- [x] Add `DEFAULT_LAYOUT_STYLE` configuration constant for easy default style switching
- [x] Expose `CalendarEngine.DEFAULT_LAYOUT_STYLE` for external access

#### Step 4c.3: Apple Calendar Style
- [x] Design: Remove all rounded borders, use straight 1px dividers, increase padding, simplify hierarchy
- [x] CSS: Straight borders, no radius, optimized spacing, maintain holiday/today highlighting
- [x] Add grey background (`#f9fafb`) for muted cells (days not in current month) to match cellular style
- [x] Test with various start days, month lengths, responsive behavior
- [x] Update `calendar-demo.html` to show both styles with option to switch and side-by-side comparison

#### Step 4c.4: Testing & Integration
- [x] Test data generation (independent of rendering)
- [x] Test layout style switching
- [x] Test with various configurations (years, start days, languages, holidays)
- [x] Update preview to use Apple style layout by default
- [x] Verify calendar engine tests pass with new structure

### Phase 4d: Preview Customization & Enhanced Visualization

#### Step 4d.1: Preview State Management
- [x] Create `PreviewConfig` module:
  - Split ratio (30-60%, default 40%), paper type (A4/Letter/Legal), orientation (Portrait/Landscape), image fit mode (cover/fill/contain/none), layout style (cellular/apple)
  - Expose `getState()`, `setState()`, `subscribe()` API
  - Validate all config values, provide defaults
  - localStorage persistence implemented

#### Step 4d.2: Preview Configuration Panel
- [x] Create config panel in Step 2 (Preview):
  - Split-ratio slider (30-60%, default 40%, step 5%)
  - Paper type selector (A4/Letter/Legal)
  - Orientation toggle (Portrait/Landscape)
  - Image fit mode dropdown (Cover/Fill/Contain/None with descriptions)
  - Layout style selector (Cellular/Apple, default: Apple)
- [x] Wire controls to `PreviewConfig`, update preview in real-time (debounced)
- [x] Collapsible panel with toggle button

#### Step 4d.3: Preview Aspect Ratio & Split Ratio
- [x] Calculate paper aspect ratios: A4 (0.707/1.414), Letter (0.773/1.294), Legal (0.607/1.647)
- [x] Apply aspect ratio to preview container using CSS `aspect-ratio` property
- [x] Apply split ratio: Image `height: ${splitRatio}%`, Calendar `height: ${100 - splitRatio}%`
- [x] Add paper type/orientation indicator (e.g., "A4 Portrait - 210×297mm")
- [x] Smooth transitions, validate bounds (30-60%)
- [x] Removed padding from `preview-card__body` container

#### Step 4d.4: Calendar Table as Image Rendering
- [x] Create `generateCalendarImage(containerElement, options)` using html2canvas:
  - Render to off-screen container (position: fixed, left: -10000px), capture as data URL, handle async/errors
- [x] Update preview to use calendar image:
  - Display as `<img>` with `object-fit: fill`, control size via container (split ratio)
  - Show loading indicator during generation
  - Fallback to HTML if image generation fails
- [x] Implement caching: Cache by config hash (year, month, layout, language, startDay, country, dimensions), invalidate on changes
- [x] Handle loading states, errors (fallback to HTML), retry logic
- [x] Fixed Chinese language rendering issues (proper font loading, dimension calculation using scrollHeight)
- [x] Fixed image size issues by using actual body container width and proper height measurement

#### Step 4d.5: Preview UI Enhancements
- [x] Enhance config panel: Collapsible section, grouped controls, loading indicators
- [x] Add paper size indicator with dimensions
- [x] Ensure responsive design

#### Step 4d.6: Expose Preview Config in PDF Summary
- [x] Update `updateConfigSummary()` in `main.js`:
  - Include split ratio, paper type/orientation, image fit mode, layout style
  - Group preview settings in separate section with readable labels
- [x] Subscribe to preview config changes, auto-refresh summary
- [x] Test all config combinations

#### Step 4d.7: Testing
- [x] Test split ratio, paper type/orientation, image fit modes, calendar image rendering/caching
- [x] Test preview config persistence, layout switching, summary updates
- [x] Test language changes (including Chinese) with proper cache invalidation
- [x] Code consolidation: Extracted helper functions for DRY principles:
  - `waitForLayout()` - Font loading and layout waiting
  - `getCalendarDimensions()` - Dimension calculation
  - `cleanupTempContainer()` - Container cleanup
  - `removeLoadingIndicator()` - Indicator removal

#### Additional Enhancements (Beyond Original Plan)
- [x] Fixed Chinese language rendering issues in calendar images:
  - Proper font loading detection using `document.fonts.ready`
  - Extended wait times for Chinese character rendering
  - Using `scrollHeight` for accurate height measurement
  - Fixed image size discrepancies between languages
- [x] Improved calendar image generation:
  - Uses actual body container width for accurate sizing
  - Proper dimension re-measurement after layout
  - Better error handling with HTML fallback
  - Cache includes language, startDay, and country for proper invalidation
- [x] Code refactoring for maintainability:
  - Consolidated repeated logic into helper functions
  - Removed padding from preview-card__body for better image display
  - Default layout style set to Apple
- [x] Test language changes (including Chinese) with proper cache invalidation
- [x] Code consolidation: Extracted helper functions for DRY principles:
  - `waitForLayout()` - Font loading and layout waiting
  - `getCalendarDimensions()` - Dimension calculation
  - `cleanupTempContainer()` - Container cleanup
  - `removeLoadingIndicator()` - Indicator removal

### Phase 5: PDF Generation

> **Note:** This phase reuses extensive functionality from Phase 4d (Preview Customization), including calendar image generation, preview config (paper types, orientations, split ratios), and layout styles.

#### Step 5.1: Reuse Preview Infrastructure ✅
- [x] Extract `generateCalendarImage()` from `preview.js` to a shared utility or keep in preview and call from PDF generator
- [x] Reuse `PreviewConfig` for paper type, orientation, split ratio, image fit mode, and layout style
- [x] Reuse `CalendarEngine.renderMonth()` for calendar rendering
- [x] Reuse `ImageHandler.getImages()` for month images
- [x] Reuse `ConfigForm.getState()` for calendar configuration (year, language, country, startDay)

#### Step 5.2: PDF Page Layout & Dimensions ✅
- [x] Get paper dimensions from `PreviewConfig.getPaperDimensionsString()` and `PreviewConfig.PAPER_DIMENSIONS`
- [x] Calculate page dimensions in mm (jsPDF uses mm when `unit: "mm"` is set)
- [x] Apply split ratio from preview config to determine image vs calendar height
- [x] Add margins (e.g., 10mm on all sides)
- [x] Calculate image container dimensions (maintain aspect ratio, respect image fit mode)
- [x] Calculate calendar container dimensions (remaining height after image)

#### Step 5.3: PDF Generation Function ✅
- [x] Use jsPDF to create PDF document with correct page size (A4/Letter/Legal, Portrait/Landscape)
- [x] For each month (0-11):
  - Get month image from `ImageHandler.getImages()[monthIndex]`
  - Generate calendar image using `generateCalendarImageForPdf()` (reuses preview infrastructure)
  - Add image to top of page (respecting split ratio and image fit mode)
  - Add calendar image below image (or render calendar directly to PDF)
  - Handle page breaks (one month per page)
- [x] Set PDF metadata:
  - Title: `Calendar {year}`
  - Author: User or app name
  - Subject: Generated calendar
  - Keywords: calendar, year

#### Step 5.4: Image Processing for PDF ✅
- [x] Images already processed in `ImageHandler` (compressed, resized to max 1800px edge, JPEG format)
- [x] Convert image data URLs to format jsPDF can use (base64 data URLs work directly)
- [x] Resize images to fit calculated page dimensions (maintain aspect ratio)
- [x] Apply image fit mode (cover/fill/contain/none) from preview config
- [x] Handle different image orientations (portrait/landscape images)

#### Step 5.5: Calendar Rendering for PDF ✅
- [x] Calendar rendering logic already exists in `CalendarEngine.renderMonth()`
- [x] Calendar image generation already exists in `preview.js` using html2canvas
- [x] Option A: Use calendar image from preview (reuse `generateCalendarImage()`)
  - Generate calendar image for each month using `generateCalendarImageForPdf()`
  - Add image to PDF at correct position
  - Benefits: Consistent with preview, handles fonts/styles automatically
- [x] Implemented Option A (reuse preview image generation)

### Phase 6: Preview Functionality

> **Note:** This phase was completed in Phase 4b (Preview Calendar Experience) and Phase 4d (Preview Customization & Enhanced Visualization). All functionality is implemented and working.

#### Step 6.1: Preview Generation ✅ (Completed in Phase 4b)
- [x] Create preview container in HTML
- [x] Generate preview for current month (pagination-based)
- [x] Display month with image and calendar
- [x] Show month name, image, and calendar for each

#### Step 6.2: Preview Navigation ✅ (Completed in Phase 4b)
- [x] Add navigation between months (prev/next buttons)
- [x] Show month indicators (month selector dropdown)
- [x] Allow quick jump to specific month
- [x] Pagination state persists when navigating between steps

#### Step 6.3: Preview Styling ✅ (Completed in Phase 4d)
- [x] Match preview styling to PDF output (uses same calendar rendering)
- [x] Ensure accurate representation (calendar rendered as image using html2canvas)
- [x] Add loading states (loading indicators during calendar image generation)
- [x] Handle errors gracefully (fallback to HTML if image generation fails)
- [x] Preview config panel with paper type, orientation, split ratio, image fit mode, layout style
- [x] Real-time preview updates when config changes

### Phase 7: Image Replacement Feature

> **Note:** Basic image replacement is already available in Step 2 (Image Upload). This phase adds quick replacement from the preview step for better UX.

#### Step 7.1: Quick Replace from Preview (Optional Enhancement)
- [ ] Add "Change Image" button or icon in preview card for current month
- [ ] Open image upload dialog for specific month (reuse `ImageHandler` upload logic)
- [ ] Update preview immediately after replacement (preview already subscribes to `ImageHandler` changes)
- [ ] Maintain state consistency (images stored in `ImageHandler` state)
- [ ] Alternative: Add link/button to navigate to Step 2 with month pre-selected

#### Step 7.2: Regenerate Preview ✅ (Already Implemented)
- [x] Preview automatically updates when image is replaced (via `ImageHandler` subscription)
- [x] Maintains other settings (config, preview config persist)
- [x] Shows loading indicator during regeneration (calendar image generation shows loading state)

#### Step 7.3: Image Replacement from Step 2 ✅ (Already Implemented)
- [x] Users can upload/replace images for any month in Step 2
- [x] Images are validated, compressed, and optimized
- [x] Preview updates automatically when images change
- [x] Delete button to revert to default images

### Phase 8: Download Functionality ✅

> **Note:** This phase wires up the PDF generation from Phase 5 to the download button and handles the download flow.

#### Step 8.1: Download Button Integration ✅
- [x] Locate download button in Step 3 (Download step)
- [x] Wire download button to `PdfGenerator.download()` function (calls `generate()` internally)
- [x] Show progress indicator during PDF generation (all 12 months)
- [x] Display progress: "Generating page 1/12...", "Generating page 2/12...", etc.
- [x] Handle errors gracefully with user-friendly messages (including file:// protocol guidance)
- [x] Disable download button during generation to prevent duplicate requests

#### Step 8.2: PDF File Generation & Download ✅
- [x] Call `PdfGenerator.generate()` with current configuration:
  - Get config from `ConfigForm.getState()`
  - Get images from `ImageHandler.getImages()`
  - Get preview config from `PreviewConfig.getState()`
- [x] Generate all 12 pages (one month per page)
- [x] Create downloadable blob from jsPDF document
- [x] Set filename: `calendar-{year}.pdf` (e.g., `calendar-2024.pdf`)
- [x] Trigger browser download using `URL.createObjectURL()` + `<a>` download
- [x] Show success message after download completes

#### Step 8.3: PDF Generation Progress & Feedback ✅
- [x] Show progress indicator with page count (1/12, 2/12, ..., 12/12)
- [x] Update progress as each month is processed (via progress callback)
- [x] Show success message with filename after completion
- [x] Handle errors gracefully with context-specific error messages
- [x] Auto-clear status message after 5 seconds
- [x] Handle file:// protocol issues with helpful guidance for local web server

### Phase 9: Polish & Optimization

#### Step 9.1: Error Handling
- [ ] Handle image upload errors
- [ ] Handle PDF generation errors
- [ ] Show user-friendly error messages
- [ ] Add validation for all inputs

#### Step 9.2: User Experience
- [ ] Add loading states throughout
- [ ] Add success messages
- [ ] Improve form validation feedback
- [ ] Add tooltips/help text
- [ ] Ensure responsive design

#### Step 9.3: Performance
- [ ] Optimize image loading
- [ ] Lazy load preview months
- [ ] Optimize PDF generation speed
- [ ] Add caching where appropriate

#### Step 9.4: Testing
- [ ] Test with different years
- [ ] Test with different start days
- [ ] Test with different countries/holidays
- [ ] Test with different languages
- [ ] Test image upload/replacement
- [ ] Test PDF download
- [ ] Test on different browsers

## Future Enhancements (Phase 10+)

### Multiple Layout Options
- [ ] Design additional layouts:
  - Image left, calendar right
  - Image right, calendar left
  - Image background with calendar overlay
  - Two images per page
- [ ] Add layout selector in Step 1 or preview
- [ ] Allow switching layouts in preview
- [ ] Update PDF generation for each layout

### LLM Image Generation
- [ ] Integrate image generation API (OpenAI DALL-E, Stability AI, etc.)
- [ ] Add prompt input field for each month
- [ ] Generate image from prompt
- [ ] Show generated image options
- [ ] Allow user to select and save generated image
- [ ] Store in browser localStorage/IndexedDB
- [ ] Add image gallery for saved images

### Browser Storage
- [ ] Implement localStorage for:
  - User preferences
  - Saved images
  - Generated prompts
- [ ] Implement IndexedDB for:
  - Larger image storage
  - Multiple calendar projects
- [ ] Add "Save Project" functionality
- [ ] Add "Load Project" functionality

## Technical Considerations

### Browser Compatibility
- Target modern browsers (Chrome, Firefox, Safari, Edge)
- Use polyfills if needed for older browsers
- Test PDF generation across browsers

### Performance
- Optimize image sizes before PDF generation
- Consider web workers for PDF generation if it's slow
- Implement progressive loading

### Security
- Validate all user inputs
- Sanitize file uploads
- Prevent XSS attacks
- Handle CORS if using external APIs

### Accessibility
- Add ARIA labels
- Ensure keyboard navigation
- Add alt text for images
- Ensure color contrast

## Dependencies

### CDN Links (to include in HTML)
```html
<!-- jsPDF -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<!-- html2canvas -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

<!-- date-fns (global browser build) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/date-fns/4.1.0/cdn.min.js"></script>

<!-- date-holidays (UMD build) -->
<script src="https://unpkg.com/date-holidays@3/dist/umd.min.js"></script>
```

### Alternative: npm packages (if using build tool)
```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    "date-fns": "^4.1.0",
    "date-holidays": "^3.0.0"
  }
}
```

> **Phase 1 note:** We verified that `date-holidays` maintains the browser-ready bundle under the main package (not `@date-holidays/core`), so future holiday logic should import from `date-holidays` to stay aligned with upstream support.

## Timeline Estimate

- **Phase 1-2**: 2-3 hours (Setup & Configuration)
- **Phase 3**: 2-3 hours (Image Upload)
- **Phase 3b**: 2-3 hours (Step-by-Step Navigation & Real-Time Config)
- **Phase 4**: 3-4 hours (Calendar Logic)
- **Phase 4b**: 2-3 hours (Preview Calendar Experience) ✅
- **Phase 4c**: 4-6 hours (Calendar Engine Refactoring & Layout System)
  - Step 4c.1: 1.5-2 hours (Split data/rendering)
  - Step 4c.2: 1-1.5 hours (Layout system)
  - Step 4c.3: 1-1.5 hours (Apple style)
  - Step 4c.4: 0.5-1 hour (Testing)
- **Phase 4d**: 6-8 hours (Preview Customization & Enhanced Visualization) ✅
  - Step 4d.1: 0.5-1 hour (State management) ✅
  - Step 4d.2: 1-1.5 hours (Config panel) ✅
  - Step 4d.3: 1-1.5 hours (Aspect ratio & split ratio) ✅
  - Step 4d.4: 2-2.5 hours (Calendar as image) ✅
  - Step 4d.5: 0.5-1 hour (UI enhancements) ✅
  - Step 4d.6: 0.5 hour (PDF summary) ✅
  - Step 4d.7: 0.5-1 hour (Testing) ✅
- **Phase 5**: 3-4 hours (PDF Generation) ✅ - *Reuses Phase 4d infrastructure*
  - Step 5.1: 0.5 hour (Reuse preview infrastructure) ✅
  - Step 5.2: 0.5-1 hour (Page layout & dimensions) ✅
  - Step 5.3: 1-1.5 hours (PDF generation function) ✅
  - Step 5.4: 0.5 hour (Image processing - mostly done) ✅
  - Step 5.5: 0.5-1 hour (Calendar rendering - reuse preview images) ✅
- **Phase 6**: ✅ Completed in Phase 4b/4d (Preview Functionality)
- **Phase 7**: 0.5-1 hour (Image Replacement) - *Basic replacement already works, optional quick replace from preview*
- **Phase 8**: 1-1.5 hours (Download Functionality) ✅
  - Step 8.1: 0.5 hour (Download button integration) ✅
  - Step 8.2: 0.5 hour (PDF file generation & download) ✅
  - Step 8.3: 0.5 hour (Progress & feedback) ✅
- **Phase 9**: 2-3 hours (Polish)

**Total Estimated Time**: 28-38 hours for MVP with enhancements

## Success Criteria

- [x] User can select year, start day, language, and country
- [x] User can upload 12 images (or use defaults)
- [x] Images are validated and compressed before storage
- [ ] Calendar correctly displays with holidays
- [x] Preview shows accurate representation (with customizable settings)
- [x] PDF generates correctly with all 12 months (reusing preview infrastructure)
- [x] User can download PDF
- [x] User can replace individual images (in Step 2, optional quick replace from preview)
- [x] Step-by-step navigation works smoothly
- [x] Configuration changes reflect in real-time
- [x] Preview customization: split ratio, paper type, orientation, image fit mode, layout style
- [x] Calendar rendered as image in preview (using html2canvas)
- [ ] Application works in major browsers
- [x] Code is well-organized and maintainable (DRY principles applied)

---

## Next Steps

After reviewing this plan:
1. Confirm technology choices
2. Adjust timeline/scope if needed
3. Begin implementation phase by phase
4. Test incrementally
5. Iterate based on feedback

