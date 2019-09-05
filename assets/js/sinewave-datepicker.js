;(function() {

    function create(node, text, styles, attrs) {
        node = document.createElement(node);
        node.innerHTML = (text !== null || text !== undefined) ? text : '';
        if (!styles || styles === null || styles === undefined) {
            node.removeAttribute('class');
        }
        else {
            node.className = styles;
        }
        if (attrs) {
            for (var key in attrs) {
                if (attrs.hasOwnProperty(key)) {
                    node.setAttribute(key, attrs[key]);
                }
            }
        }
        return node;
    }

    function extend(source, target) {
        for (var key in target) {
            if (target.hasOwnProperty(key)) {
                source[key] = target[key];
            }
        }
        return source;
    }

    this.SWDatepicker = function(options, callback) {
        var self = this;
        this.datepicker = null;
        this.wrapper = null;
        this.months = null;
        this.days = null;
        this.years = null;
        this.currentField = null;
        this.currentFieldValue = ['mm', 'dd', 'yyyy'];
        this.position = {
            x: null,
            y: null
        };
        
        var _date = new Date();
        var _offset = 30;
        var _months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        var config = {
            startYear: null,
            endYear: null,
            sticky: false
        };
        
        if(options && typeof options === 'object' && isNaN(options)) {
            this.o = extend(config, options);
        }
        else {
            this.o = config;
        }
        
        this.field = document.querySelectorAll(this.o.selector);
        
        if(!document.body.contains(this.datepicker)) {
            this.datepicker = create('div', '', 'sw-datepicker');
            this.wrapper = create('div', '', 'sw-datepicker-wrapper');

            if(this.o.sticky !== false) {
                this.datepicker.classList.add('is-sticky');
            }
    
            // create the months column
            this.months = create('div', '', 'sw-datepicker-column sw-datepicker-months');
    
            // create each month
            for (var m = 0; m < _months.length; m++) {
                var month = create('div', _months[m], 'sw-datepicker-value sw-datepicker-month', {
                    'data-month': (m < 10 ? '0' + (m + 1): m + 1)
                });
                this.months.appendChild(month);
            }
    
            this.wrapper.appendChild(this.months);
    
            // create the days column
            this.days = create('div', '', 'sw-datepicker-column sw-datepicker-days');
    
            // create each day
            for (var d = 1; d <= 31; d++) {
                var day = create('div', d < 10 ? '0' + d : d, 'sw-datepicker-value sw-datepicker-day');
                this.days.appendChild(day);
            }
    
            this.wrapper.appendChild(this.days);
    
            // create the years column
            this.years = create('div', '', 'sw-datepicker-column sw-datepicker-years');
    
            // set the startYear 
            if (this.o.startYear !== null && typeof this.o.startYear == 'number' && !isNaN(this.o.startYear)) {
                this.startYear = this.o.startYear;
            }
            else {
                this.startYear = _date.getFullYear();
            }

            // set the endYear
            if(this.o.endYear != null && typeof this.o.endYear == 'number' && !isNaN(this.o.endYear)) {
                this.endYear = this.o.endYear;
            }
            else {
                this.endYear = this.startYear - _offset;
            }

            for (var y = this.startYear; y > this.endYear; y--) {
                var year = create('div', y, 'sw-datepicker-value sw-datepicker-year');
                this.years.appendChild(year);
            }
    
            this.wrapper.appendChild(this.years);

            this.datepicker.appendChild(this.wrapper);
    
            document.body.insertAdjacentElement('beforeend', this.datepicker);

            this.init();
        }

        document.addEventListener('click', function (e) {
            var target = e.target;
            if (!self.datepicker.contains(target) && self.currentField != target) {
                resetSWDatepickerPosition.call(self);
            }
        });
               
        if (typeof callback === 'function') {
            callback.call(this, this.datepicker);
        }
    }

    function renderSWDatepicker(event) {
        this.currentField = event.target;

        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var offsetX, offsetY;

        // get current field bounding values
        var pageX, pageY;
        var box = this.currentField.getBoundingClientRect();

        if (box.left + 250 > windowWidth) {
            console.log('SWDatepicker has exceeded maximum viewport width');
        }

        pageX = box.x + window.scrollX;
        
        if(this.o.sticky !== false) {
            pageY = box.y + (box.height + 8);
        }
        else {
            pageY = box.y + window.scrollY + (box.height + 8);
        }

        // set the datepicker position
        setSWDatepickerPosition.call(this, pageX, pageY);
    }

    function setSWDatepickerPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.datepicker.style.left = this.position.x + 'px';
        this.datepicker.style.top = this.position.y + 'px';
        this.datepicker.classList.add('is-visible');
    }

    function resetSWDatepickerPosition() {
        this.currentFieldValue = [01, 01, this.startYear];
        this.datepicker.style.left = 0;
        this.datepicker.style.top = 0;
        this.datepicker.classList.remove('is-visible');
    }

    SWDatepicker.prototype = {
        init: function() {
            var self = this;

            resetSWDatepickerPosition.call(this);

            // set the input date
            this.days.addEventListener('click', this.setDate.bind(this));
            this.months.addEventListener('click', this.setDate.bind(this));
            this.years.addEventListener('click', this.setDate.bind(this));

            for (var i = 0, len = this.field.length; i < len; i++) {
                if (this.field[i].nodeName !== 'INPUT' && this.field[i].getAttribute('type') !== 'text') {
                    throw new Error('Cannot render SW Datepicker. Check the node type and ensure it is an \'INPUT\' element with a \'type\' of \'text\' ');
                }
                else {
                    this.field[i].placeholder = 'mm/dd/yyyy';
                    this.field[i].addEventListener('click', function (e) {
                        this.select();
                        renderSWDatepicker.call(self, e);
                    });
                }
            }

            window.addEventListener('resize', resetSWDatepickerPosition.bind(this));
        },
        setDate: function (event) {
            var self = this;
            var target = event.target;

            if (target.classList.contains('sw-datepicker-month')) {
                self.currentFieldValue[0] =target.getAttribute('data-month');
            }
            else if (target.classList.contains('sw-datepicker-day')) {
                self.currentFieldValue[1] = target.innerText;
            }
            else {
                self.currentFieldValue[2] = target.innerText;
            }

            self.currentField.value = self.currentFieldValue.join('/');
        }
    }

})();
