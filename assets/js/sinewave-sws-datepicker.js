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
	
	this.SWSDatepicker = function(options) {
        var self = this;
        this.dates = null;
        this.dateTable = null;
        this.dateHeader = null;
        this.dateBody = null;
        this.controls = null;
		this.prev = null;
        this.next = null;
        this.current = null;
        this.currentMonth = null;
        this.currentYear = null;
        this.currentField = null;
        this.date = new Date();
        this.day = null;
		this.month = null;
        this.year = null;
        this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.position = {
            x: null,
            y: null
        };
        
		var config = {
            type: 'standard',
            selector: null,
            placeholder: '',
            sticky: false
		};		
		
		if(options && typeof options === 'object' && isNaN(options)) {
			this.o = extend(config, options);
		}
		else {
			this.o = config;
        }
        
        this.field = document.querySelectorAll(this.o.selector);

        this.init();
	};
	
	SWSDatepicker.prototype.init = function() {
        var self = this;
        var i = 0;
        var xPosition;
        var yPosition;

        bindElements.call(this);

        // set initial date values
        this.setDateValues();

        // render the calendar
        this.render();

        if(this.o.sticky !== false) {
            this.dates.classList.add('is-sticky');
        }

        [].forEach.call(this.field, function(field) {
            // set the placeholder
            field.placeholder = self.o.placeholder;

            // don't allow the datepicker input to be auto-completed
            field.autocomplete = 'off';

            field.addEventListener('click', function() {
                // set the current field to this input
                self.currentField = this;

                // show the datepicker
                self.dates.style.display = 'block';
                
                // highlight the current input so the user knows what's selected
                this.select();

                // get the current bounding position of the selected field
                var rect = this.getBoundingClientRect();
                xPosition = rect.x + window.scrollX;
                yPosition = rect.y + window.scrollY + rect.height;

                self.setPosition.call(self, xPosition, yPosition);

            }, false);
        });

        document.addEventListener('click', function(e) {
            var target = e.target;
            if(self.dates.style.display == 'block') {
                if(!self.dates.contains(target) && target !== self.currentField) {
                    self.dates.style.display = 'none';
                }
            }
        });

        window.addEventListener('resize', function() {
            if(self.dates.style.display == 'block') {
                self.dates.style.display = 'none';
            }
        });
	};
	
	SWSDatepicker.prototype.render = function() {
        var counter = 1;

        var startDay = new Date(this.year, this.month).getDay();
        var totalDays = new Date(this.year, this.month + 1, 0).getDate();

        this.dateBody.innerHTML = '';

        for(var tr = 0; tr < 6; tr++) {
            var row = create('tr', '', '');
            for(var td = 0; td < 7; td++) {
                if(counter <= totalDays && (tr > 0 || td >= startDay)) {
                    row.appendChild(create('td', counter, 'sw-standard-datepicker-body-cell'));
                    counter++;
                }
                else {
                    row.appendChild(create('td', '--', 'sw-standard-datepicker-body-cell-empty'));
                }
            }
            this.dateBody.appendChild(row);
        }
	}

    SWSDatepicker.prototype.setDateValues = function() {
        this.month = this.date.getMonth();
        this.year = this.date.getFullYear();

        this.currentMonth = this.month;
        this.currentYear = this.year;

        this.currentMonthValue.innerHTML = this.months[this.currentMonth];
        this.currentYearValue.innerHTML = this.currentYear;

        return this;
    };

	SWSDatepicker.prototype.progress = function() {
        var args = [].slice.call(arguments)[0];

        this.month = new Date(this.date.setMonth(args)).getMonth();
        this.year = new Date(this.date.setFullYear(this.date.getFullYear())).getFullYear();

        this.currentMonth = this.month;
        this.currentYear = this.year;

        this.currentMonthValue.innerHTML = this.months[this.currentMonth];
        this.currentYearValue.innerHTML = this.currentYear;

        // re-render the calendar
        this.render();
    };

    SWSDatepicker.prototype.close = function() {
        this.dates.style.display = 'none';
        this.dates.style.left = 0;
        this.dates.style.top = 0;
        return this;
    };

    SWSDatepicker.prototype.setPosition = function(x, y) {
        this.position.x = x;
        this.position.y = y;

        if(this.dates.style.display == 'block') {
            this.dates.style.left = this.position.x + 'px';
            this.dates.style.top = this.position.y + 'px';
        }
    };

    function bindElements() {
        this.dates = create('div', '', 'sw-standard-datepicker');
        this.controls = create('div', '', 'sw-standard-datepicker-controls');
        this.current = create('div', '', 'sw-standard-datepicker-current');
        this.currentMonthValue = create('span', '', 'sw-standard-datepicker-current-date month');
        this.currentYearValue = create('span', '', 'sw-standard-datepicker-current-date year');
        this.prev = create('div', '<img src="assets/img/icons/arrow-left.svg">', 'sw-standard-datepicker-icon prev');
        this.next = create('div', '<img src="assets/img/icons/arrow-right.svg">', 'sw-standard-datepicker-icon next');
        this.dateTable = create('table', '', 'sw-standard-datepicker-table');
        this.dateHeader = create('thead', '<tr></tr>', 'sw-standard-datepicker-header');
        this.dateBody = create('tbody', '', 'sw-standard-datepicker-body');
        this.reset = create('button', 'Reset Date', 'sw-standard-datepicker-reset button is-issue is-filled is-small font-14 w-100');

        var weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for(var i = 0; i < weekdays.length; i++) {
            var th = create('th', weekdays[i], 'sw-standard-datepicker-header-cell');
            this.dateHeader.firstElementChild.appendChild(th);
        }

        this.current.appendChild(this.currentMonthValue);
        this.current.appendChild(this.currentYearValue);

        this.controls.appendChild(this.prev);
        this.controls.appendChild(this.current);
        this.controls.appendChild(this.next);
        this.dates.appendChild(this.controls);
        this.dateTable.appendChild(this.dateHeader);
        this.dateTable.appendChild(this.dateBody);
        this.dates.appendChild(this.dateTable);
        this.dates.appendChild(this.reset);
        
        // append everything to the DOM 
        var mainContent = document.querySelector('.main-content');
        mainContent.insertAdjacentElement('beforeend', this.dates);

        // wire up all event handlers
        bindEvents.call(this);
    }
    
    function bindEvents() {
        var self = this;

        this.prev.addEventListener('click', function() {
            self.progress.call(self, self.date.getMonth() - 1)
        });
        
        this.next.addEventListener('click', function() {
            self.progress.call(self, self.date.getMonth() + 1)
        });

        this.dateBody.addEventListener('click', function(e) {
            e = e.target || window.event;
            if(e.nodeName == 'TD' && !e.classList.contains('sw-standard-datepicker-body-cell-empty')) {
                self.currentField.value = (self.month + 1) + '/' + e.innerText + '/' + self.year;
                self.close();
            }
        });

        this.reset.addEventListener('click', function() {
            // reset the date to the current date and month
            var m = new Date().getMonth();
            var y = new Date().getFullYear();

            self.month = new Date(self.date.setMonth(m)).getMonth();
            self.year = new Date(self.date.setFullYear(y, self.month)).getFullYear();

            self.currentMonth = self.month;
            self.currentYear = self.year;

            self.currentMonthValue.innerHTML = self.months[self.currentMonth];
            self.currentYearValue.innerHTML = self.currentYear;

            self.render();
        });
    }
	
})();
