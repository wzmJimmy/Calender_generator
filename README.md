# Calendar PDF Generator

(**My first AI/Vibe coding project**)

A web-based application that allows users to generate personalized calendar PDFs with custom images, holidays, and localization. Create beautiful, print-ready calendars with a simple step-by-step interface.

## Features

### 🎨 Customization
- **Year Selection**: Generate calendars for any year (2020-2030)
- **Start Day Configuration**: Choose which day of the week your calendar starts (Sunday through Saturday)
- **Multi-language Support**: Support for English, Spanish, French, German, Chinese, Japanese, and more
- **Country/Region Selection**: Automatic holiday integration for major countries
- **Layout Styles**: Choose between Apple-style (clean lines) or Cellular-style (rounded borders) calendar designs

### 🖼️ Image Management
- **Custom Images**: Upload your own images for each month (JPG, PNG, WebP)
- **Default Images**: Curated default artwork for all 12 months
- **Image Optimization**: Automatic compression and resizing (max 1800px edge, JPEG format)
- **Drag & Drop**: Easy image upload with drag-and-drop support
- **Image Fit Modes**: Cover, Fill, Contain, or None for perfect image placement

### 📅 Calendar Features
- **Holiday Integration**: Automatic holiday detection and display based on selected country
- **Localized Display**: Month and day names in your selected language
- **Real-time Preview**: See your calendar as you configure it
- **Month Navigation**: Browse through all 12 months in the preview

### 📄 PDF Generation
- **Print-Ready PDFs**: Generate high-quality PDFs with all 12 months
- **Paper Options**: Support for A4, Letter, and Legal paper sizes
- **Orientation**: Portrait or Landscape layouts
- **Split Ratio Control**: Adjustable image-to-calendar ratio (30-60%)
- **Progress Tracking**: Real-time progress indicator during PDF generation

### 🎯 User Experience
- **Step-by-Step Interface**: Intuitive 3-step process (Images → Preview → Download)
- **Real-Time Updates**: Configuration changes reflect immediately in preview
- **Persistent Settings**: Preview configuration saved to localStorage
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with responsive design
- **JavaScript (ES6+)**: Application logic and interactivity
- **jsPDF**: PDF generation library
- **html2canvas**: Convert HTML to canvas for PDF rendering
- **date-fns**: Date manipulation and calendar calculations
- **date-holidays**: Holiday data for different countries/regions

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (required for file:// protocol limitations)

### Installation

1. Clone or download this repository
2. Serve the files using a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

3. Open `http://localhost:8000` in your browser

### Usage

1. **Configure Calendar Settings** (top panel):
   - Select the year
   - Choose start day of week
   - Select country/region for holidays
   - Choose language for month/day names

2. **Step 1 - Upload Images**:
   - Upload custom images for each month (optional)
   - Or use the default images provided
   - Drag & drop or click to upload

3. **Step 2 - Preview**:
   - Review your calendar month by month
   - Customize preview settings:
     - Split ratio (image vs calendar space)
     - Paper type (A4/Letter/Legal)
     - Orientation (Portrait/Landscape)
     - Image fit mode
     - Layout style
   - Navigate between months

4. **Step 3 - Download**:
   - Review your configuration summary
   - Click "Generate & Download PDF"
   - Wait for generation (progress shown)
   - PDF downloads automatically

## Project Structure

```
calendar_generator/
├── index.html                 # Main application page
├── calendar-demo.html         # Calendar style demo page
├── css/
│   ├── styles.css            # Main stylesheet
│   └── calendar.css          # Calendar-specific styles
├── js/
│   ├── main.js               # Application initialization
│   ├── calendar-data.js      # Pure calendar data generation
│   ├── calendar.js           # Calendar rendering logic
│   ├── pdf-generator.js      # PDF generation functionality
│   ├── image-handler.js      # Image upload and management
│   ├── holiday-data.js       # Holiday integration
│   ├── config-form.js        # Configuration form handling
│   ├── localization-data.js  # Localization metadata
│   ├── preview.js            # Preview functionality
│   ├── preview-config.js     # Preview configuration state
│   ├── step-navigation.js    # Step-by-step navigation
│   └── utils.js              # Utility functions
├── assets/
│   └── default-images/       # Default images for 12 months
├── tests/                    # Test files
└── PROJECT_PLAN.md           # Detailed project documentation
```

## Current Status

### ✅ Completed Features
- Calendar configuration (year, start day, language, country)
- Image upload with validation and optimization
- Holiday integration with country-specific data
- Multi-language support
- Real-time preview with customization options
- PDF generation with all 12 months
- Step-by-step navigation system
- Preview configuration persistence
- Calendar layout styles (Apple & Cellular)
- Responsive design

### 🚧 Future Enhancements
- Additional layout options (image left/right, overlay styles)
- LLM image generation integration
- Browser storage for saved projects
- Enhanced error handling and validation
- Performance optimizations
- Cross-browser testing

## Browser Compatibility

Targets modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Testing
Test files are located in the `tests/` directory. Run tests using your preferred JavaScript testing framework.

### Code Organization
The project follows a modular architecture:
- **Data Layer**: Pure data generation (`calendar-data.js`, `holiday-data.js`)
- **Rendering Layer**: DOM manipulation (`calendar.js`, `preview.js`)
- **State Management**: Configuration and state (`config-form.js`, `preview-config.js`)
- **Utilities**: Shared helper functions (`utils.js`)

## License

This project is open source and available for personal and commercial use.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

**Note**: This application requires a local web server to run properly due to browser security restrictions with the `file://` protocol. Use a simple HTTP server as described in the Getting Started section.
