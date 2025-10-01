const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");

const historyBtns = document.querySelectorAll(".history-btn, .history-header");
const historyBox = document.getElementById("history-box");


let expression = "";
let justEvaluated = false;
let chainMode = false;
let lastValue = null;
let lastOperator = null;


function operate(a, b, operator) {
  switch (operator) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return a / b;
    default: return b;
  }
}

function clearAll() {
  expression = "";
  lastValue = null;
  lastOperator = null;
  justEvaluated = false;
  display.textContent = "0";
}


function toggleSign() {
  const match = expression.match(/(.*?)([+\-×÷])?(\d+(\.\d+)?)$/);

  if (match) {
    const before = match[1] || "";
    const operator = match[2] || "";
    const number = match[3];

    if (operator === "+") {
      expression = before + "-" + number;
    } else if (operator === "-") {
      expression = before + "+" + number;
    } else {
      if (number.startsWith("-")) {
        expression = before + number.slice(1);
      } else {
        expression = before + "-" + number;
      }
    }
    display.textContent = expression;
  }
}


function toggleChainMode() {
  chainMode = !chainMode;
  document.getElementById("chainBtn").textContent = chainMode ? "CHAIN: ON" : "CHAIN: OFF";
  clearAll();
}

function calculate() {
  if (chainMode) {
    if (lastValue !== null && lastOperator && expression !== "" && !/[\+\-×÷]$/.test(expression)) {
      let currentNumber = parseFloat(expression.split(/[\+\-×÷]/).pop());
      let result = operate(lastValue, currentNumber, lastOperator);
      display.textContent = result;
      expression = result.toString();
      lastValue = null;
      lastOperator = null;
      justEvaluated = true;
    }
  } else {
    try {
      let expr = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/(\d+(\.\d+)?)%/g, "($1/100)");

      let result = eval(expr);

      if (!Number.isInteger(result)) {
        result = parseFloat(result.toFixed(6));
      }

      
      addToHistory(`${expression} = ${result}`);
      expression = result.toString();
      display.textContent = expression;
      justEvaluated = true;
    } 
    catch {
      display.textContent = "Error";
      expression = "";
    }
  }
}

function appendToDisplay(value) {
  if (justEvaluated) {
    if (/[0-9.]/.test(value)) {
      expression = "";
      lastValue = null;
      lastOperator = null;
    }
    justEvaluated = false;
  }

  if (/[\+\-×÷]/.test(value)) {

    if (/[\+\-×÷]$/.test(expression)) {
      expression = expression.slice(0, -1) + value;
    } else if (chainMode) {

      if (lastValue !== null && lastOperator) {
        let currentNumber = parseFloat(expression.split(/[\+\-×÷]/).pop());
        lastValue = operate(lastValue, currentNumber, lastOperator);
        expression = lastValue.toString() + value;
      } else {
        lastValue = parseFloat(expression);
        expression += value;
      }
      lastOperator = value;
    } else {
      expression += value;
    }
  } else {
    expression += value;
  }

  display.textContent = expression || "0";
}



buttons.forEach(buttons => {
  buttons.addEventListener("click", () => {
    const value = buttons.textContent;

    if (value === "AC") {
      expression = "";
      display.textContent = "0";
    }

    else if (value === "⌫") {
      expression = expression.slice(0, -1);
      display.textContent = expression || "0";
    }

    else if (value === "+/-") {
      toggleSign();
    }

    else if (value === "="){
      calculate();
    }

    else if (buttons.id === "chainBtn") {
      expression = "";
      display.textContent = "0";
    }

    else {
      appendToDisplay(value);
    }
    
  });
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/[0-9.]/.test(key)) {
    appendToDisplay(key);
  }

  else if (key === "+") appendToDisplay("+");
  else if (key === "-") appendToDisplay("-");
  else if (key === "*") appendToDisplay("×");
  else if (key === "/") appendToDisplay("÷");

  else if (key === "Enter") {
    event.preventDefault();
    calculate();
  }

  else if (key === "Backspace") {
    expression = expression.slice(0, -1);
    display.textContent = expression || "0";
  }

  else if (key === "Escape") {
    clearAll();
    display.textContent = "0";
  }

  else if (key === "%") {
    appendToDisplay("%");
  }

});


function addToHistory(entry) {
  const li = document.createElement('li');
  li.textContent = entry;
  document.getElementById('history-box').prepend(li);
}

historyBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    historyBox.classList.toggle("show");
  });
});