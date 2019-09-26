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
            }
            return this;
        }, 
        setContent: function(content) {
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


})();
