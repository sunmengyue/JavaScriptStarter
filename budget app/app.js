//Budget Controller
var budgetController = (function() {
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
        
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp:0,
            inc:0
        },
        
        budget: 0,

        percentage: -1 //represent something does not exist

    };

    return {
        addItem: function(type, des, val){
           var newItem, ID;
           
           if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
           } else {
               ID = 0;
           }
            
           if (type === 'exp') {
                newItem = new Expense(ID, des, val);
           } else if (type === 'inc') {
            newItem = new Income(ID, des, val);
           }
           data.allItems[type].push(newItem);
           return newItem; //other module will get direct acess to this item
        },

        calculateBudget: function() {

            // calculate total income and expenses
           calculateTotal('exp');
           calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income we spent: expenses / income
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalExp: data.totals.exp,
                totalInc: data.totals.inc,
                percentage: data.percentage

            };
        },


        testing: function() {
            console.log(data);
        }

    }

    

})();


//UI controller
var UIController = (function(){
    var DOMstrings = {
        inputType: '.add__type', 
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLable: '.budget__value',
        incomeLable: '.budget__income--value',
        expensesLable: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        container: '.container'
    };


    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value, //Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)// transform a string not a number
            }; 
        },

        addListItem: function(object, type) {
            var html, newHtml, element;
            //Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //Replace the placeholder with actual data
            newHtml = html.replace('%id%', object.id);
            newHtml = newHtml.replace('%description%', object.description);
            newHtml = newHtml.replace('%value%', object.value);

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        clearFields: function() {
            var fields, fieldsArr  ; 
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            //The querySelectAll returns a list, so we need to convert the list into an array
            //The slice method returns an array.
            //We cannot call fields.slice() because fields is not an array object. We 
            var fieldsArr = Array.prototype.slice.call(fields); 

            fieldsArr.forEach(function(current, index, arr) {
                current.value = "";
            })
            fieldsArr[0].focus(); //focus back to the first blank
        },

        displayBudget: function(obj) {// the obj is budgetCtrl.getBudget()
            document.querySelector(DOMstrings.budgetLable).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLable).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLable).textContent = obj.totalExp;
           
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLable).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLable).textContent = '-----';
            }
        },
        
        getDOMstrings: function(){
            return DOMstrings;
        }
    };

})();


//Global app controller (central controller)
var controller = (function(budgetCtrl, UIctrl){
    var setupEventListeners = function() {
        var DOM = UIctrl.getDOMstrings(); 
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 | event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); //event delegation
    } //Note to use DOM not DOMstrings

    

    var updateBudget = function() {
        // 1.calculate the budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        var budget = budgetCtrl.getBudget();

        // 3.display the budget on the UI
        UIctrl.displayBudget(budget);
    }
   
    var ctrlAddItem = function() {
        var input, newItem;
        // 1. get the input data
        input = UIctrl.getInput();
    
        if (input.description != '' && !isNaN(input.value) && input.value > 0) {
            //2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. add the item to the UI controller
            UIctrl.addListItem(newItem, input.type);

            //4.clear the fields
            UIctrl.clearFields();
            
            //5. Calucluate and update budget
            updateBudget();
        }
        
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            //inc-1
            splitID = itemID.split('-'); //return an array
            type = splitID[0];
            ID = splitID[1];

            //1. Delete the item from the data structure

            //2. Delete the item from the UI

            //3. Update and show the budget
        }   
    };

    return {
        init: function(){
            console.log('Application has started');
            UIctrl.displayBudget({
                budget: 0,
                totalExp: 0,
                totalInc: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
    

})(budgetController, UIController);

controller.init();
