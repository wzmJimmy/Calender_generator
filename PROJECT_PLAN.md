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
├── css/
│   ├── styles.css            # Main stylesheet
│   └── calendar.css          # Calendar-specific styles
├── js/
│   ├── main.js               # Main application logic
│   ├── calendar.js           # Calendar generation logic
│   ├── pdf-generator.js      # PDF generation functionality
│   ├── image-handler.js      # Image upload and management
│   ├── holiday-data.js       # Holiday integration
│   └── utils.js              # Utility functions
├── assets/
│   ├── default-images/       # Default images for months
│   │   ├── january.jpg
│   │   ├── february.jpg
│   │   └── ... (12 images)
│   └── fonts/                # Custom fonts if needed
├── lib/                      # Third-party libraries (if not using CDN)
└── README.md                 # Project documentation
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
- [ ] Extract configuration form to a persistent top section
- [ ] Make config panel always visible (sticky or fixed position)
- [ ] Ensure config changes reflect immediately in preview/PDF
- [ ] Add visual indicator when config is modified
- [ ] Style config panel to be distinct from step content

#### Step 3b.2: Step Navigation System
- [ ] Implement step state management (current step tracking)
- [ ] Create step visibility logic (show only current step)
- [ ] Add step transition animations/effects
- [ ] Update step indicators to reflect current position
- [ ] Handle step validation before allowing progression

#### Step 3b.3: Step 1 - Configuration (Standalone)
- [ ] Move config form to top section (independent of step flow)
- [ ] Keep config accessible at all times
- [ ] Wire config changes to trigger preview/PDF updates
- [ ] Add "Apply Changes" or auto-save indicator

#### Step 3b.4: Step 2 - Image Upload
- [ ] Show image upload panel only when on Step 2
- [ ] Add navigation buttons (Previous/Next)
- [ ] Validate that at least default images are available
- [ ] Allow skipping if user is satisfied with defaults

#### Step 3b.5: Step 3 - Preview
- [ ] Show preview section only when on Step 3
- [ ] Generate preview based on current config and images
- [ ] Update preview automatically when config changes (from top panel)
- [ ] Add navigation buttons (Previous/Next)
- [ ] Show download button when ready

#### Step 3b.6: Step 4 - Download (Final Step)
- [ ] Show download section or modal
- [ ] Generate PDF with current settings
- [ ] Show download progress
- [ ] Allow returning to previous steps to make changes
- [ ] Add "Generate New Calendar" option to start over

#### Step 3b.7: Navigation Controls
- [ ] Implement Previous/Next buttons with proper state
- [ ] Disable Previous on first step
- [ ] Disable Next on last step
- [ ] Add step validation before allowing Next
- [ ] Show step completion indicators
- [ ] Add keyboard navigation (optional)

#### Step 3b.8: Real-Time Updates
- [ ] Subscribe config changes to preview/PDF generators
- [ ] Debounce rapid config changes for performance
- [ ] Show loading state during preview regeneration
- [ ] Handle errors gracefully during real-time updates
- [ ] Cache intermediate results when possible

### Phase 4: Calendar Generation Logic

#### Step 4.1: Calendar Calculation
- [ ] Create function to generate calendar grid for a month
- [ ] Handle different start days of week
- [ ] Calculate correct number of days per month
- [ ] Handle leap years
- [ ] Generate array of dates with proper positioning

#### Step 4.2: Holiday Integration
- [ ] Integrate holiday library (@date-holidays/core)
- [ ] Fetch holidays for selected country and year
- [ ] Mark holidays in calendar
- [ ] Display holiday names (in selected language if possible)
- [ ] Handle multiple holidays on same day

#### Step 4.3: Localization
- [ ] Create translation object for month names
- [ ] Create translation object for day names
- [ ] Apply selected language to calendar
- [ ] Format dates according to locale

