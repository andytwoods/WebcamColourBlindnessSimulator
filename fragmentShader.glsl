precision highp float;
uniform sampler2D tex;
uniform float brightness;
varying vec2 vTexCoord;

void main(void) {
    vec4 color = texture2D(tex, vTexCoord);
    vec3 borderColor = vec3(0.0); // Black color for borders

    float sectionWidth = 1.0 / 3.0;
    float xCoord = vTexCoord.x;

    mat4 matrix;
    if (xCoord < sectionWidth) {
        matrix = mat4(
            0.567, 0.433, 0.000, 0.000,
            0.558, 0.442, 0.000, 0.000,
            0.000, 0.242, 0.758, 0.000,
            0.000, 0.000, 0.000, 1.000
        );
    } else if (xCoord < 2.0 * sectionWidth) {
        matrix = mat4(
            0.625, 0.375, 0.000, 0.000,
            0.700, 0.300, 0.000, 0.000,
            0.000, 0.300, 0.700, 0.000,
            0.000, 0.000, 0.000, 1.000
        );
    } else {
        matrix = mat4(
            0.950, 0.050, 0.000, 0.000,
            0.000, 0.433, 0.567, 0.000,
            0.000, 0.475, 0.525, 0.000,
            0.000, 0.000, 0.000, 1.000
        );
    }

    vec4 transformedColor = matrix * vec4(color.rgb, 1.0) * brightness;

    float lineWidth = 0.005;
    bool isBoundary = abs(mod(xCoord, sectionWidth) - sectionWidth) < lineWidth;

    if (isBoundary) {
        gl_FragColor = vec4(borderColor, 1.0);
    } else {
        transformedColor.rgb = clamp(transformedColor.rgb, 0.0, 1.0);
        gl_FragColor = vec4(transformedColor.rgb, color.a);
    }
}
