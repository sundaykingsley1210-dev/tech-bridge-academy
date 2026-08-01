// ============================================
// JAVASCRIPT ASSIGNMENT
// Array Methods & Object Methods
// find, filter, map, reduce + Object methods
// ============================================


// ── SECTION A: ARRAY METHODS ──────────────────


// Q1: find()
let numbers = [3, 7, 12, 5, 19, 8];
let found = numbers.find(function(num) {
  return num > 10;
});
console.log(found);  // 12


// ─────────────────────────────────────────────

// Q2: find() with Objects
let students = [
  { name: "Amina", score: 78 },
  { name: "Kofi",  score: 45 },
  { name: "Lola",  score: 91 }
];
let foundStudent = students.find(function(student) {
  return student.name === "Kofi";
});
console.log(foundStudent);  // { name: "Kofi", score: 45 }


// ─────────────────────────────────────────────

// Q3: filter()
let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let evenNumbers = nums.filter(function(num) {
  return num % 2 === 0;
});
console.log(evenNumbers);  // [2, 4, 6, 8, 10]


// ─────────────────────────────────────────────

// Q4: filter() with Objects
let products = [
  { name: "Shirt",  price: 25, inStock: true  },
  { name: "Shoes",  price: 60, inStock: false },
  { name: "Hat",    price: 15, inStock: true  },
  { name: "Bag",    price: 40, inStock: false },
  { name: "Watch",  price: 80, inStock: true  }
];
let available = products.filter(function(product) {
  return product.inStock === true;
});
console.log(available);


// ─────────────────────────────────────────────

// Q5: map()
let values = [1, 2, 3, 4, 5];
let doubled = values.map(function(num) {
  return num * 2;
});
console.log(doubled);  // [2, 4, 6, 8, 10]


// ─────────────────────────────────────────────

// Q6: map() with Objects
let classList = [
  { name: "Amina",  score: 78 },
  { name: "Kofi",   score: 45 },
  { name: "Lola",   score: 91 },
  { name: "Emeka",  score: 60 }
];
let names = classList.map(function(student) {
  return student.name;
});
console.log(names);  // ["Amina", "Kofi", "Lola", "Emeka"]


// ─────────────────────────────────────────────

// Q7: reduce()
let prices = [10, 20, 30, 40, 50];
let total = prices.reduce(function(acc, curr) {
  return acc + curr;
}, 0);
console.log(total);  // 150


// ─────────────────────────────────────────────

// Q8: reduce() with Objects
let cart = [
  { name: "Shirt",    price: 25 },
  { name: "Shoes",    price: 60 },
  { name: "Hat",      price: 15 },
  { name: "Trousers", price: 45 }
];
let cartTotal = cart.reduce(function(acc, curr) {
  return acc + curr.price;
}, 0);
console.log(cartTotal);  // 145


// ── SECTION B: OBJECT METHODS ─────────────────


// Q9: Object.keys() and Object.values()
let person = {
  name: "Amina",
  age: 25,
  city: "Lagos",
  job: "Developer"
};

console.log(Object.keys(person));    // ["name", "age", "city", "job"]
console.log(Object.values(person));  // ["Amina", 25, "Lagos", "Developer"]


// ─────────────────────────────────────────────

// Q10: Object.entries()
let scores = {
  Maths:   85,
  English: 72,
  Science: 90,
  History: 68
};

Object.entries(scores).forEach(function(entry) {
  let key = entry[0];
  let value = entry[1];
  console.log(key + ": " + value);
});

// Maths: 85
// English: 72
// Science: 90
// History: 68