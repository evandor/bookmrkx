import {IconLink} from '@codexteam/icons';

function getMetaDataFor(doc: Document, ident: string, defaultValue = '') {
    console.log(" === ", ident)
    //const tryFirst = "og:" + ident;
    // try "og: " + ident
    //const firstTry = doc.getElementsByTagName("meta[property='" + tryFirst + "']")
    const firstTry = doc.querySelector(`meta[property="og:${ident}"]`)
    console.log("firstTry", firstTry)
    if (firstTry && firstTry.getAttribute('content')) {
       // return firstTry.getAttribute("content")
    }
    // try ident
    const secondTry = doc.querySelector(`meta[name="${ident}"]`)
    console.log("secondTry", secondTry)
    if (secondTry && secondTry.getAttribute("content")) {
        //return secondTry.getAttribute("content")
    }
    // try first match
    const matchingMeta = [...doc.querySelectorAll('meta')]
        .find(meta => {
            console.log("meta", meta, meta.name, meta.getAttribute('property'), meta.name.indexOf(ident) )
            return meta.name.indexOf(ident) >= 0 || meta.getAttribute('property')?.indexOf(ident) >= 0
        });
    console.log("matchingMeta", matchingMeta)
    if (matchingMeta?.getAttribute('content')) {
        console.log("returning", matchingMeta.getAttribute('content'))
        return matchingMeta.getAttribute('content');
    }

    // return default
    return defaultValue
}

/**
 * Experimental implementation based on
 * https://github.com/editor-js/link/tree/master
 * without external backend
 * Copyright (c) 2020 CodeX
 */
export class LinkTool2 {

    static get isReadOnlySupported() {
        return true;
    }

    static get toolbox() {
        return {
            icon: IconLink,
            title: 'Link',
        };
    }

    static get enableLineBreaks() {
        return true;
    }

    constructor({data, config, api, readOnly}) {
        this.api = api;
        this.readOnly = readOnly;

        this.config = {
            endpoint: config.endpoint || '',
            headers: config.headers || {},
        };

        this.nodes = {
            wrapper: null,
            container: null,
            progress: null,
            input: null,
            inputHolder: null,
            linkContent: null,
            linkImage: null,
            linkTitle: null,
            linkDescription: null,
            linkText: null,
        };

        this._data = {
            link: '',
            meta: {},
        };

        this.data = data;
    }

    render() {
        this.nodes.wrapper = this.make('div', this.CSS.baseClass);
        this.nodes.container = this.make('div', this.CSS.container);

        this.nodes.inputHolder = this.makeInputHolder();
        this.nodes.linkContent = this.prepareLinkPreview();

        /**
         * If Tool already has data, render link preview, otherwise insert input
         */
        if (Object.keys(this.data.meta).length) {
            this.nodes.container.appendChild(this.nodes.linkContent);
            this.showLinkPreview(this.data.meta);
        } else {
            this.nodes.container.appendChild(this.nodes.inputHolder);
        }

        this.nodes.wrapper.appendChild(this.nodes.container);

        return this.nodes.wrapper;
    }

    save() {
        return this.data;
    }

    validate() {
        return this.data.link.trim() !== '';
    }

    set data(data) {
        this._data = Object.assign({}, {
            link: data.link || this._data.link,
            meta: data.meta || this._data.meta,
        });
    }

    get data() {
        return this._data;
    }

    get CSS() {
        return {
            baseClass: this.api.styles.block,
            input: this.api.styles.input,

            container: 'link-tool',
            inputEl: 'link-tool__input',
            inputHolder: 'link-tool__input-holder',
            inputError: 'link-tool__input-holder--error',
            linkContent: 'link-tool__content',
            linkContentRendered: 'link-tool__content--rendered',
            linkImage: 'link-tool__image',
            linkTitle: 'link-tool__title',
            linkDescription: 'link-tool__description',
            linkText: 'link-tool__anchor',
            progress: 'link-tool__progress',
            progressLoading: 'link-tool__progress--loading',
            progressLoaded: 'link-tool__progress--loaded',
        };
    }

    makeInputHolder() {
        const inputHolder = this.make('div', this.CSS.inputHolder);

        this.nodes.progress = this.make('label', this.CSS.progress);
        this.nodes.input = this.make('div', [this.CSS.input, this.CSS.inputEl], {
            contentEditable: !this.readOnly,
        });

        this.nodes.input.dataset.placeholder = this.api.i18n.t('Link');

        if (!this.readOnly) {
            this.nodes.input.addEventListener('paste', (event) => {
                this.startFetching(event);
            });

            this.nodes.input.addEventListener('keydown', (event) => {
                const [ENTER, A] = [13, 65];
                const cmdPressed = event.ctrlKey || event.metaKey;

                switch (event.keyCode) {
                    case ENTER:
                        event.preventDefault();
                        event.stopPropagation();

                        this.startFetching(event);
                        break;
                    case A:
                        if (cmdPressed) {
                            this.selectLinkUrl(event);
                        }
                        break;
                }
            });
        }

        inputHolder.appendChild(this.nodes.progress);
        inputHolder.appendChild(this.nodes.input);

        return inputHolder;
    }

