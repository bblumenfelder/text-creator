<template>
    <div class="corpus-text-extractor__container p4 ">
        <iris-messenger :messenger="messenger" class="mt6 mb6"></iris-messenger>
        <div class="flex-group-sb">
            <div class="corpus-text-extractor__selection-container w45">
                <div class="corpus-text-extractor__selection-headline text-xl italic light-grey mb3">Ausgewählte Textstelle(n)</div>
                <div class="corpus-text-extractor__selection-total-word-count mb3">
                    <div v-if="this.total_word_count < 500" class="corpus-text-extractor__selection-total-word-count--good flex-group-sb color-success">
                        <div>Wörter: {{this.total_word_count}}</div>
                    </div>
                    <div v-if="this.total_word_count < 750 && this.total_word_count > 500" class="corpus-text-extractor__selection-total-word-count--critical flex-group-sb color-warning">
                        <div>Wörter: {{this.total_word_count}}</div>
                    </div>
                </div>
                <div v-if="selection.length === 0" class="mt6 italic light-grey">Keine Textstelle ausgewählt!</div>
                <div v-for="(selection_object, selection_key) in selection" class="corpus-text-extractor__selection-block text-sm box-shadow-gentle mb4">
                    <div v-html="selection_object.xml" class="corpus-text-extractor__selection-block__body p3"></div>
                    <div class="corpus-text-extractor__selection-block__footer flex-group-sb mt3">
                        <div class="corpus-text-extractor__selection-block__footer__actions pt1 w15">
                            <button @click="moveDown(selection_object)" class="corpus-text-extractor__selection-block__actions__footer__move-down-button light-grey text-xl">
                                <font-awesome-icon icon="caret-down"></font-awesome-icon>
                            </button>
                            <button @click="moveUp(selection_object)" class="corpus-text-extractor__selection-block__actions__footer__move-up-button light-grey text-xl">
                                <font-awesome-icon icon="caret-up"></font-awesome-icon>
                            </button>
                            <button @click="remove(selection_key)" class="corpus-text-extractor__selection-block__actions__footer__remove-button light-grey text-xl">
                                <font-awesome-icon icon="times"></font-awesome-icon>
                            </button>
                            <button @click="expand($event)" class="corpus-text-extractor__selection-block__actions__footer__expand-button light-grey text-xl">
                                <font-awesome-icon class="icon-expand" icon="expand-arrows-alt"></font-awesome-icon>
                                <font-awesome-icon class="icon-compress" icon="compress"></font-awesome-icon>
                            </button>
                        </div>
                        <div class="corpus-text-extractor__selection-block__footer__locus w50 text-xs p2">
                            <span v-if="corpustext.author_abbrev" v-html="corpustext.author_abbrev"></span>
                            <span v-if="corpustext.title_abbrev" v-html="corpustext.title_abbrev"></span>
                            <span v-html="selection_object.locus"></span>
                        </div>
                        <div class="corpus-text-extractor__selection-block__footer__info w35 text-xs p2">
                            {{ selection_object.word_count}} Wörter
                        </div>
                    </div>
                </div>
            </div>
            <div class="corpus-text-extractor__corpus-text-container w45">
                <div class="corpus-text-extractor__corpus-text-container-headline text-xl italic light-grey mb3">Verfügbare Textstellen</div>
                <div v-html="corpustext.xml" class="corpus-text-extractor__text-body"></div>
            </div>
        </div>
    </div>
</template>

