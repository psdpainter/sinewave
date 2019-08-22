(function () {

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

    function removeClass(parent, name) {
        [].forEach.call(parent, function (node) {
            return node.classList.remove(name);
        });
    }

    function addClass(parent, name) {
        [].forEach.call(parent, function (node) {
            return node.classList.add(name);
        });
    }

    function getType(obj) {
        return Object.prototype.toString.call(obj);
    }

    function searchObject(obj, key) {
        var value;
        Object.keys(obj).some(function (k) {
            if (k === key) {
                value = obj[key];
                return true;
            }
            if (obj[k] && typeof obj[k] === 'object') {
                value = searchObject(obj[k], key);
                return value !== undefined;
            }
        });
        return value;
    }

    // MODAL COMPONENT
    this.SWModal = function (options, callback) {
        this.container = null;
        this.overlay = null;
        this.modal = null;
        this.modalControlBar = null;
        this.buttonControlBar = null;
        this.minimizeButton = null;
        this.maximizeButton = null;
        this.closeButton = null;

        // button controls
        this.destroyButton = null;
        this.submitButton = null;

        var config = {
            width: 'auto',
            height: 'auto',
            title: null,
            content: null,
            overflow: false,
            minimized: false,
            maximized: false,
            buttonControls: {
                spacing: null,  // string that accepts 'between', 'start', and 'end'
                buttons: null   // array that accepts object { type: 'cancel/submit', text: '{string}' }
            }
        };

        if (options && typeof options === 'object' && isNaN(options)) {
            this.o = extend(config, options);
        }
        else {
            this.o = config;
        }

        this.container = document.querySelector('.sw-modal-container');

        if (!this.container) {
            this.container = create('div', '', 'sw-modal-container');
            this.overlay = create('div', '', 'sw-modal-overlay');
            this.container.insertAdjacentElement('afterbegin', this.overlay);
            document.body.insertAdjacentElement('beforeend', this.container);

            renderModal.call(this);
        }

        if (typeof callback === 'function') {
            callback.call(this);
        }
    };

    function renderModal() {
        this.modal = create('div', '', 'sw-modal');
        this.contentWrapper = create('div', '', 'sw-modal-content-wrapper');
        this.modal.appendChild(this.contentWrapper);
        this.container.appendChild(this.modal);

        renderModalOptions.call(this);
    }

    function renderModalOptions() {
        var self = this,
            w = this.o.width,
            h = this.o.height;
        if (this.o.width > window.innerWidth) {
            w = window.innerWidth;
        }
        if (this.o.height > window.innerHeight) {
            h = window.innerHeight;
        }

        // set default height
        typeof h !== 'number' && isNaN(h) ? this.modal.style['height'] = 'auto' : this.modal.style['height'] = h + 'px';

        // set default width
        typeof w !== 'number' && isNaN(w) ? this.modal.style['width'] = 'auto' : this.modal.style['width'] = w + 'px';

        // modal control buttons
        this.modalControlBar = create('div', '', 'sw-modal-controls');
        this.modal.insertAdjacentElement('afterbegin', this.modalControlBar);

        if (this.o.minimized !== false && typeof this.o.minimized === 'boolean') {
            this.minimizeButton = create('div', '<img src="assets/img/minimize.svg" alt="Modal dialog minimize icon">', 'sw-modal-control-button sw-modal-minimize');
            this.modalControlBar.insertAdjacentElement('beforeend', this.minimizeButton);
        }

        if (this.o.maximized !== false && typeof this.o.maximized === 'boolean') {
            this.maximizeButton = create('div', '<img src="assets/img/maximize.svg" alt="Modal dialog maximize icon">', 'sw-modal-control-button sw-modal-maximize');
            this.modalControlBar.insertAdjacentElement('beforeend', this.maximizeButton);
        }

        // create the modal close button
        this.closeButton = create('div', '<img src="assets/img/close.svg" alt="Modal dialog close icon">', 'sw-modal-control-button sw-modal-close');
        this.modalControlBar.appendChild(this.closeButton);

        if (this.o.title != null) {
            this.o.title = this.o.title;
            this.contentWrapper.insertAdjacentElement('afterbegin', create('div', this.o.title, 'sw-modal-title'));
        }

        if (this.o.content != null) {
            this.o.content = this.o.content.innerHTML || this.o.content;
            if (typeof this.o.content === 'function') {
                this.o.content = this.o.content();
            }
            this.contentWrapper.appendChild(create('div', '<div class="sw-modal-inner">' + this.o.content + '</div>', 'sw-modal-content'));
        }

        if (typeof this.o.buttonControls === 'object') {
            if (this.o.buttonControls.buttons != null) {
                this.buttonControlBar = create('div', '', 'sw-modal-button-controls');
                this.modal.insertAdjacentElement('beforeend', this.buttonControlBar);

                var buttons = searchObject(this.o.buttonControls, 'buttons');
                if (buttons != null && buttons.length > 0) {
                    for (var i = 0; i < buttons.length; i++) {
                        var button = buttons[i];
                        createButtonControl.call(self.buttonControlBar, button.type, button.text);
                    }
                }

                var spacing = this.o.buttonControls.spacing;
                if (spacing != null) {
                    switch (spacing) {
                        case 'between': this.buttonControlBar.classList.add('between'); break;
                        case 'end': this.buttonControlBar.classList.add('end'); break;
                        default: this.buttonControlBar.classList.add('start');
                    }
                }
                
                this.destroyButton = this.buttonControlBar.querySelector('.sw-destroy');
                this.submitButton = this.buttonControlBar.querySelector('.sw-submit');

                if (this.destroyButton != null) {
                    this.destroyButton.addEventListener('click', this.destroy.bind(this));
                }
                if (this.submitButton != null) {
                    this.submitButton.addEventListener('click', this.cancel.bind(this));
                }
            }
        }

        // click events
        this.container.addEventListener('click', this.clickOutsideToClose.bind(this));
        this.minimizeButton.addEventListener('click', this.minimize.bind(this));
        this.maximizeButton.addEventListener('click', this.maximize.bind(this));
        this.closeButton.addEventListener('click', this.cancel.bind(this));
    }

    function createButtonControl(type, text) {
        var classType = type == 'destroy' ? 'is-warning sw-destroy' : type == 'submit' ? 'is-success sw-submit' : '';
        if (type == 'destroy') {
            this.destroyButton = create('button', text == '' ? type : text, 'button ' + classType + ' sw-modal-button');
            this.appendChild(this.destroyButton);
        }
        if (type == 'submit') {
            this.submitButton = create('button', text == '' ? type : text, 'button ' + classType + ' sw-modal-button');
            this.appendChild(this.submitButton);
        }
    }

    SWModal.prototype = {
        open: function () {
            if (!this.container.classList.contains('is-open')) {
                this.container.classList.add('is-open');
            }
        },
        destroy: function () {
            var self = this;
            var timeout = window.setTimeout(function () {
                self.container.className = 'sw-modal-container';
                window.setTimeout(function () {
                    self.container.parentNode.removeChild(self.container);
                }, 500);
                window.clearTimeout(timeout);
            }, 100);
        },
        cancel: function () {
            this.container.className = 'sw-modal-container';
        },
        clickOutsideToClose: function () {
            var target = window.event.target;
            if (this.container.contains(target) && !this.modal.contains(target)) {
                this.container.className = 'sw-modal-container';
            }
        },
        minimize: function () {
            this.container.classList.toggle('is-minimized');
            if (this.container.classList.contains('is-maximized')) {
                this.container.classList.remove('is-maximized');
            }
        },
        maximize: function () {
            this.container.classList.toggle('is-maximized');
            if (this.container.classList.contains('is-minimized')) {
                this.container.classList.remove('is-minimized');
            }
        }
    }

    // TOAST COMPONENT
    this.SWToast = function (options, callback) {
        this.toaster = null;
        var config = {
            title: null,
            content: null,
            type: null,
            position: 'bottom left',
            timeout: null,
            append: true
        };

        if (options && typeof options === 'object' && isNaN(options)) {
            this.o = extend(config, options);
        }
        else {
            this.o = config;
        }

        this.toaster = document.querySelector('.sw-toaster');
        if (!document.body.contains(this.toaster)) {
            this.toaster = create('div', '', 'sw-toaster');
            document.body.insertAdjacentElement('beforeend', this.toaster);
        }

        if (typeof callback === 'function') {
            callback.call(this, this.toast);
        }
    }

    function renderToast() {
        this.toast = create('div', '', 'sw-toast');
        var toastInsertionPoint = null;
        this.o.append === false ? toastInsertionPoint = 'afterbegin' : toastInsertionPoint = 'beforeend';
        this.toaster.insertAdjacentElement(toastInsertionPoint, this.toast);
        renderToastOptions.call(this);
    }

    function renderToastOptions() {
        if (this.o.position) {
            switch (this.o.position) {
                case 'top left': this.toaster.classList.add('top-left'); break;
                case 'top center': this.toaster.classList.add('top-center'); break;
                case 'top right': this.toaster.classList.add('top-right'); break;
                case 'bottom left': this.toaster.classList.add('bottom-left'); break;
                case 'bottom right': this.toaster.classList.add('bottom-right'); break;
                case 'left center': this.toaster.classList.add('left-center'); break;
                case 'center center': this.toaster.classList.add('center-center'); break;
                case 'right center': this.toaster.classList.add('right-center'); break;
                default: this.toaster.classList.add('bottom-center');
            }
        }

        if (this.o.title != null) {
            this.o.title = this.o.title;
            this.toast.appendChild(create('h4', this.o.title, 'sw-toast-title'));
        }

        if (this.o.content != null) {
            if (typeof this.o.content === 'function') {
                this.o.content = this.o.content();
            } else {
                this.o.content = this.o.content;
            }
            this.toast.appendChild(create('div', this.o.content, 'sw-toast-content'));
        }

        if (this.o.type) {
            switch (this.o.type) {
                case 'warning': this.toast.className += ' warning'; break;
                case 'info': this.toast.className += ' info'; break;
                case 'success': this.toast.className += ' success'; break;
                case 'caution': this.toast.className += ' caution'; break;
                default: this.toast.classList.add('default');
            }
        }

        if (this.o.timeout != null && !isNaN(this.o.timeout)) {
            var self = this;

            // clamp down the timeout to a minimum of 3 seconds
            if (this.o.timeout < 5000) {
                this.o.timeout = 5000;
            }

            // create progress animation
            var progress = create('div', '', 'sw-toast-progress');
            this.toast.insertAdjacentElement('beforeend', progress);
            progress.style.animation = '_toastProgress ' + this.o.timeout + 'ms linear forwards';

            var timeout = window.setTimeout(function () {
                self.toast.classList.add('dismiss');
                setTimeout(function () {
                    if (document.body.contains(self.toast)) {
                        self.toast.parentNode.removeChild(self.toast);
                        window.clearTimeout(timeout);
                    }
                }, 500);
            }, this.o.timeout);
        }

        this.toast.addEventListener('click', function () {
            if (this != undefined) {
                this.parentNode.removeChild(this);
            }
        });
    }

    SWToast.prototype = {
        show: function () {
            renderToast.call(this);
        }
    };

    // CALENDAR COMPONENT
    this.SWCalendar = function (options, callback) {
        var self = this;
        this.calendar = null;
        this.container = null;
        this.viewport = null;
        this.views = null;
        this.controller = null;
        this.days = null;
        this.months = null;
        this.years = null;
        this.monthsHeader = null;
        this.daysHeader = null;
        this.yearsHeader = null;
        this.currentField = null;
        this.currentFieldValue = ['mm', 'dd', 'yyyy'];
        this.startYear = null;
        this.date = new Date();
        this.position = {
            x: null,
            y: null
        };

        var config = {
            selector: null,
            startYear: null,
            placeholder: ''
        };

        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        if (options && typeof options === 'object' && isNaN(options)) {
            this.o = extend(config, options);
        }
        else {
            this.o = config;
        }

        this.field = document.querySelectorAll(this.o.selector);

        if (!document.body.contains(this.calendar)) {
            // main calendar 
            this.calendar = create('div', '', 'sw-calendar');

            // inner calendar container
            this.container = create('div', '', 'sw-calendar-container');

            // main calendar section viewport
            this.viewport = create('div', '', 'sw-calendar-viewport');

            // overflow wrapper for all views
            this.views = create('div', '', 'sw-calendar-views');

            // create the view containers
            this.months = create('div', '', 'sw-calendar-view sw-view-months');
            this.days = create('div', '', 'sw-calendar-view sw-view-days');
            this.years = create('div', '', 'sw-calendar-view sw-view-years');

            // create the view headers
            this.monthsHeader = create('div', 'Months', 'sw-calendar-view-header');
            this.daysHeader = create('div', 'Days', 'sw-calendar-view-header');
            this.yearsHeader = create('div', 'Years', 'sw-calendar-view-header');

            this.months.appendChild(this.monthsHeader);
            this.days.appendChild(this.daysHeader);
            this.years.appendChild(this.yearsHeader);

            // create buttons for each view
            var daysFragment = document.createDocumentFragment();
            var monthsFragment = document.createDocumentFragment();
            var yearsFragment = document.createDocumentFragment();

            for (var m = 0; m < months.length; m++) {
                var month = create('div', months[m], 'sw-calendar-view-button month', {
                    'data-month': (m < 10 ? '0' + (m + 1): m + 1)
                });
                monthsFragment.appendChild(month);
            }

            for (var d = 1; d <= 31; d++) {
                var day = create('div', d < 10 ? '0' + d : d, 'sw-calendar-view-button day');
                daysFragment.appendChild(day);
            }

            if (this.o.startYear !== null && typeof this.o.startYear == 'number' && !isNaN(this.o.startYear)) {
                this.startYear = this.o.startYear;
            }
            else {
                this.startYear = this.date.getFullYear();
            }

            for (var y = this.startYear; y > this.startYear - 24; y--) {
                var year = create('div', y, 'sw-calendar-view-button year');
                yearsFragment.appendChild(year);
            }

            this.months.appendChild(monthsFragment);
            this.days.appendChild(daysFragment);
            this.years.appendChild(yearsFragment);

            this.views.appendChild(this.months);
            this.views.appendChild(this.days);
            this.views.appendChild(this.years);

            this.viewport.appendChild(this.views);

            // controller that contains prev and next buttons
            this.controller = create('div', '', 'sw-calendar-view-controller');
            this.monthsButton = create('div', 'MM', 'sw-calendar-view-controller-button sw-month-button');
            this.daysButton = create('div', 'DD', 'sw-calendar-view-controller-button sw-day-button');
            this.yearsButton = create('div', 'YYYY', 'sw-calendar-view-controller-button sw-year-button');

            this.controller.appendChild(this.monthsButton);
            this.controller.appendChild(this.daysButton);
            this.controller.appendChild(this.yearsButton);

            this.container.appendChild(this.viewport);
            this.container.appendChild(this.controller);
            this.calendar.appendChild(this.container);
            document.body.insertAdjacentElement('beforeend', this.calendar);

            this.init();
        }

        document.addEventListener('click', function (e) {
            var target = e.target;
            if (!self.calendar.contains(target) && self.currentField != target) {
                resetSWCalendarPosition.call(self);
            }
        });
               
        if (typeof callback === 'function') {
            callback.call(this, this.calendar);
        }
    };

    function renderSWCalendar(event) {
        // set the current field 
        this.currentField = event.target;

        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var offsetX, offsetY;

        // get current field bounding values
        var pageX, pageY;
        var box = this.currentField.getBoundingClientRect();

        if (box.left + 300 > windowWidth) {
            console.log('SWCalendar has exceeded maximum viewport width');
        }

        pageX = box.x + window.scrollX;
        pageY = box.y + window.scrollY + (box.height + 8);

        // clear out the previous view state
        this.views.className = 'sw-calendar-views';

        // set the calendar position
        setSWCalendarPosition.call(this, pageX, pageY);
    }

    function renderSWCalendarOptions() {
        var self = this;
        [].forEach.call(this.field, function (input) {
            if(!input.placeholder && self.o.placeholder == '') {
                input.placeholder = 'mm/dd/yyyy';
            }
            else {
                input.placeholder = self.o.placeholder
            }
        });
    }

    function setSWCalendarPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.calendar.style.left = this.position.x + 'px';
        this.calendar.style.top = this.position.y + 'px';
        this.calendar.classList.add('is-visible');
    }

    function resetSWCalendarPosition() {
        this.currentFieldValue = [];
        this.calendar.style.left = 0;
        this.calendar.style.top = 0;
        this.calendar.classList.remove('is-visible');
        removeSelectedClassNames.call(this);
    }

    SWCalendar.prototype = {
        init: function () {
            var self = this;

            // clear out any position and styles on load
            resetSWCalendarPosition.call(this);

            // progress the calendar to each date view 
            this.monthsButton.addEventListener('click', this.goToMonths.bind(this));
            this.daysButton.addEventListener('click', this.goToDays.bind(this));
            this.yearsButton.addEventListener('click', this.goToYears.bind(this));

            // testing out setting field values based on clicking the parent view and not inside each child view
            

            // set the input date
            this.days.addEventListener('click', this.setDate.bind(this));
            this.months.addEventListener('click', this.setDate.bind(this));
            this.years.addEventListener('click', this.setDate.bind(this));

            // render and set calendar options
            for (var i = 0, len = this.field.length; i < len; i++) {
                if (this.field[i].nodeName !== 'INPUT' && this.field[i].getAttribute('type') !== 'text') {
                    throw new Error('Cannot render SW Calendar. Check the node type and ensure it is an \'INPUT\' element with a \'type\' of \'text\' ');
                }
                else {
                    this.field[i].addEventListener('click', function (e) {
                        this.select();
                        renderSWCalendar.call(self, e);
                        removeSelectedClassNames.call(self);
                    });
                    renderSWCalendarOptions.call(this);
                }
            }

            // if the calendar is open and you resize the browser, reset it
            window.addEventListener('resize', resetSWCalendarPosition.bind(this));
        },
        goToDays: function (event) {
            this.views.className = 'sw-calendar-views focus-days';
        }, 
        goToMonths: function (event) {
            this.views.className = 'sw-calendar-views focus-months';
        },
        goToYears: function (event) {
            this.views.className = 'sw-calendar-views focus-years';
        },
        setDate: function (event) {
            var target = event.target;
            var self = this;
            if (target.classList.contains('sw-calendar-view-button')) {
                var views = ['month', 'day', 'year'];
                var fieldValue = '';
                for (var v = 0; v < 3; v++) {
                    var _view = views[v];
                    if (target.classList.contains(_view)) {
                        self[_view + 'sHeader'].classList.add('is-selected');
                        self[_view + 'sButton'].classList.add('is-selected');

                        // remove all sibling 'is-selected' class names
                        var siblings = getSiblings('.' + target.classList[0], '.' + _view);
                        removeClass(siblings, 'is-selected');

                        if (_view == 'month') {
                            self.currentFieldValue.splice(0, 1, target.getAttribute('data-month'));
                        }
                        else if (_view == 'day') {
                            self.currentFieldValue.splice(1, 1, target.innerText);
                        }
                        else {
                            self.currentFieldValue.splice(2, 1, target.innerText);
                        }
                        self.currentField.value = self.currentFieldValue.join('/');
                    }
                }
                //target.classList.add('is-selected');
            }
        }
    }

    function removeSelectedClassNames() {
        var allNodes = this.container.querySelectorAll('*');
        for (var n = 0, len = allNodes.length; n < len; n++) {
            if (allNodes[n].classList.contains('is-selected')) {
                allNodes[n].classList.remove('is-selected');
            }
        }
    }

    function getSiblings(accessor, node) {
        return document.querySelectorAll(accessor + node);
    }

    // TABS
    var tabs = document.querySelectorAll('.tabs');
    if (tabs) {
        renderTabs(tabs);
    }

    function renderTabs(tabs) {
        for (var t = 0, tlen = tabs.length; t < tlen; t++) {
            var parentTabs = tabs[t];
            var tab = parentTabs.querySelectorAll('.tab');
            var tabBody = parentTabs.querySelectorAll('.tab-body');

            // get the 'tab-body' element in each tab container
            for (var tb = 0; tb < tabBody.length; tb++) {
                var tabContent = tabBody[tb].querySelectorAll('.tab-content');

                for (var tc = 0; tc < tabContent.length; tc++) {
                    // hide all tabs
                    tabContent[tc].classList.add('is-hidden');

                    // add 'current' to the first tab in each tabs container
                    // and show the first 'tab-content' element 
                    if (tc === 0) {
                        tab[tc].classList.add('is-current');
                        tabContent[0].classList.remove('is-hidden');
                    }

                    (function (tc) {
                        var currentTab = tab[tc];
                        var currentContent = tabContent[tc];

                        tab[tc].addEventListener('click', function () {
                            // remove all 'current' classes from the current tab container
                            removeClass(currentTab.parentNode.querySelectorAll('.tab'), 'is-current');
                            currentTab.classList.add('is-current');

                            // add 'hidden' to all 'tab-content' in the current tab container
                            addClass(currentContent.parentNode.querySelectorAll('.tab-content'), 'is-hidden');
                            currentContent.classList.remove('is-hidden');
                        });

                    })(tc);
                }
            }
        }

    }

    // CHECKBOXES:
    var checkboxes = document.querySelectorAll('.form-checkbox, .form-radio');
    if (checkboxes) {
        for (var c = 0, clen = checkboxes.length; c < clen; c++) {
            var check = checkboxes[c];
            var checkTarget = create('i', '', 'check-target');

            // append the target to the checkbox
            check.appendChild(checkTarget);

            // get the input type
            var checkType = check.querySelector('input').type;

            if (checkType == 'checkbox') {
                // create the svg check icon
                var checkIcon = [];
                checkIcon.push('<svg viewBox="0 0 24 24" class="check-stroke">');
                checkIcon.push('<polyline points="20 6 9 17 4 12"></polyline>');
                checkIcon.push('</svg>');

                // append the icon to the target
                checkTarget.insertAdjacentHTML('afterbegin', checkIcon.join(' '));
            }
        }
    }

    // DETAILS
    var details = document.querySelectorAll('details');
    if ('Promise' in window == false) {
        document.body.classList.add('is-ie');
        [].forEach.call(details, function (e) {
            var detailsMenu = e.querySelector('.details-menu');
            if (detailsMenu) {
                e.classList.add('ie');
            }
            e.addEventListener('click', function () {
                this.classList.toggle('is-open');
            }, false);
        });
    }

    // SWITCHES
    var switches = document.querySelectorAll('.switch');
    [].forEach.call(switches, function (e) {
        e.addEventListener('click', function () {
            this.classList.toggle('is-on');
            if (!this.classList.contains('is-on')) {
                this.classList.add('is-off');
            }
            else {
                this.classList.remove('is-off');
            }
        });
    });


    // SIDEBAR TOGGLE
    var sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        var toggle = create('div', 'Menu', 'site-menu-toggle');
        var siteMenu = sidebar.querySelector('.site-menu');
        siteMenu.insertAdjacentElement('beforebegin', toggle);

        var idle = false;

        toggle.addEventListener('click', function () {
            idle = !idle;
            siteMenu.classList.toggle('is-toggled');
            if (!idle) {
                siteMenu.classList.toggle('is-idle');
            }
            else {
                siteMenu.classList.remove('is-idle');
            }
        }, false);
    }

    // FORM FILE INPUTS
    var inputFiles = document.querySelectorAll('.form-file input[type=file]');
    [].forEach.call(inputFiles, function (input) {
        var label = input.nextElementSibling;
        var labelText = label.innerHTML;

        input.addEventListener('change', function (e) {
            var fileName = '';
            if (this.files && this.files.length > 1) {
                fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
            }
            else {
                fileName = e.target.value.split('\\').pop();
            }

            if (fileName) {
                label.innerHTML = fileName;
            }
            else {
                label.innerHTML = labelText;
            }
        });
    });

    window.addEventListener('load', function() {
        document.body.classList.remove('preload');
    }, false);

    window.addEventListener('resize', function () {
        if(!siteMenu.classList.contains('site-menu')) {
            siteMenu.classList.add('site-menu');
        }
    }, false);

})();
