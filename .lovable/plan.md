

# Bank Statement Converter - MVP Plan

## Overview
A privacy-first web app that converts bank statement PDFs into XLSX, CSV, and JSON formats. All processing happens in-memory with zero file storage - files are never written to disk.

---

## Core User Experience

### Landing Page
- **Hero Section**: Bold headline emphasizing privacy ("Zero Storage. Complete Privacy. Instant Conversion")
- **Trust Badges**: Visual indicators showing "No disk storage", "Data destroyed after download", "HTTPS encrypted"
- **Simple Upload Area**: Prominent drag-and-drop zone with format selection

### Conversion Flow
1. **Upload** - Drag & drop or click to select PDF
2. **Process** - Progress indicator while AI extracts transactions
3. **Preview** - Quick preview of extracted data (optional in MVP)
4. **Download** - One-click download in chosen format, then data is destroyed

---

## Features (MVP Scope)

### Upload & Processing
- Drag-and-drop PDF upload
- File size validation (max 10MB for MVP)
- Progress indicator during conversion
- Clear error handling with user-friendly messages

### AI-Powered Extraction
- Transaction table detection using Lovable AI
- Fields extracted: Date, Description, Debit, Credit, Balance
- Support for common bank statement layouts
- Multi-page PDF handling

### Export Formats
- **XLSX** - Excel spreadsheet with formatted columns
- **CSV** - Universal comma-separated format  
- **JSON** - Structured data for developers

### Privacy Features
- All processing in Edge Function memory
- No file persistence anywhere
- Automatic data purge after download
- Privacy policy page with zero-retention guarantee

---

## Rate Limiting & Authentication

### Anonymous Users
- 3 conversions per day (IP-based tracking)
- Standard processing priority

### Authenticated Users (Optional Login)
- 20 conversions per day
- Email/password authentication via Lovable Cloud
- No file history stored (only usage counts)

---

## Pages

1. **Home** - Landing page with upload area
2. **Privacy Policy** - Detailed zero-retention policy
3. **Login/Signup** (Optional) - Simple auth for higher limits

---

## Design Style

- Clean white background with subtle gray accents
- Trust-focused color palette (blues and greens for security feeling)
- Large, clear typography
- Generous whitespace
- Minimalist icons (shield, lock, trash for privacy messaging)
- Mobile-responsive design

---

## Technical Architecture

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Drag-and-drop file handling
- Progress indicators and toast notifications

### Backend (Lovable Cloud)
- Edge Function for PDF processing
- Lovable AI for document parsing
- In-memory file handling (BytesIO equivalent)
- Streaming response for downloads

### Security
- HTTPS only
- File size limits
- Rate limiting by IP/user
- No logging of file contents

