const displayBox = document.querySelector(".display"),
      displayInput = document.querySelector(".display-input"),
      displayResult = document.querySelector(".display-result"),
      buttons = document.querySelectorAll("button"),
      operators = ["%", "/" , "x"  , "-" , "+"];
   

let input = "",
    result = "",
    lastCalculation = false;

const calculate = btnValue =>{

   const lastChar = input.slice(-1),
         secondTolastChar = input.slice(-2, -1),
         withoutLastChar = input.slice(0, -1),
         isLastCharOperator = operators.includes(lastChar),
         isInvalidResult = [ "Error", "Infinity"].includes(result);

   let { openBracketsCount, closeBracketsCount} = countBrackets(input);


   if (btnValue === "=") {

      if (
         input === "" ||
         lastChar === "." ||
         lastChar === "(" ||
         isLastCharOperator && lastChar !== "%" ||
         lastCalculation
      ) return;

      while (openBracketsCount > closeBracketsCount) {
         input += ")";
         closeBracketsCount++;
      }


      const formattedInput = replaceOperators(input);
      try {
         const calculatedValue = input.includes("%") ? calculatePercentage(input) : eval(formattedInput);
         result = parseFloat(calculatedValue.toFixed(10)).toString();
      }
      catch {
         result = "Error";
      }

      lastCalculation = true;
      input += btnValue;
      displayBox.classList.add("active");
   }
   
   else if (btnValue === "AC"){
      resetCalculator("");
   }

   else if (btnValue === "") {
      if (lastCalculation){
         if (isInvalidResult) resetCalculator("");
         resetCalculator(result.slice(0, -1));
      }
      else input = withoutLastChar;
   }

   else if (operators.includes(btnValue)){
      if (lastCalculation){
         if(isInvalidResult) return;
         resetCalculator(result + btnValue);
      }
      else if (
         (input === "" || lastChar === "(") && btnValue !== "-" ||
         input === "-" ||
         lastChar === "." ||
         secondTolastChar === "(" && lastChar === "-" ||
         (secondTolastChar === "%" || lastChar === "%" ) && btnValue === "%"
      )return;
      else if (lastChar === "%") input += btnValue;
      else if (isLastCharOperator) input = withoutLastChar + lastChar;
      else input += btnValue;
   }

   else if (btnValue === "."){
      const decimalValue = "0.";
      if (lastCalculation) resetCalculator(decimalValue);
      else if (lastChar === ")" || lastChar === "%") input += "x" + decimalValue;
      else if (input === "" || isLastCharOperator || lastChar === "(");
      else {
         let lastOperatorIndex = -1;
         for (const operator of operators){
            const index = input.lastIndexOf(operator);
            if (index > lastOperatorIndex) lastOperatorIndex = index;
         }

         if (!input.slice(lastOperatorIndex + 1).includes(".")) input += btnValue;
      }
         
   }

   else if ( btnValue === "( )"){
      if (lastCalculation){
         if (isInvalidResult) resetCalculator("(")
         else resetCalculator(result + "x(");
      }
      else if (lastChar === "(" || lastChar === ".") return;
      else if (input === "" || isLastCharOperator && lastChar !== "%")
      input += "(";
      else if (openBracketsCount > closeBracketsCount) input += ")";
      else input += "x(";
   }

   else{
      if (lastCalculation) resetCalculator(btnValue);
      else if (input === "0") input = btnValue;
      else if ((operators.includes(secondTolastChar) || secondTolastChar ==="(") && lastChar === "0") input = withoutLastChar + btnValue;
      else if (lastChar === ")" || lastChar === "%") input += "x" + btnValue;
      else input += btnValue;
   }



   displayInput.value = input;
   displayResult.value = result;
   displayInput.scrollLeft = displayInput.scrollWidth;
}

const replaceOperators = input => input.replaceAll("%", "/100").replaceAll
("x", "*");

const resetCalculator = newInput =>{
   input = newInput;
   result = "";
   lastCalculation = false;
   displayBox.classList.remove("active");
}

const countBrackets = input =>{
   let openBracketsCount = 0,
       closeBracketsCount = 0;

   for (const char of input){
      if (char === "(") openBracketsCount++;
      else if (char === ")")closeBracketsCount++;
   }

   return {openBracketsCount, closeBracketsCount};
}

const calculatePercentage = input =>{
   let processendInput = "",
       numberBuffer = "";

   const bracketsState = []

   for (let i = 0; i < input.length; i++){
      const char = input[i];

      if (!isNaN(char) || char === ".") numberBuffer += char;

      else if (char === "%"){
         const percentValue = parseFloat(numberBuffer) /100,
               pervOperator = i > 0 ? input [i -numberBuffer.length -1] : "",
               nextOperator = i + 1 < input.length && operators.includes(input [i + 1]) ? input [i + 1] : "";

         if (!pervOperator || pervOperator === "/" || pervOperator === "x" || pervOperator === "(") processendInput += percentValue;
         else if (pervOperator === "-" || pervOperator === "+") {
            if (nextOperator === "/" || nextOperator === "x")
               processendInput += percentValue;
            else processendInput += "(" + processendInput.slice(0, -1) +
            ")*" + percentValue;
         }

         numberBuffer = "";
      }

      else if (operators.includes(char) || char === "(" || char === ")"){
         if (numberBuffer){
            processendInput += numberBuffer;
            numberBuffer = "";
         }

         if (operators.includes(char)) processendInput += char;
         else if (char === "("){
            processendInput += "(";
            bracketsState.push(processendInput);
            processendInput = "";
         }

         else{
            processendInput += ")";
            processendInput = bracketsState.pop() + processendInput;
         }
      }
   }

   if (numberBuffer) processendInput += numberBuffer;

   return eval(replaceOperators(processendInput));
};


buttons.forEach(button => 
   button.addEventListener("click", e => calculate(e.target.textContent))
);