<script>

    import {library} from '../../hermeneus/node_modules/@fortawesome/fontawesome-svg-core'
    import {faCaretDown, faCaretUp, faCompress, faExpandArrowsAlt, faTimes} from '../../hermeneus/node_modules/@fortawesome/free-solid-svg-icons'
    import {FontAwesomeIcon} from '../../hermeneus/node_modules/@fortawesome/vue-fontawesome'
    import {IrisMessenger} from "../iris-messenger/classes";
    import {moveInArray, retrieveLoci} from "./text-extractor.functions";

    library.add(faTimes, faExpandArrowsAlt, faCompress, faCaretDown, faCaretUp);


    export default {
        name: "corpus-text-extractor",
        props: ['corpustext'],
        data: function () {
            return {
                'selection': [],
                'messenger': new IrisMessenger(),
                'highest_subsection': this.corpustext.highest_subsection,
                'not_extracted_elements': 'ref, note, *[type="head"], sic',
            }
        },
        computed: {
            /**
             * Sums up word-counts of all selected loci
             */
            total_word_count: function () {
                return this.selection.map(SelectedText => {
                    return SelectedText.word_count;
                }).reduce((a, b) => a + b, 0);
            }
        },
        methods: {
            /**
             * Move textpart up in selection
             * @param Element
             * @type {HTMLElement}
             */
            moveUp (Element) {
                moveInArray(this.selection, Element, -1);
            },
            /**
             * Move textpart down in selection
             * @param Element
             * @type {HTMLElement}
             */
            moveDown (Element) {
                moveInArray(this.selection, Element, 1);
            },

            /**
             * Will clone the element for selection and remove the headline
             * @param SelectedElement
             * @type {HTMLElement}
             */
            async withoutHeadline (SelectedElement) {
                return new Promise((resolve, reject) => {
                    let ClonedElement = SelectedElement.cloneNode(true);
                    ClonedElement.querySelectorAll(`.textr-remove, ${this.not_extracted_elements}`).forEach(Headline => {
                        Headline.remove()
                    });
                    resolve(ClonedElement);
                });
            },
            /**
             * Will clone the element for selection and remove the .line-number-class
             * @param SelectedElement
             * @type {HTMLElement}
             */
            async withoutLineNumber (SelectedElement) {
                return new Promise((resolve, reject) => {
                    let ClonedElement = SelectedElement.cloneNode(true);
                    ClonedElement.querySelectorAll('.line-number').forEach(Linenumber => {
                        Linenumber.remove()
                    });
                    resolve(ClonedElement);
                });
            },
            /**
             * Will prepend an empty space to every textnode
             * Why? If we split textContent of <l>Bla blup</l><l>Bli Blu</l>, we will get
             * "Bla blupBli Blu" => 3 Words
             * @param SelectedElement
             * @type {HTMLElement}
             */
            async separateTextContent (SelectedElement) {
                return new Promise((resolve, reject) => {
                    let AllSubnodes = SelectedElement.querySelectorAll('*');
                    AllSubnodes.forEach(Element => {
                        // Is it really an element?
                        if (Element.nodeType === 1) {
                            // Does it have child nodes? If so, do these child-nodes have text-content?
                            if (Element.childNodes[0] && Element.childNodes[0].nodeType !== 1) {
                                Element.textContent = Element.textContent + ' ';
                            }
                        }

                    });
                    resolve(SelectedElement);
                });
            },
            /**
             * Remove Textpart from selection
             * @param SelectedElement
             * @type {HTMLElement}
             */
            async getSelectionObject (SelectedElement) {
                let SelectedElementTextstelle = await retrieveLoci(SelectedElement, this.highest_subsection);
                let SelectedElementWithoutLineNo = await this.withoutLineNumber(SelectedElement);
                let SelectedElementWithoutHeadline = await this.withoutHeadline(SelectedElementWithoutLineNo);
                let SelectedElementSeparatedTextContent = await this.separateTextContent(SelectedElementWithoutHeadline);
                return {
                    'word_count': SelectedElementSeparatedTextContent.innerText.split(/\W|\s+/).filter(w => w !== '').length,
                    'locus': SelectedElementTextstelle.join(', '),
                    'xml': SelectedElementSeparatedTextContent.outerHTML,   // OuterHTML also respects HTML-Tags
                }
            },
            /**
             * Remove Textpart from selection
             * @param Key
             */
            remove (Key) {
                this.selection.splice(Key, 1);
            }
            ,
            async add (MouseEvent, HighestSubsection = false) {
                // Is SelectedElement a HighestSubsection or a normal textpart?
                let SelectedElement = HighestSubsection ? MouseEvent.target.parentNode.parentNode : MouseEvent.currentTarget;
                // Stops bubbling and all events for parent elements
                MouseEvent.stopPropagation();
                // Transform Element into Selection-Object
                let SelectionObject = await this.getSelectionObject(SelectedElement);
                // If already selected words and words in selection amount are less than 750
                if ((this.total_word_count + SelectionObject.word_count) < 750) {
                    this.selection.push(SelectionObject);
                } else {
                    this.messenger.display('danger', 'Warnung', 'Die maximale Anzahl von erlaubten Wörtern pro Text beträgt 750!', null, 3000);
                }
            }
            ,
            /**
             * @type {MouseEvent}
             * @param $event
             */
            expand ($event) {
                let ClickedButton = $event.currentTarget;
                let TextBlock = ClickedButton.parentNode.parentNode.parentNode;
                TextBlock.classList.toggle('textblock-expanded');
            }
            ,
            /**
             * Creates Eventlisteners for textparts
             * @param WithinElement
             */
            createTextPartSelectors (WithinElement) {
                WithinElement.querySelectorAll('div[type="textpart"], l, seg').forEach(textpart => {
                    textpart.classList.add('textpart_selectable');
                    textpart.addEventListener('click', e => {
                        this.add(e)
                    });
                });
            }
        },
        mounted: async function () {
            let Component = this;
            let HighestSubsections = await document.querySelectorAll(`.corpus-text-extractor__text-body .textr-highest-subsection`);
            if (!(HighestSubsections.length > 0)) {
                this.createTextPartSelectors(document)
            }

            document.querySelectorAll('.textr-highest-subsection--headline__add-button').forEach(addButton => {
                addButton.addEventListener('click', e => {
                    Component.add(e, true)
                });
            });

            document.querySelectorAll('.textr-highest-subsection--headline__text').forEach(headlineText => {
                headlineText.addEventListener('click',
                    (e) => {
                        let HighestSubsectionHeadline_current = e.currentTarget;
                        HighestSubsectionHeadline_current.parentNode.parentNode.classList.toggle('textpart-expanded');
                    });
            });
            HighestSubsections.forEach(HighestSubsection => {
                Component.createTextPartSelectors(HighestSubsection);
            });
        }
    }
    ;
