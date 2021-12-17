//this my approach in creating error classes
//Why i made the error class a module
//1)large applications has different of error classes
//2)making Custom error class and exporting it within the project would create the class
//every time your require the class

//example:
// error.js : export default class CustomError extends error{ ... }
// file.js :
// import CustomError from './error.js"
//  export default new CustomError(...)
//anotherFile.js
// import CustomError from './error.js'
// import ErrorInstance from './files.js'
//  console.lgo(ErrorInstance instanceof CustomError)  ===> false
//with this we can check against classes

export default class ErrorResponse extends Error {
   constructor(message, statusCode, name) {
      super(message);
      this.statusCode = statusCode;
      this.name = name;
   }
}
