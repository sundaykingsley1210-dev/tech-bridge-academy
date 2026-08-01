function canDrive(age) {
  if (age >= 16) {
    return "Yes, you can drive";
  } else {
    return "No, too young";
  }
}

console.log(canDrive(18));  // Yes, you can drive
console.log(canDrive(14));  // No, too young