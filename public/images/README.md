# KrumbKraft Logo Files

This directory contains the logo assets for KrumbKraft.

## Current Logo Files:
- `krumbkraft-logo.svg` - Vector logo (recommended for web use)
- Place your actual logo files here

## Logo Guidelines:
- **Recommended size**: 48x48px minimum for the circular logo area
- **Format**: SVG preferred for scalability, PNG as fallback
- **Colors**: Should work well with the amber/orange gradient background
- **Style**: Should be readable at small sizes for mobile devices

## Usage:
The logo is currently used in:
- Top navigation bar (`/src/app/home/page.tsx`)
- Mobile and desktop responsive layouts

## To Replace:
1. Add your logo file to this directory
2. Update the `src` attribute in the img tag in `/src/app/home/page.tsx`
3. Adjust the dimensions if needed (currently set to `w-8 h-8 sm:w-10 sm:h-10`)

Example:
```tsx
<img 
  src="/images/your-actual-logo.svg" 
  alt="KrumbKraft Logo" 
  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
/>
```
