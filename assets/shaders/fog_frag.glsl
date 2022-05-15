#ifdef USE_FOG
vec3 fogPos = vec3(0., .25, 0.);
float fogHeight = 7.5;
float fogDensity = easeInOutQuad(clamp(1. - (vFogWorldPosition.y - fogPos.y) / fogHeight, .0, 1.));
vec3 fogColor = vec3(0./255., 89./255., 255./255.); // 4EA8DE, 78, 168, 222
 
gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogDensity);
#endif 