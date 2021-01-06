#ifdef USE_FOG 
    vFogWorldPosition = (modelMatrix * vec4( transformed, 1.0 )).xyz;
#endif