    startFetching(event) {
        let url = this.nodes.input.textContent;

        if (event.type === 'paste') {
            url = (event.clipboardData || window.clipboardData).getData('text');
        }
        if (!url.startsWith("http")) {
            url = "https://" + url
        }

        this.removeErrorStyle();
        this.fetchLinkData(url);
    }

    removeErrorStyle() {
        this.nodes.inputHolder.classList.remove(this.CSS.inputError);
        this.nodes.inputHolder.insertBefore(this.nodes.progress, this.nodes.input);
    }

    selectLinkUrl(event) {
        event.preventDefault();
        event.stopPropagation();

        const selection = window.getSelection();
        const range = new Range();

        const currentNode = selection.anchorNode.parentNode;
        const currentItem = currentNode.closest(`.${this.CSS.inputHolder}`);
        const inputElement = currentItem.querySelector(`.${this.CSS.inputEl}`);

        range.selectNodeContents(inputElement);

        selection.removeAllRanges();
        selection.addRange(range);
    }

    prepareLinkPreview() {
        const holder = this.make('a', this.CSS.linkContent, {
            target: '_blank',
            rel: 'nofollow noindex noreferrer',
        });

        this.nodes.linkImage = this.make('div', this.CSS.linkImage);
        this.nodes.linkTitle = this.make('div', this.CSS.linkTitle);
        this.nodes.linkDescription = this.make('p', this.CSS.linkDescription);
        this.nodes.linkText = this.make('span', this.CSS.linkText);

        return holder;
    }

    showLinkPreview({image, title, description}) {
        this.nodes.container.appendChild(this.nodes.linkContent);

        if (image && image.url) {
            this.nodes.linkImage.style.backgroundImage = 'url(' + image.url + ')';
            this.nodes.linkContent.appendChild(this.nodes.linkImage);
        }

        if (title) {
            this.nodes.linkTitle.textContent = title;
            this.nodes.linkContent.appendChild(this.nodes.linkTitle);
        }

        if (description) {
            this.nodes.linkDescription.textContent = description;
            this.nodes.linkContent.appendChild(this.nodes.linkDescription);
        }

        this.nodes.linkContent.classList.add(this.CSS.linkContentRendered);
        this.nodes.linkContent.setAttribute('href', this.data.link);
        this.nodes.linkContent.appendChild(this.nodes.linkText);

        try {
            this.nodes.linkText.textContent = (new URL(this.data.link)).hostname;
        } catch (e) {
            this.nodes.linkText.textContent = this.data.link;
        }
    }

    showProgress() {
        this.nodes.progress.classList.add(this.CSS.progressLoading);
    }

    hideProgress() {
        return new Promise((resolve) => {
            this.nodes.progress.classList.remove(this.CSS.progressLoading);
            this.nodes.progress.classList.add(this.CSS.progressLoaded);

            setTimeout(resolve, 500);
        });
    }

    applyErrorStyle() {
        this.nodes.inputHolder.classList.add(this.CSS.inputError);
        this.nodes.progress.remove();
    }

    async fetchLinkData(url) {
        console.log("fetching link data for", url)
        this.showProgress();
        this.data = {link: url};

        try {
            fetch(url)
                .then(response => response.text())
                .then(body => {
                    const parser = new DOMParser();
                    const htmlDoc = parser.parseFromString(body, 'text/html')
                    console.log("htmlDoc", htmlDoc)
                    const description = getMetaDataFor(htmlDoc, 'description')
                    const image = getMetaDataFor(htmlDoc, 'image')

                    const metaData = {
                        "title": htmlDoc.title,
                        "description": description,
                        "image": {
                            "url": image
                        }
                    }

                    this.data = {
                        meta: metaData,
                        link: url,
                    };

                    if (!metaData) {
                        this.fetchingFailed(this.api.i18n.t('Wrong response format from the server'));
                        return;
                    }

                    this.hideProgress().then(() => {
                        this.nodes.inputHolder.remove();
                        this.showLinkPreview(metaData);
                    });


                })
                .catch((err) => console.error(err))


        } catch (error) {
            this.fetchingFailed(this.api.i18n.t('Couldn\'t fetch the link data'));
        }
    }

    fetchingFailed(errorMessage) {
        this.api.notifier.show({
            message: errorMessage,
            style: 'error',
        });

        this.applyErrorStyle();
    }

    make(tagName, classNames = null, attributes = {}) {
        const el = document.createElement(tagName);

        if (Array.isArray(classNames)) {
            el.classList.add(...classNames);
        } else if (classNames) {
            el.classList.add(classNames);
        }

        for (const attrName in attributes) {
            el[attrName] = attributes[attrName];
        }

        return el;
    }
}