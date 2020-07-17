## Quantum Simulator in a Google Spreadsheet

### Number encoding

This displays the phase estimation procedure used to encode numbers.
The example uses v = 4.75.
```js
const theta = v * 2 * Math.PI/2**n;
  
  for(let i = 0; i < n; i++){
    transform(n, i, h)
  }
  
  for(let i = 0; i < n; i++){
    transform(n, i, phase((2**i)*theta))
  }
  
  iQFT(n, [...Array(n).keys()]);
```
![](numberEncoding.png)
### Binary strings with no consecutive 1s

This displays transformations with controlled gates.
```js
for (let i = 0; i < n; i++) {
           transform(n, i, rx(Math.PI / 2))
       }
       for (let j = 1; j < n; j++) {
           cTransform(n, [j - 1], j, rx(-Math.PI / 2))
       }
```
![](fibonacci.png)

### Binary strings with no three consecutive 1s

This displays transformations with multiple controlled gates.
```js
for (let i = 0; i < n; i++) {
        transform(n, i, rx(Math.PI / 2))
    }
    for (let j = 2; j < n; j++) {
        mCTransform(n, [j - 1, j - 2], j, rx(-Math.PI / 2))
    }
```
![](tribonacci.png)