#### Step 4.4: Calendar Rendering
- [ ] Create HTML structure for calendar month
- [ ] Style calendar grid (7 columns, variable rows)
- [ ] Highlight current day (if applicable)
- [ ] Style holidays differently
- [ ] Add month name header
- [ ] Ensure responsive design

### Phase 5: PDF Generation

#### Step 5.1: Page Layout Design
- [ ] Design base layout: Image at top, calendar at bottom
- [ ] Set page dimensions (A4: 210mm x 297mm or Letter: 8.5" x 11")
- [ ] Calculate image dimensions (maintain aspect ratio)
- [ ] Calculate calendar dimensions
- [ ] Add margins and spacing

#### Step 5.2: PDF Generation Function
- [ ] Use jsPDF to create PDF document
- [ ] For each month (1-12):
  - Add image to top of page
  - Add calendar grid below image
  - Add month name and year
  - Handle page breaks
- [ ] Set PDF metadata (title, author, etc.)

#### Step 5.3: Image Processing for PDF
- [ ] Convert images to appropriate format for PDF
- [ ] Resize images to fit page dimensions
- [ ] Maintain aspect ratio
- [ ] Handle different image orientations

#### Step 5.4: Calendar Styling in PDF
- [ ] Apply consistent styling to calendar in PDF
- [ ] Ensure text is readable
- [ ] Style holidays appropriately
- [ ] Add borders and grid lines

### Phase 6: Preview Functionality

#### Step 6.1: Preview Generation
- [ ] Create preview container in HTML
- [ ] Generate preview for all 12 months
- [ ] Display months in scrollable grid or carousel
- [ ] Show month name, image, and calendar for each

#### Step 6.2: Preview Navigation
- [ ] Add navigation between months
- [ ] Show month indicators
- [ ] Allow quick jump to specific month
- [ ] Add zoom functionality if needed

#### Step 6.3: Preview Styling
- [ ] Match preview styling to PDF output
- [ ] Ensure accurate representation
- [ ] Add loading states
- [ ] Handle errors gracefully

### Phase 7: Image Replacement Feature

#### Step 7.1: Replace Image Interface
- [ ] Add "Change Image" button for each month in preview
- [ ] Open image upload dialog for specific month
- [ ] Update preview immediately after replacement
- [ ] Maintain state consistency

#### Step 7.2: Regenerate Preview
- [ ] Update preview when image is replaced
- [ ] Maintain other settings
- [ ] Show loading indicator during regeneration

### Phase 8: Download Functionality

#### Step 8.1: Download Button
- [ ] Add download button in preview section
- [ ] Generate PDF on click
- [ ] Show progress indicator
- [ ] Handle errors

#### Step 8.2: PDF File Generation
- [ ] Trigger PDF generation with current settings
- [ ] Generate all 12 pages
- [ ] Create downloadable blob
- [ ] Set filename: `calendar-{year}.pdf`

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
- **Phase 5**: 3-4 hours (PDF Generation)
- **Phase 6**: 2-3 hours (Preview)
- **Phase 7**: 1-2 hours (Image Replacement)
- **Phase 8**: 1 hour (Download)
- **Phase 9**: 2-3 hours (Polish)

**Total Estimated Time**: 18-26 hours for MVP

## Success Criteria

- [x] User can select year, start day, language, and country
- [x] User can upload 12 images (or use defaults)
- [x] Images are validated and compressed before storage
- [ ] Calendar correctly displays with holidays
- [ ] Preview shows accurate representation
- [ ] PDF generates correctly with all 12 months
- [ ] User can download PDF
- [ ] User can replace individual images
- [ ] Step-by-step navigation works smoothly
- [ ] Configuration changes reflect in real-time
- [ ] Application works in major browsers
- [ ] Code is well-organized and maintainable

---

## Next Steps

After reviewing this plan:
1. Confirm technology choices
2. Adjust timeline/scope if needed
3. Begin implementation phase by phase
4. Test incrementally
5. Iterate based on feedback

