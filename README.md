# WebcamColourBlindnessSimulator

A webcam-based color blindness simulator that allows you to see how different types of color blindness affect your vision in real-time.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Build the CSS file:
   ```
   npm run build
   ```

3. Open index.html in your browser

## Development

If you're making changes to the HTML or Tailwind classes, you can use the watch mode to automatically rebuild the CSS file when changes are detected:

```
npm run watch
```

## Notes

- This project uses Tailwind CSS for styling. The CSS is built from the source files in the `src` directory and output to `dist/output.css`.
- If you add new Tailwind classes to the HTML, you'll need to rebuild the CSS file using `npm run build` or have the watch mode running.
- The Tailwind configuration is in `tailwind.config.js`. You can customize the theme, add plugins, or modify other settings there.