</script>

<style>

    .corpus-text-extractor__container {
        border: 1px solid #aaa;
        background: #FFF;
    }

    .corpus-text-extractor__text-body {
        color: #000;
        font-family: "Noto Serif";
        font-size: 0.875rem;
        line-height: 1.25rem;
    }

    .corpus-text-extractor__container l {
        width: 100%;
        display: inline-block;
        margin-top: 0.25rem;
    }

    .corpus-text-extractor__container lg {
        display: inline-block;
        margin-top: 0.5rem;
    }

    .corpus-text-extractor__text-body *.textpart_selectable {
        display: inline-block;
        border-top: 1px dotted #ccc;
        margin-left: 0.5rem;
        padding: 0.25rem 0;
        cursor: pointer;
    }

    .corpus-text-extractor__text-body *.textpart_selectable::before {
        Content: '\f055';
        font-family: FontAwesome;
        margin-right: 0.5rem;
        font-style: normal;
        color: #ccc;
        float: left;
    }

    .corpus-text-extractor__text-body *.textpart_selectable:hover::before {
        color: #B22E2F;
    }

    .corpus-text-extractor__text-body .textr-highest-subsection::before {
        Content: '';
        margin: 0;
        padding: 0;
    }

    .corpus-text-extractor__text-body .textr-highest-subsection {
        border: none;
        margin: 0;
        padding: 0;
        height: 2rem;
        overflow: hidden;
    }

    .corpus-text-extractor__text-body .textr-highest-subsection.textpart-expanded {
        height: auto;
        overflow: visible;
        padding-bottom: 1rem;
    }

    .textr-line-number {
        display: inline-block;
        font-size: 0.75rem;
        line-height: 0.875rem;
        width: 2rem;
        font-family: Noto Sans;
        text-align: right;
        margin-right: 0.5rem;
        color: #ccc;
    }

    .textpart_selectable:hover .textr-line-number {
        color: #333;
    }

    .textpart-expanded .textr-highest-subsection--headline {
        background: #75868a;
        color: #fff;
    }

    .textr-highest-subsection--headline {
        height: 2rem;
        font-size: 1rem;
        margin-bottom: 1rem;
        display: flex;
        justify-content: flex-start;
        font-family: 'Merriweather Sans';
        color: #666;
        background: #eee;
        border-bottom: 1px solid #ddd;
        cursor: pointer;
    }

    .textr-highest-subsection--headline:hover {
        background: #75868a;
        color: #fff;
    }

    .textr-highest-subsection--headline__add-button {
        width: 2rem;
        padding: 0.5rem;
        background: none;
        color: #ccc;
    }

    .textr-highest-subsection--headline__add-button::before {
        Content: '\f055';
        font-family: FontAwesome;
    }

    .textr-highest-subsection--headline__add-button:hover {
        background: #326470;
    }

    .textr-highest-subsection--headline__add-button:hover::before {
        color: #fff;
    }

    .textr-highest-subsection--headline__text {
        padding: 0.5rem 0.25rem;
        width: 100%;
    }

    .textr-highest-subsection--headline__text:hover::before {
        color: #fff;
    }

    .textr-highest-subsection--headline__text::before {
        Content: '\f0da';
        padding-right: 1rem;
        color: #ccc;
        font-family: FontAwesome;
    }

    .textr-textpart-descriptor {
        color: #aaa;
        font-family: 'Noto Sans';
        margin-bottom: 0.25rem;
        font-style: italic;
    }

    .textpart-expanded .textr-highest-subsection--headline__text::before {
        Content: '\f0d7';
    }

    /**
    SELECTION CONTAINER
     */
    .corpus-text-extractor__selection-container {
    }

    .corpus-text-extractor__selection-block {
        outline: 1px solid #ddd;
    }

    .corpus-text-extractor__selection-block__body .textr-highest-subsection--headline {
        display: none;
    }

    .corpus-text-extractor__selection-block__body {
        line-height: 1.5rem;
        max-height: 5rem;
        font-family: 'Noto Serif';
        overflow-y: hidden;
        color: #666;
    }

    .corpus-text-extractor__selection-block:hover .corpus-text-extractor__selection-block__body {
        color: #000;
    }

    .corpus-text-extractor__selection-block.textblock-expanded .corpus-text-extractor__selection-block__body {
        max-height: 15rem;
        overflow-y: scroll;
    }

    .icon-compress {
        display: none
    }

    .textblock-expanded .icon-compress {
        display: inline-block;
    }

    .textblock-expanded .icon-expand {
        display: none;
    }

    .corpus-text-extractor__selection-block__footer {
        padding: 0.25rem;
        background: #f1f1f1;
    }

    .corpus-text-extractor__selection-block__footer__actions__remove-button {
        width: 2rem;
        cursor: pointer;
        font-size: 1rem;
    }

    .corpus-text-extractor__selection-block__footer__actions button:hover {
        color: #B22E2F;
    }

    /**
    GENERAL TEI FORMATTING
    */
    q, sic, hi {
        font-style: italic;
    }

    ref, note, sic {
        display: none;
    }

    label[rend="opener"] {
        font-style: italic;
    }

    l[rend="indent"] .line-number {
        margin-right: 1.5rem;
    }
    /**
    HIDDEN ELEMENTS
    */
    .textr-head {
        display: none;
    }

</style>
