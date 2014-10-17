// Classes
var ngPI = {
    /***** Question Object *****/
    // questionName: string - the name of this question
    // questionType: string - the type of this question, e.g. select, text, date
    // isMandatory: bool - whether or not this question is mandatory
    // options: selectListOption[] - can be null for non select lists
    // changeAction: function[] - to be carried out on change - can be null
    // dependencies: question[] - any previous questions that must be answered first
    question: function (questionName, questionType, labelText, isMandatory, options, defaultAnswer, changeActions, dependencies) {
        this.questionName = questionName;
        this.questionType = questionType;
        this.labelText = labelText;
        this.isMandatory = isMandatory;
        this.options = options;
        this.answer = defaultAnswer;
        this.dependencies = dependencies;
        this.changeActions = changeActions || [];

        this.isAvailable = function () {
            var result = false;

            if (!(this.dependencies) || (Array.isArray(this.dependencies) && this.dependencies.length <= 0)) {
                result = true;
            }
            else {
                for (var i = 0; i < this.dependencies.length; i++) {
                    result = this.dependencies[i].isReady();
                    if (result) {
                        break;
                    }
                };
            }

            if (this.questionType == 'select' && (!this.options || this.options.length <= 0)) {
                result = false;
            }

            return result;
        };

        this.isReady = function () {
            var result = false;

            if (!this.isMandatory) {
                result = true;
            }
            else {
                result = (this.isAvailable()
                    && !(this.answer === null)
                    && !(this.answer === undefined)
                    && !(this.answer === ''));
            }

            return result;
        };

        this.onChange = function () {
            for (var i = 0; i < this.changeActions.length; i++) {
                this.changeActions[i](this.answer);
            }
        }
    },

    /***** Report Options Objects *****/
    reportOptions: function (questions) {
        this.questions = questions;

        this.addQuestion = function (question) {
            this.questions.push(question);
        };

        this.getAnswer = function (questionName) {
            var question = ngPI.find(this.questions, function (item) {
                return item.questionName == questionName;
            });
            return question.answer;
        };

        this.setAnswer = function (questionName, answer) {
            var question = ngPI.find(this.questions, function (item) {
                return item.questionName == questionName;
            });
            question.answer = answer;
        };

        this.isAvailable = function () {
            return this.questions && this.questions.length > 0 && this.questions[0].isAvailable();
        };

        this.isReady = function () {
            var result = true;

            for (var i = 0; i < this.questions.length; i++) {
                if (!this.questions[i].isReady()) {
                    result = false;
                    break;
                }
            }

            return result;
        };
    },

    /***** Select List Bindings *****/
    selectListOption: function (id, text) {
        this.id = id;
        this.text = text;
    },

    createSelectList: function (options, defaultText) {
        var selectList = [];

        if (defaultText) {
            selectList.push(new ngPI.selectListOption(null, defaultText));
        };

        if (options && options.length > 0) {
            for (var i = 0; i < options.length; i++) {
                selectList.push(options[i]);
            }
        }

        return selectList;
    },

    /***** Useful Functions *****/
    //Find an element in an array based on a given predicate.
    find: function (array, predicate) {
        var length = array.length;
        var value;
        for (var i = 0; i < length; i++) {
            if (predicate(array[i])) {
                value = array[i];
                break;
            }
        }
        return value;
    }
};
