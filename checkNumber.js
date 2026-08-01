function checkNumber(num) {
  if (num % 2 === 0) {
    return "Even";
  } else {
    return "Odd";
  }
}

console.log(checkNumber(8));   // Even
console.log(checkNumber(13));  // Odd