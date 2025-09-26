//-----------------Lch-----------------
// https://www.shadertoy.com/view/lsdGzN
float xyzF(float t){ return mix(pow(t,1./3.), 7.787037*t + 0.139731, step(t,0.00885645)); }
float xyzR(float t){ return mix(t*t*t , 0.1284185*(t - 0.139731), step(t,0.20689655)); }
vec3 rgb2lch(in vec3 c)
{
	c  *= mat3( 0.4124, 0.3576, 0.1805,
          		0.2126, 0.7152, 0.0722,
                0.0193, 0.1192, 0.9505);
    c.x = xyzF(c.x/wref.x);
	c.y = xyzF(c.y/wref.y);
	c.z = xyzF(c.z/wref.z);
	vec3 lab = vec3(max(0.,116.0*c.y - 16.0), 500.0*(c.x - c.y), 200.0*(c.y - c.z)); 
    return vec3(lab.x, length(vec2(lab.y,lab.z)), atan(lab.z, lab.y));
}

vec3 lch2rgb(in vec3 c)
{
    c = vec3(c.x, cos(c.z) * c.y, sin(c.z) * c.y);
    
    float lg = 1./116.*(c.x + 16.);
    vec3 xyz = vec3(wref.x*xyzR(lg + 0.002*c.y),
    				wref.y*xyzR(lg),
    				wref.z*xyzR(lg - 0.005*c.z));
    
    vec3 rgb = xyz*mat3( 3.2406, -1.5372,-0.4986,
          		        -0.9689,  1.8758, 0.0415,
                	     0.0557,  -0.2040, 1.0570);
    
    return rgb;
}

//cheaply lerp around a circle
float lerpAng(in float a, in float b, in float x)
{
    float ang = mod(mod((a-b), TAU) + PI*3., TAU)-PI;
    return ang*x+b;
}

//Linear interpolation between two colors in Lch space
vec3 lerpLch(in vec3 a, in vec3 b, in float x)
{
    float hue = lerpAng(a.z, b.z, x);
    return vec3(mix(b.xy, a.xy, x), hue);
}

//-----------------HSV-----------------

//HSV functions from iq (https://www.shadertoy.com/view/MsS3Wc)
#ifdef SMOOTH_HSV
vec3 hsv2rgb( in vec3 c )
{
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

	rgb = rgb*rgb*(3.0-2.0*rgb); // cubic smoothing	

	return c.z * mix( vec3(1.0), rgb, c.y);
}
#else
vec3 hsv2rgb( in vec3 c )
{
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

	return c.z * mix( vec3(1.0), rgb, c.y);
}
#endif

//From Sam Hocevar: http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

//Linear interpolation between two colors in normalized (0..1) HSV space
vec3 lerpHSV(in vec3 a, in vec3 b, in float x)
{
    float hue = (mod(mod((b.x-a.x), 1.) + 1.5, 1.)-0.5)*x + a.x;
    return vec3(hue, mix(a.yz, b.yz, x));
}