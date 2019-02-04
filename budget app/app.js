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

    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp:0,
            inc:0
        }
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
        expensesContainer: '.expenses__list'
    };


    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value, //Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: document.querySelector(DOMstrings.inputValue).value
            }; 
        },

        addListItem: function(object, type) {
            var html, newHtml, element;
            //Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //Replace the placeholder with actual data
            newHtml = html.replace('%id%', object.id);
            newHtml = newHtml.replace('%description%', object.description);
            newHtml = newHtml.replace('%value%', object.value);

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        
        getDOMstrings: function(){
            return DOMstrings;
        }
    };

})();




//global app controller (central controller)
var controller = (function(budgetCtrl, UIctrl){
    var setupEventListeners = function() {
        var DOM = UIctrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 | event.which === 13) {
                ctrlAddItem();
            }
        });

    }
   
    var ctrlAddItem = function() {
        var input, newItem;
        // 1. get the input data
        input = UIctrl.getInput();
        console.log(input);
        //2. add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        //3. add the item to the UI controller
        UIctrl.addListItem(newItem, input.type);

        //4. calculate the budget

        //5.display the budget on the UI
        
    }

    return {
        init: function(){
            setupEventListeners();
        }
    }
    

})(budgetController, UIController);

controller.init();
