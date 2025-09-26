float easeInOutCubic(float x) {
  return x < 0.5 ? 4. * x * x * x : 1. - pow(-2. * x + 2., 3.) / 2.;
}

float easeInOutSine(float x) { return -(cos(3.14159 * x) - 1.) / 2.; }

float easeInOutQuad(float x) {
  return x < 0.5 ? 2. * x * x : 1. - pow(-2. * x + 2., 2.) / 2.;
} 

// pw = 10
float easeInExpo(float x, float pw) {
  return x == 0. ? 0. : pow(2., pw * x - pw);
}

float easeOutExpo(float x, float pw) {
  if (x == 1.) {
    return 1.;
  }

  return  1. - pow(2., -pw * x);
}

float easeInQuint(float x) {
  return x * x * x * x * x;
}

float easeInQuart(float x) {
  return x * x * x * x;
}

float easeOutQuad(float x) {
  return 1. - (1. - x) * (1. - x);
}

float easeInQuad(float x) { return x * x; }

float easeInSine(float x) { return 1. - cos((x * 3.14159) / 2.); }

float easeInCubic(float x) { return x * x * x; }

float easeOutCubic(float x) {
  return 1. - pow(1. - x, 3.);
}

float easeOutQuart(float x) {
  return 1. - pow(1. - x, 2.);
}

float easeOutSine(float x) {
  return sin((x * 3.14159) / 2.);
}

float easeInOutQuart(float x) {
  return x < 0.5 ? 8. * x * x * x * x : 1. - pow(-2. * x + 2., 4.) / 2.;
}