#ifdef USE_FOG
vec3 fogPos = vec3(0., -70., 0.);
float fogHeight = 85.;
float fogDensity = clamp(1. - (vFogWorldPosition.y - fogPos.y) / fogHeight, .0, 1.);
vec3 fogColor = vec3(235./255., 61./255., 184./255.);

gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, -(cos(fogDensity * 3.14) - 1.) / 2.);
#endif 