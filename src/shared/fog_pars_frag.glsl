#ifdef USE_FOG 
    uniform vec3 fogColor;
    uniform vec3 fogNearColor; 

        #ifdef FOG_EXP2
            uniform float fogDensity;
        #else
            uniform float fogNear;
            uniform float fogFar;
        #endif
        
    varying vec3 vFogWorldPosition;
    uniform float time; 
#endif