;(function () {

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
    this.SWModal = function(options, callback) {
        this.container = null;
        this.modal = null;
        this.overlay = null;
        this.title = null;
        this.content = null;
        this.contentWrapper = null;
        this.buttonControls = null;

        var config = {
            width: 'auto',              // integer based width of the modal
            height: 'auto',             // integer based height of the modal
            customClasses: [],          // array of custom class names to be added to the dialog
            minimize: false,            // allows modal to be minimized
            maximize: false,            // allows modal to be maximized
            smallerIcons: false,        // true to decrease size if modal control buttons
            title: {
                align: 'left',          // valid options are 'left', 'center', and 'right'
            },
            buttons: {
                render: false,          // determines if the button control bar should be appended to the modal, thus allowing buttons
                customClasses: [],      // array of custom classes
                align: 'start'          // valid options are 'start', 'end', 'around', 'between'
            },
            onClose: null,              // event callback     
            onDestroy: null             // event callback
        };

        if(options && typeof options === 'object' && isNaN(options)) {
            this.o = extend(config, options);
        }
        else {
            this.o = config;
        }

        this.init(); 

        if(typeof callback === 'function') {
            callback.call(this);
        }
    };

    SWModal.prototype = {
        init: function() {
            if(this.modal) {
                return;
            }

            // build the modal html
            buildModal.call(this);

            // bind the modal's event listeners
            bindModalEvents.call(this);
    
            return this;
        },
        open: function() {
            if(this.container !== null) {
                if(!this.container.classList.contains('is-open')) {
                    this.container.classList.add('is-open');
                }

                if (typeof this.o.onOpen === 'function') {
                    this.o.onOpen.call(this);
                }
            }
            return this;
        }, 
        close: function () {
            var self = this;
            if(typeof this.o.onClose === 'function') {
                this.o.onClose.call(this);
            }            

            this.container.className = 'sw-modal-container ';
            this.container.className += this.o.customClasses.join(' ');
        },
        destroy: function() {
            if (this.modal === null) {
                return;
            }    

            if(typeof this.o.onDestroy === 'function') {
                this.o.onDestroy.call(this);
            }

            this.minimizeButton.removeEventListener('click', this.isMinimized);
            this.maximizeButton.removeEventListener('click', this.isMaximized);
            this.closeButton.removeEventListener('click', this.close);
            this.container.parentNode.removeChild(this.container)
            this.container = null;
        },
        isMinimized: function () {
            this.container.classList.toggle('is-minimized');
            if(this.container.classList.contains('is-minimized')) {
                this.modal.style.height = 'auto';
            }
            else {
                this.modal.style.height = this.o.height + 'px';
            }

            // remove the maximized class if the modal was previously maximized
            if (this.container.classList.contains('is-maximized')) {
                this.container.classList.remove('is-maximized');
            }
        },
        isMaximized: function () {
            this.container.classList.toggle('is-maximized');

            // remove the minimized class if the modal was previously minimized
            if (this.container.classList.contains('is-minimized')) {
                this.container.classList.remove('is-minimized');
            }
        },
        setTitle: function(title) {
            if(typeof title === 'string') {
                this.title.innerText = title;
                if(this.o.title.align == 'left') {
                    this.title.classList.add('text', 'is-left');
                }
                if(this.o.title.align == 'center') {
                    this.title.classList.add('text', 'is-center');
                }
                if(this.o.title.align == 'right') {
                    this.title.classList.add('text', 'is-right');
                }
            }
            return this;
        }, 
        setContent: function(content) {
            // this.content = null;
            if (typeof content === 'string') {
                this.content.innerHTML = content;
            } 
            else {
                this.content.innerHTML = ''
                this.content.appendChild(content);
            }
            return this;
        },
        clickOutsideToClose: function () {
            var target = window.event.target;
            if(this.container != null) {
                if (this.container.contains(target) && !this.modal.contains(target)) {
                    this.container.className = 'sw-modal-container';
                }
            }
        },
        addButton: function(label, styles, callback) {
            if(this.o.buttons.render == true) {
                var button = create('button', label, 'button sw-modal-button');
                var classType = getType(styles);

                if(classType == '[object Array]') {
                    button.classList.add.apply(button.classList, styles);
                }
                else if(classType == '[object String]') {
                    button.classList.add(styles);
                }

                this.buttonControls.appendChild(button);
                
                // ensure the button has a callback event wired up
                button.addEventListener('click', callback.bind(this, button));
                
                return button;
            }
        }
    };

    function buildModal() {
        this.container = create('div', '', 'sw-modal-container');
        this.modal = create('div', '', 'sw-modal');
        this.overlay = create('div', '', 'sw-modal-overlay');
        this.controls = create('div', '', 'sw-modal-controls');
        this.closeButton = create('div', '<img src="assets/img/close.svg" alt="Modal dialog close icon">', 'sw-modal-control-button sw-modal-close');

        // set modal content
        this.container.insertAdjacentElement('afterbegin', this.overlay);
        this.container.appendChild(this.modal);
        this.modal.insertAdjacentElement('afterbegin', this.controls);

        // append the close button
        this.controls.insertAdjacentElement('beforeend', this.closeButton);

        // create the content container
        this.contentWrapper = create('div', '', 'sw-modal-content-wrapper');
        this.content = create('div', '', 'sw-modal-inner');

        // create the title bar
        this.title = create('div', '', 'sw-modal-title');
        this.contentWrapper.appendChild(this.title);

        this.contentWrapper.appendChild(this.content);

        this.modal.appendChild(this.contentWrapper);

        // append the modal as the last element in the document
        document.body.insertAdjacentElement('beforeend', this.container);

        // apply modal options
        setModalOptions.call(this);
    }

    function setModalOptions() {
        var self = this;
        var w = this.o.width;
        var h = this.o.height;

        if (this.o.width > window.innerWidth) {
            w = window.innerWidth - 32;
        }
        if (this.o.height > window.innerHeight) {
            h = window.innerHeight - 32;
            this.contentWrapper.style.overflowY = 'auto';
        }

        // set default width
        if(typeof w !== 'number' && isNaN(w)) {
            this.modal.style['width'] = 'auto';
        } 
        else {
            this.modal.style['width'] = w + 'px';
        }

        // set default height
        if(typeof h !== 'number' && isNaN(h)) {
            this.modal.style['height'] = 'auto';
        } 
        else {
            this.modal.style['height'] = h + 'px';
        }

        if(this.o.smallerIcons !== false) {
            this.controls.classList.add('smaller-icons');
        }

        if (this.o.maximize !== false && typeof this.o.maximize === 'boolean') {
            this.maximizeButton = create('div', '<img src="assets/img/maximize.svg" alt="Modal dialog maximize icon">', 'sw-modal-control-button sw-modal-maximize');
            this.controls.insertAdjacentElement('afterbegin', this.maximizeButton);

            // wire up maximize button click event
            this.maximizeButton.addEventListener('click', this.isMaximized.bind(this));
        }

        if (this.o.minimize !== false && typeof this.o.minimize === 'boolean') {
            this.minimizeButton = create('div', '<img src="assets/img/minimize.svg" alt="Modal dialog minimize icon">', 'sw-modal-control-button sw-modal-minimize');
            this.controls.insertAdjacentElement('afterbegin', this.minimizeButton);

            // wire up minimize button click event
            this.minimizeButton.addEventListener('click', this.isMinimized.bind(this));
        }

        // add custom class names so long as they're pushed into an array
        if(this.o.customClasses.length > 0) {
            this.container.classList.add.apply(this.container.classList, this.o.customClasses);
        }

        // set the button control alignment
        if(this.o.buttons.render == true) {
            // create the button controls bar: append items based on options
            this.buttonControls = create('div', '', 'sw-modal-button-controls');
            this.modal.appendChild(this.buttonControls);

            // set the button controls flex alignment if the property is set
            if(this.o.buttons.align != '') {
                switch(this.o.buttons.align) {
                    case 'start': this.buttonControls.classList.add('start'); break;
                    case 'end': this.buttonControls.classList.add('end'); break;
                    case 'around': this.buttonControls.classList.add('around'); break;
                    case 'between': this.buttonControls.classList.add('between'); break;
                }
            }

            // optionally pass in custom button class names
            if(this.o.buttons.customClasses && this.o.buttons.customClasses.length > 0) {
                this.buttonControls.classList.add.apply(this.buttonControls.classList, this.o.buttons.customClasses);
            }
        }

        // wire up close button click event
        this.closeButton.addEventListener('click', this.close.bind(this));

        // close the modal when you click outside of it
        this.container.addEventListener('click', this.clickOutsideToClose.bind(this));

    }

    function bindModalEvents() {}

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
                var mm = m + 1;
                var month = create('div', _months[m], 'sw-datepicker-value sw-datepicker-month', {
                    'data-month': mm < 10 ? '0' + mm: mm
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

            for (var y = this.startYear; y >= this.endYear; y--) {
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

    // PAGE HEADING BLADES
    var pageHeading = document.querySelector('.page-heading');
    if(pageHeading) {
        var blades = create('div', '', 'blades');
        var b = 0;
        for(b; b < 3; b++) {
            var blade = create('div', '', 'blade');
            blades.appendChild(blade);
        }
        pageHeading.insertAdjacentElement('afterbegin', blades);
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

    // close all sibling details nodes if they're open
    [].forEach.call(details, function(e) {
        e.addEventListener('click', function() {
            var ctx = this;
            [].filter.call(details, function(d) {
                if(d.hasAttribute('open')) {
                    return d !== ctx ? d.removeAttribute('open') : null;
                }
                else if(d.classList.contains('is-open')) {
                    return d !== ctx ? d.classList.remove('is-open') : null;
                }
            });
        }, false);
    });

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

    // AUTO-CALCULATE REFINERS AUTO-SCROLL CONTAINER HEIGHT
    var siteLogo = document.querySelector('.site-logo');
    var siteMenu = document.querySelector('.site-menu');
    if(siteMenu) {
        var siteMenuNav = siteMenu.firstElementChild;
        if(siteMenuNav.nodeName == 'UL') {
            var refiners = siteMenu.querySelector('.refiners');
            if(refiners) {
                var siteMenuHeight = siteMenu.getBoundingClientRect().height;                
                var sidebarHeight = sidebar.getBoundingClientRect().height;
                var siteLogoHeight = siteLogo.getBoundingClientRect().height + 64;
                var siteMenuNavHeight = siteMenuNav.getBoundingClientRect().height;
                var scrollbarThumbHeight = 34;

                if(siteMenuHeight > sidebarHeight) {
                    var totalSiteMenuNavHeight = siteMenuNavHeight + siteLogoHeight;
                    var calculatedSidebarOverflowHeight = sidebarHeight - totalSiteMenuNavHeight;
                    refiners.style.height = (calculatedSidebarOverflowHeight - scrollbarThumbHeight) + 'px';
                    refiners.classList.add('auto-scroll');
                }
            }
        }
    }

    window.addEventListener('load', function() {
        document.body.classList.remove('preload');
    }, false);

    window.addEventListener('resize', function () {
        if(!siteMenu.classList.contains('site-menu')) {
            siteMenu.classList.add('site-menu');
        }
    }, false);

})();
