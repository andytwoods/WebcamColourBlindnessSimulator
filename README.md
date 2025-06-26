# WebcamColourBlindnessSimulator

A web application that simulates different types of color blindness using a webcam feed.

## Usage
Simply open index.html in a web browser that supports WebGL and webcam access.

### Controls
- **Type**: Select the type of color blindness to simulate (Protanopia, Deuteranopia, or Tritanopia)
- **Correction**: Adjust the intensity of the color blindness simulation
- **Camera**: Select which camera to use if multiple cameras are available
- **Resolution**: Choose the webcam resolution (640x480, 1280x720 HD, or 1920x1080 Full HD)
- **Mirror Image**: Toggle mirroring of the webcam feed

## Color Blindness Simulation
This simulator uses scientifically accurate formulas to simulate three types of color blindness:

1. **Protanopia** (L cone deficiency): Difficulty distinguishing between red and green colors
2. **Deuteranopia** (M cone deficiency): Another form of red-green color blindness
3. **Tritanopia** (S cone deficiency): Difficulty distinguishing between blue and yellow colors

The simulation is based on research by Brettel et al. (1997) and Viénot et al. (1999), which provides transformation matrices for converting normal color vision to color-deficient vision in the LMS color space.

### Technical Notes
- Both Protanopia and Deuteranopia simulations have been optimized to prevent blockiness at high correction levels by using balanced coefficients and value clamping.
- All color transformations include proper value clamping to ensure smooth rendering without artifacts.

## References
- Brettel, H., Viénot, F., & Mollon, J. D. (1997). Computerized simulation of color appearance for dichromats. Journal of the Optical Society of America A, 14(10), 2647-2655.
- Viénot, F., Brettel, H., & Mollon, J. D. (1999). Digital video colourmaps for checking the legibility of displays by dichromats. Color Research & Application, 24(4), 243-252.
