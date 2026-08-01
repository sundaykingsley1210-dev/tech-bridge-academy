function toCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5 / 9).toFixed(1);
}

console.log(toCelsius(98.6));  // 37.0